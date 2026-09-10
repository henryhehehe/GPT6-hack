import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {geometryOnlyGlb} from './helpers/glbGeometry';
import {disposeModelResources} from '../components/worlds/scene/externalModels';

/** Check the actual exported cloth, including every stored animation key interval. */
test('Alexandria draped clothing remains stable through idle, greeting and conversation',async()=>{
 for(const id of ['dorian','thaleia','ione']){
  const bytes=await readFile(new URL(`public/models/characters/${id}.glb`,new URL(process.env.CW_CLOTHING_ROOT?`file://${process.env.CW_CLOTHING_ROOT}/`: '../',import.meta.url)));
  const gltf=await new GLTFLoader().parseAsync(geometryOnlyGlb(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),'');
  const cloth:THREE.SkinnedMesh[]=[];const skeletons=new Set<THREE.Skeleton>();
  gltf.scene.traverse(object=>{if(object instanceof THREE.SkinnedMesh){skeletons.add(object.skeleton);const materials=Array.isArray(object.material)?object.material:[object.material];if(materials.some(m=>/CW_(Linen|Wool)/i.test(m.name)))cloth.push(object);}});
  assert.ok(cloth.length>0,`${id}: exported cloth uses its dedicated surface material`);
  gltf.scene.updateMatrixWorld(true);skeletons.forEach(s=>s.update());
  const surfaces=cloth.map(mesh=>{
   const p=mesh.geometry.getAttribute('position');
   const rest=Array.from({length:p.count},(_,i)=>mesh.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld));
   const index=mesh.geometry.index,edges=new Map<string,[number,number,number]>();
   for(let i=0;i<(index?.count??p.count);i+=3){
    const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);
    for(let j=0;j<3;j++){const a=Math.min(ids[j],ids[(j+1)%3]),b=Math.max(ids[j],ids[(j+1)%3]);const length=rest[a].distanceTo(rest[b]);if(length>.004)edges.set(`${a}:${b}`,[a,b,length]);}
   }
   return {mesh,rest,edges:[...edges.values()]};
  });
  const mixer=new THREE.AnimationMixer(gltf.scene);
  try{
   for(const clip of gltf.animations){
    mixer.stopAllAction();mixer.clipAction(clip).reset().play();
    for(let frame=0;frame<=16;frame++){
     mixer.setTime(clip.duration*frame/16);gltf.scene.updateMatrixWorld(true);skeletons.forEach(s=>s.update());
     for(const {mesh,rest,edges} of surfaces){
      const posed=rest.map((_,i)=>mesh.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld));
      assert.ok(posed.every(p=>p.toArray().every(Number.isFinite)),`${id}/${clip.name}: finite cloth vertices`);
      const stretches=edges.map(([a,b,length])=>posed[a].distanceTo(posed[b])/length).sort((a,b)=>a-b);
      assert.ok(stretches.at(-1)!<2.5,`${id}/${clip.name}: no extreme cloth stretching (${stretches.at(-1)})`);
      assert.ok(stretches[Math.floor(stretches.length*.99)]<1.6,`${id}/${clip.name}: broad cloth surfaces retain their shape`);
      assert.ok(posed.every((p,i)=>p.distanceTo(rest[i])<.65),`${id}/${clip.name}: garment stays attached to the body`);
     }
    }
   }
  }finally{mixer.stopAllAction();mixer.uncacheRoot(gltf.scene);skeletons.forEach(s=>s.dispose());disposeModelResources(gltf.scene);}
 }
});
