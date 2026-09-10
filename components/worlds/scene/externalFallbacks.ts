import * as THREE from 'three';
import type {ExternalPlacement} from './externalLayout';
type Asset={id:string;category:string;dimensions:number[]};

/** Keep tabletop objects visible if a furniture GLB is still loading or unavailable. */
export function externalFallback(asset:Asset,placement:ExternalPlacement):THREE.Object3D{
 const [w,h,d]=asset.dimensions;
 const material=new THREE.MeshStandardMaterial({color:asset.category==='rock'?'#7f8277':'#997953',roughness:.95});
 const canopy=asset.id==='quaternius-fantasy-props-stall-empty';
 const top=canopy?.88818:asset.id==='quaternius-fantasy-props-table-large'?.62826:asset.id==='polyhaven-wooden_table_02'?1.55057:null;
 if(top!==null){
  const group=new THREE.Group();group.name=`fallback:${placement.key}`;group.userData.externalFallback=true;
  const box=(x:number,y:number,z:number,width:number,height:number,depth:number)=>{
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  };
  const thickness=Math.min(.08,top*.12),post=Math.min(.09,w*.08,d*.12);
  box(0,top-thickness/2,0,w,thickness,d);
  for(const x of [-1,1])for(const z of [-1,1]){
   const height=canopy?h:top-thickness;
   box(x*(w-post)/2,height/2,z*(d-post)/2,post,height,post);
  }
  if(canopy)box(0,h-.04,0,w,.08,d);
  return group;
 }
 const trunk=placement.trunkRadius;
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(trunk?trunk*2:Math.max(.06,w),Math.max(.025,h),trunk?trunk*2:Math.max(.06,d)),material);
 mesh.position.y=h/2;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.externalFallback=true;
 return mesh;
}
