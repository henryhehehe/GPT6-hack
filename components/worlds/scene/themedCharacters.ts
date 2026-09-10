import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import manifest from '@/assets/model-manifest.json';
import type {ZoneId} from '@/lib/world';
import type {WorldTheme} from '@/lib/worldThemes';
import {characterCostume} from '@/lib/characterCostumes';
import {disposeModelResources} from './externalModels';

const zones:ZoneId[]=['harbor','market','library'];
type FetchModel=(url:string)=>Promise<{scene:THREE.Group;animations:THREE.AnimationClip[]}>;
export type ThemedCharacterStatus='ready'|'failed'|'disposed';

/** All model choices are authored here; source text never supplies a model URL. */
export function themedCharacterIds(theme:WorldTheme):Record<ZoneId,string>{
  return {...characterCostume(theme.id).models};
}

/** Each import owns its skeleton/resources. Failed or late loads leave a usable fallback. */
export function loadThemedCharacters(theme:WorldTheme,anchors:Record<ZoneId,THREE.Group>,fetchModel:FetchModel=url=>new GLTFLoader().loadAsync(url)){
  const ids=themedCharacterIds(theme);
  const status:Record<ZoneId,ThemedCharacterStatus>={harbor:'failed',market:'failed',library:'failed'};
  let disposed=false,reducedMotion=false;
  const states=zones.map((zone,index)=>({zone,anchor:anchors[zone],rotation:anchors[zone].quaternion.clone(),
    fallbacks:anchors[zone].children.map(child=>({child,visible:child.visible})),
    model:null as THREE.Group|null,container:null as THREE.Group|null,mixer:null as THREE.AnimationMixer|null,
    idle:null as THREE.AnimationAction|null,gesture:null as THREE.AnimationAction|null,
    clips:[] as THREE.AnimationClip[],greeted:false,height:[1.82,1.72,1.77][index]}));
  const freed=new WeakSet<THREE.Group>();
  function release(model:THREE.Group){
    if(freed.has(model))return;
    freed.add(model);
    const skeletons=new Set<THREE.Skeleton>();
    model.traverse(o=>{if(o instanceof THREE.SkinnedMesh)skeletons.add(o.skeleton);});
    skeletons.forEach(s=>s.dispose());
    disposeModelResources(model);
  }
  type State=typeof states[number];
  function gesture(state:State,name:'Greeting'|'Talk'){
    if(disposed||reducedMotion||!state.mixer)return;
    const clip=state.clips.find(c=>c.name.toLowerCase()===name.toLowerCase());
    if(!clip)return;
    state.gesture?.stop();state.idle?.stop();
    state.gesture=state.mixer.clipAction(clip).reset().setLoop(THREE.LoopOnce,1);
    state.gesture.clampWhenFinished=true;
    state.gesture.play();
  }
  const ready=Promise.all(states.map(async state=>{
    let model:THREE.Group|null=null;
    try{
      const id=ids[state.zone];
      const asset=manifest.assets.find(a=>a.id===id&&a.category==='characters');
      if(!asset||asset.url!==`/models/characters/${id}.glb`||! /^[a-f0-9]{64}$/.test(asset.sha256))return;
      const gltf=await fetchModel(`${asset.url}?v=${asset.sha256.slice(0,12)}`);
      model=gltf.scene;
      if(disposed){release(model);status[state.zone]='disposed';return;}
      let skinned=false;
      model.traverse(o=>{if(o instanceof THREE.SkinnedMesh&&o.skeleton?.bones.length)skinned=true;});
      const bounds=new THREE.Box3().setFromObject(model,true),height=bounds.max.y-bounds.min.y;
      if(!skinned||!Number.isFinite(height)||height<=.01||!bounds.min.toArray().concat(bounds.max.toArray()).every(Number.isFinite))throw new Error('Invalid authored character');
      // Normalize in a wrapper so root animation tracks cannot undo the ground offset.
      const container=new THREE.Group(),scale=state.height/height;
      container.name=`ThemedCharacter:${id}`;container.userData.npc=state.zone;
      container.scale.setScalar(scale);
      container.position.set(-(bounds.min.x+bounds.max.x)*.5*scale,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*.5*scale);
      container.add(model);
      model.traverse(o=>{o.userData.npc=state.zone;if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});
      state.model=model;state.container=container;state.clips=gltf.animations;
      state.mixer=new THREE.AnimationMixer(model);
      const idle=gltf.animations.find(c=>c.name.toLowerCase()==='idle');
      if(idle)state.idle=state.mixer.clipAction(idle).setLoop(THREE.LoopRepeat,Infinity).play();
      state.mixer.addEventListener('finished',event=>{
        if(disposed||event.action!==state.gesture)return;
        state.gesture.stop();state.gesture=null;state.idle?.reset().play();
      });
      state.anchor.add(container);
      state.fallbacks.forEach(({child})=>{child.visible=false;});
      status[state.zone]='ready';
    }catch{
      state.mixer?.stopAllAction();
      if(model){state.mixer?.uncacheRoot(model);release(model);}
      state.container?.removeFromParent();state.model=null;state.container=null;state.mixer=null;
      state.fallbacks.forEach(({child,visible})=>{child.visible=visible;});
      status[state.zone]=disposed?'disposed':'failed';
    }
  })).then(()=>({...status}));
  const cameraLocal=new THREE.Vector3(),anchorWorld=new THREE.Vector3();
  return {
    ready,
    update(dt:number,reduced:boolean,cameraPosition:THREE.Vector3,walking:boolean){
      if(disposed)return;
      reducedMotion=reduced;
      const step=Number.isFinite(dt)?THREE.MathUtils.clamp(dt,0,.1):0;
      for(const state of states){
        state.anchor.getWorldPosition(anchorWorld);
        const distance=Math.hypot(cameraPosition.x-anchorWorld.x,cameraPosition.z-anchorWorld.z);
        if(distance>5)state.greeted=false;
        if(reduced)continue;
        if(walking&&distance<3.2&&state.model){
          if(!state.greeted){if(!state.gesture)gesture(state,'Greeting');state.greeted=true;}
          cameraLocal.copy(cameraPosition);
          state.anchor.parent?.worldToLocal(cameraLocal);
          const dx=cameraLocal.x-state.anchor.position.x,dz=cameraLocal.z-state.anchor.position.z;
          if(Math.hypot(dx,dz)>.05){
            const target=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(target-state.anchor.rotation.y),Math.cos(target-state.anchor.rotation.y));
            state.anchor.rotation.y+=THREE.MathUtils.clamp(delta,-step*1.4,step*1.4);
          }
        }
        state.mixer?.update(step);
      }
    },
    talk(zone:ZoneId){const state=states.find(s=>s.zone===zone);if(state)gesture(state,'Talk');},
    dispose(){
      if(disposed)return;disposed=true;
      for(const state of states){
        state.mixer?.stopAllAction();
        if(state.model){state.mixer?.uncacheRoot(state.model);state.container?.removeFromParent();release(state.model);}
        state.fallbacks.forEach(({child,visible})=>{child.visible=visible;});
        state.anchor.quaternion.copy(state.rotation);
        status[state.zone]='disposed';
      }
    },
  };
}
