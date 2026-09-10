import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import index from '@/lib/externalAssetIndex.json';
import type { ExternalPlacement } from './externalLayout';
import type { ZoneId } from '@/lib/world';

const assets = new Map(index.map(a => [a.id,a]));
type FetchModel = (url:string) => Promise<{scene:THREE.Group}>;

/** Release textures as well as meshes. Cloned instances share the source ownership. */
export function disposeModelResources(root:THREE.Object3D) {
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    geometries.add(object.geometry);
    for(const material of Array.isArray(object.material)?object.material:[object.material]){
      materials.add(material);
      for(const value of Object.values(material))if(value instanceof THREE.Texture)textures.add(value);
    }
  });
  const images=new Set<unknown>();
  textures.forEach(texture=>{texture.dispose();if(texture.image)images.add(texture.image);});
  images.forEach(image=>{if(typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap)image.close();});
  materials.forEach(material=>material.dispose());geometries.forEach(geometry=>geometry.dispose());
}

/** Scene-owned cache: one request per asset, bounded parallelism, safe late completion. */
export class ExternalModelDepot {
  private pending=new Map<string,Promise<THREE.Group|null>>();
  private queue:{run:()=>Promise<void>;cancel:()=>void}[]=[];
  private sources=new Set<THREE.Group>();
  private active=0;
  private disposed=false;
  constructor(private fetchModel:FetchModel=(url)=>new GLTFLoader().loadAsync(url)){}
  load(id:string):Promise<THREE.Group|null>{
    const existing=this.pending.get(id);if(existing)return existing;
    const asset=assets.get(id);
    // Undressed bases, assembly components and unreviewed ships never enter a lesson.
    if(this.disposed||!asset||asset.classroomStatus!=='scene-eligible')return Promise.resolve(null);
    const promise=new Promise<THREE.Group|null>(resolve=>{
      this.queue.push({cancel:()=>resolve(null),run:async()=>{
        try{
          const {scene}=await this.fetchModel(`${asset.url}?v=${asset.sha256.slice(0,12)}`);
          if(this.disposed){disposeModelResources(scene);resolve(null);return;}
          let skinned=false;
          scene.traverse(o=>{if(o instanceof THREE.SkinnedMesh)skinned=true;});
          if(skinned){disposeModelResources(scene);resolve(null);return;}
          this.sources.add(scene);resolve(scene);
        }catch{resolve(null);}
      }});
    });
    this.pending.set(id,promise);this.pump();return promise;
  }
  private pump(){
    while(!this.disposed&&this.active<3&&this.queue.length){
      const item=this.queue.shift()!;this.active++;
      void item.run().finally(()=>{this.active--;this.pump();});
    }
  }
  dispose(){
    if(this.disposed)return;this.disposed=true;
    this.queue.splice(0).forEach(item=>item.cancel());
    this.sources.forEach(disposeModelResources);this.sources.clear();this.pending.clear();
  }
}

/** Optional dressing is immediately represented by bounded, inspectable fallbacks. */
export function loadExternalModels(parent:THREE.Object3D,placements:readonly ExternalPlacement[]){
  const depot=new ExternalModelDepot(),root=new THREE.Group();root.name='ExternalSceneArt';parent.add(root);
  const interactables:THREE.Object3D[]=[],stock:{object:THREE.Group;zone:'harbor'|'market'}[]=[];
  const placeholders=new Set<THREE.Mesh>();
  let disposed=false;
  for(const placement of placements){
    const asset=assets.get(placement.asset);if(!asset||asset.classroomStatus!=='scene-eligible')continue;
    const group=new THREE.Group();group.name=placement.key;group.position.set(...placement.at);group.rotation.y=placement.turn??0;group.scale.setScalar(placement.scale??1);
    group.userData.assetId=asset.id;group.userData.externalZone=placement.zone;root.add(group);
    const [w,h,d]=asset.dimensions;
    // A trunk-sized fallback matches navigation while the broad canopy loads.
    const trunk=placement.trunkRadius;
    const fallback=new THREE.Mesh(new THREE.BoxGeometry(trunk ? trunk*2 :Math.max(.06,w),Math.max(.025,h),trunk ? trunk*2 :Math.max(.06,d)),
      new THREE.MeshStandardMaterial({color:asset.category==='rock'?'#7f8277':'#997953',roughness:.95}));
    fallback.position.y=h/2;fallback.castShadow=true;fallback.receiveShadow=true;
    group.add(fallback);placeholders.add(fallback);
    if(placement.zone)interactables.push(group);
    if(placement.activity)stock.push({object:group,zone:placement.activity});
    void depot.load(asset.id).then(source=>{
      if(disposed||!source)return;
      const clone=source.clone(true);
      clone.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true;}});
      group.add(clone);group.remove(fallback);disposeModelResources(fallback);placeholders.delete(fallback);
    });
  }
  return {
    root,
    /** Raycast groups recursively, then resolve parents. This also works on fallbacks. */
    inspect(ray:THREE.Raycaster):ZoneId|null{
      const hit=ray.intersectObjects(interactables,true).find(h=>{
        for(let o:THREE.Object3D|null=h.object;o;o=o.parent)if(!o.visible)return false;
        return true;
      });
      for(let object:THREE.Object3D|null=hit?.object??null;object&&object!==root;object=object.parent)
        if(object.userData.externalZone)return object.userData.externalZone as ZoneId;
      return null;
    },
    update(blend:number,harbor:number,market:number){
      for(const zone of ['harbor','market'] as const){
        const items=stock.filter(s=>s.zone===zone),activity=THREE.MathUtils.clamp(zone==='harbor'?harbor:market,0,1);
        items.forEach(({object},i)=>{object.visible=i/items.length<1-blend*(1-activity);});
      }
    },
    dispose(){if(disposed)return;disposed=true;parent.remove(root);placeholders.forEach(disposeModelResources);placeholders.clear();depot.dispose();},
  };
}
