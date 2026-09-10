import * as THREE from 'three';
import {TEACHING_HEIGHTS} from './humanScale';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {ZoneId} from '@/lib/world';

/** Authored characters replace their visible fallbacks only after successful load. */
export function loadTeachingCharacters(npcs:THREE.Group[]){
 let disposed=false;const roots:THREE.Group[]=[],mixers:THREE.AnimationMixer[]=[];
 const files:Record<ZoneId,string>={harbor:'dorian',market:'thaleia',library:'ione'};
 function release(root:THREE.Object3D){const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 for(const npc of npcs){void new GLTFLoader().loadAsync(`/models/characters/${files[npc.userData.character as ZoneId]}.glb`).then(gltf=>{
  if(disposed){release(gltf.scene);return;}
  const model=gltf.scene,bounds=new THREE.Box3().setFromObject(model),height=bounds.max.y-bounds.min.y,scale=TEACHING_HEIGHTS[npc.userData.character as ZoneId]/Math.max(height,.01);model.scale.multiplyScalar(scale);model.position.y-=bounds.min.y*scale;
  model.traverse(o=>{o.userData.character=npc.userData.character;if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});
  npc.children.forEach(child=>{child.visible=false;});npc.add(model);roots.push(model);
  if(gltf.animations.length){const mixer=new THREE.AnimationMixer(model),clip=gltf.animations.find(c=>/idle/i.test(c.name))??gltf.animations[0];mixer.clipAction(clip).play();mixers.push(mixer);}
 }).catch(()=>{/* Existing character remains usable if its model fails. */});}
 return {update(dt:number,reduced:boolean){if(!reduced)mixers.forEach(m=>m.update(dt));},dispose(){disposed=true;mixers.forEach(m=>{m.stopAllAction();m.uncacheRoot(m.getRoot());});roots.forEach(root=>{root.removeFromParent();release(root);});}};
}
