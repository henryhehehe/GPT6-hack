import test from 'node:test';
import {geometryOnlyGlb} from './helpers/glbGeometry';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {CHARACTER_ACTIVITY_RADIUS,createCharacterActivity,sampleCharacterActivity} from '../components/worlds/scene/characterActivity';
import {WORLD_THEMES} from '../lib/worldThemes';

function rig(){
  const anchor=new THREE.Group(),mover=new THREE.Group(),model=new THREE.Group(),pelvis=new THREE.Bone();
  anchor.position.set(3,0,-2);anchor.rotation.y=.6;anchor.add(mover);mover.add(model);model.add(pelvis);pelvis.name='Pelvis';pelvis.position.y=.88;
  const feet:THREE.Bone[]=[];
  for(const [index,side] of ['L','R'].entries()){
    const thigh=new THREE.Bone(),shin=new THREE.Bone(),foot=new THREE.Bone();
    thigh.name=`Thigh.${side}`;shin.name=`Shin.${side}`;foot.name=`Foot.${side}`;
    thigh.position.x=index===0?-.125:.125;thigh.rotation.x=Math.PI;shin.position.y=.39;foot.position.y=.36;
    pelvis.add(thigh);thigh.add(shin);shin.add(foot);feet.push(foot);
  }
  const head=new THREE.Bone();head.name='Head';head.position.y=.65;pelvis.add(head);
  return {anchor,mover,model,pelvis,feet,head};
}

test('every theme stays inside reserved clearance with continuous, distinct, staggered routes',()=>{
  const starts=new Set<string>(),routes=new Set<string>();
  for(const theme of Object.keys(WORLD_THEMES))for(let actor=0;actor<3;actor++){
    let previous=sampleCharacterActivity(theme,actor,0);
    for(let t=0;t<80;t+=.02){
      const sample=sampleCharacterActivity(theme,actor,t);
      assert.ok(Math.hypot(sample.x,sample.z)<CHARACTER_ACTIVITY_RADIUS,`${theme} clearance`);
      assert.ok(Math.hypot(sample.x-previous.x,sample.z-previous.z)<.013,`${theme} no position jumps`);
      for(const foot of [sample.left,sample.right])assert.ok(foot.y>=0&&foot.y<=.042001);
      if(!sample.moving){assert.equal(sample.left.y,0);assert.equal(sample.right.y,0);}
      previous=sample;
    }
    routes.add(JSON.stringify(sampleCharacterActivity(theme,actor,5)));
    starts.add(JSON.stringify(sampleCharacterActivity(theme,actor,2)));
    for(const t of [NaN,Infinity,-10,1e9])assert.ok(Object.values(sampleCharacterActivity(theme,actor,t)).filter(v=>typeof v==='number').every(Number.isFinite));
  }
  assert.ok(routes.size>=20);assert.ok(starts.size>=8);
});

test('stance feet remain planted while the body moves; pausing freezes the exact position and resume does not catch up',()=>{
  const r=rig(),motion=createCharacterActivity(r.model,r.mover,'christmas-carol',0),initial=r.anchor.position.clone();
  const rests=r.feet.map(foot=>r.mover.worldToLocal(foot.getWorldPosition(new THREE.Vector3())));
  let elapsed=0,moved=false,planted=0;
  for(let frame=0;frame<650;frame++){
    motion.restore();motion.apply(.02,false,false);elapsed+=.02;
    const sample=sampleCharacterActivity('christmas-carol',0,elapsed);moved ||= r.mover.position.length()>.2;
    for(const [i,foot] of r.feet.entries()){
      const p=i===0?sample.left:sample.right;
      const expected=r.anchor.localToWorld(rests[i].clone().add(new THREE.Vector3(p.x,p.y,p.z)));
      const actual=foot.getWorldPosition(new THREE.Vector3());
      assert.ok(actual.distanceTo(expected)<.0001,`foot ${i} hits its planted/lifted target at ${elapsed.toFixed(2)}: ${actual.distanceTo(expected)}`);
      if(p.y===0)planted++;
    }
    assert.ok(r.anchor.position.equals(initial),'navigation anchor never moves');
  }
  assert.ok(moved&&planted>650);
  const location=r.mover.position.clone(),footPositions=r.feet.map(foot=>foot.getWorldPosition(new THREE.Vector3()));
  for(let i=0;i<100;i++){motion.restore();motion.apply(.1,true,true);}
  assert.ok(r.mover.position.equals(location));
  r.feet.forEach((foot,i)=>assert.ok(foot.getWorldPosition(new THREE.Vector3()).distanceTo(footPositions[i])<1e-7));
  motion.restore();motion.apply(.02,false,false);assert.ok(r.mover.position.distanceTo(location)<.01,'resume advances one frame only');
  motion.dispose();assert.ok(r.mover.position.length()===0);assert.equal(r.pelvis.position.y,.88);
});

test('unknown rigs stay at their anchors and existing authored poses are restored before each mixer tick',()=>{
  const unknown=new THREE.Group(),mover=new THREE.Group();mover.add(unknown);const fallback=createCharacterActivity(unknown,mover,'unknown',0);
  fallback.apply(.1,false,false);assert.equal(fallback.supported,false);assert.equal(mover.position.length(),0);fallback.dispose();
  const r=rig(),motion=createCharacterActivity(r.model,r.mover,'austen-letter',1),authored=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),.18);
  r.head.quaternion.copy(authored);
  for(let i=0;i<1000;i++){motion.apply(.1,false,false);motion.restore();assert.ok(r.head.quaternion.angleTo(authored)<1e-6);}
  motion.dispose();
});

test('authored GLB skeleton supports stable foot placement under normalized and rotated parents',async()=>{
  const bytes=await readFile(new URL('../public/models/characters/dorian.glb',import.meta.url));
  const gltf=await new GLTFLoader().parseAsync(geometryOnlyGlb(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),'');
  const anchor=new THREE.Group(),mover=new THREE.Group(),normalized=new THREE.Group();
  anchor.rotation.y=1.1;anchor.position.set(-8,.05,7);normalized.scale.setScalar(.94);anchor.add(mover);mover.add(normalized);normalized.add(gltf.scene);
  const motion=createCharacterActivity(gltf.scene,mover,'odyssey-ix',0);assert.ok(motion.supported);
  const bones:THREE.Bone[]=[];gltf.scene.traverse(o=>{if(o instanceof THREE.Bone)bones.push(o);});
  const feet=bones.filter(b=>/^Foot[LR]$/.test(b.name)),rest=feet.map(foot=>mover.worldToLocal(foot.getWorldPosition(new THREE.Vector3())));
  for(let frame=0;frame<400;frame++){
    motion.restore();motion.apply(.025,false,false);const sample=sampleCharacterActivity('odyssey-ix',0,(frame+1)*.025);
    for(const [i,foot] of feet.entries()){
      const p=foot.name==='FootL'?sample.left:sample.right;
      const expected=anchor.localToWorld(rest[i].clone().add(new THREE.Vector3(p.x,p.y,p.z)));
      assert.ok(foot.getWorldPosition(new THREE.Vector3()).distanceTo(expected)<.0002,`real ${foot.name} ground contact`);
    }
    assert.ok(bones.every(b=>b.quaternion.toArray().every(Number.isFinite)));
  }
  motion.dispose();
});

test('loaded activity freezes for reduced motion, close visitors, and conversation without moving talk anchors',async()=>{
  const {loadThemedCharacters}=await import('../components/worlds/scene/themedCharacters');
  const bytes=await readFile(new URL('../public/models/characters/dorian.glb',import.meta.url));
  const gltf=await new GLTFLoader().parseAsync(geometryOnlyGlb(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),'');
  const anchors={harbor:new THREE.Group(),market:new THREE.Group(),library:new THREE.Group()};
  let calls=0;const pack=loadThemedCharacters(WORLD_THEMES['odyssey-ix'],anchors,async()=>{if(calls++===0)return gltf;throw new Error('unused');});
  await pack.ready;const wrapper=anchors.harbor.children[0],far=new THREE.Vector3(0,1.6,15);
  for(let i=0;i<35;i++)pack.update(.1,false,far,false);
  assert.ok(wrapper.position.length()>.1,'visible character has stepped aside');
  const position=wrapper.position.clone(),pose=gltf.scene.getObjectByName('FootL')!.quaternion.clone();
  for(let i=0;i<50;i++)pack.update(.1,true,far,false);
  assert.ok(wrapper.position.equals(position));assert.ok(gltf.scene.getObjectByName('FootL')!.quaternion.equals(pose));
  for(let i=0;i<50;i++)pack.update(.1,false,new THREE.Vector3(0,1.6,4),true);
  assert.ok(wrapper.position.equals(position),'visitor within five metres stops travel');
  pack.talk('harbor');for(let i=0;i<5;i++)pack.update(.1,false,far,false);
  assert.ok(wrapper.position.equals(position),'talk pauses excursion');assert.equal(anchors.harbor.position.length(),0);
  pack.dispose();assert.equal(anchors.harbor.children.length,0);
});

test('authored upper-leg surfaces stay attached to the hip through the full gait, preserving all non-skin attributes',async()=>{
  const {correctAuthoredLegWeights}=await import('../components/worlds/scene/characterLegWeights');
  for(const id of ['dorian','georgian-coat','reader-coat','regency-coat']){
    const bytes=await readFile(new URL(`../public/models/characters/${id}.glb`,import.meta.url));
    const gltf=await new GLTFLoader().parseAsync(geometryOnlyGlb(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),'');
    const meshes:THREE.SkinnedMesh[]=[];gltf.scene.traverse(o=>{if(o instanceof THREE.SkinnedMesh)meshes.push(o);});
    const preserved=meshes.map(mesh=>({mesh,material:mesh.material,index:mesh.geometry.index,attributes:{...mesh.geometry.attributes}}));
    assert.equal(correctAuthoredLegWeights(gltf.scene,'external-unverified-character'),0);
    assert.ok(correctAuthoredLegWeights(gltf.scene,id)>50,`${id} upper-leg hose or trousers repaired`);
    assert.equal(correctAuthoredLegWeights(gltf.scene,id),0,'weight repair is idempotent');
    const samples:Array<{mesh:THREE.SkinnedMesh;vertex:number;hip:THREE.Bone;distance:number;index:THREE.BufferAttribute|THREE.InterleavedBufferAttribute;weight:THREE.BufferAttribute|THREE.InterleavedBufferAttribute}>=[];
    for(const saved of preserved){
      const {mesh,attributes}=saved;assert.equal(mesh.material,saved.material);assert.equal(mesh.geometry.index,saved.index);
      for(const [name,value] of Object.entries(attributes))if(name!=='skinIndex'&&name!=='skinWeight')assert.equal(mesh.geometry.getAttribute(name),value,`${id} retains ${name}`);
      const oldIndex=attributes.skinIndex,oldWeight=attributes.skinWeight,position=attributes.position;
      for(let v=0;v<position.count;v++){
        if(oldWeight.getX(v)!==1)continue;
        const shin=mesh.skeleton.bones[oldIndex.getX(v)];if(!/^Shin[LR]$/.test(shin.name)||!(shin.parent instanceof THREE.Bone))continue;
        const thigh=mesh.skeleton.bones.indexOf(shin.parent),hip=new THREE.Vector3().setFromMatrixPosition(mesh.skeleton.boneInverses[thigh].clone().invert());
        const point=new THREE.Vector3().fromBufferAttribute(position,v).applyMatrix4(mesh.bindMatrix);
        if(point.y<hip.y-.12)continue;
        assert.equal(mesh.geometry.getAttribute('skinIndex').getX(v),thigh);assert.equal(mesh.geometry.getAttribute('skinWeight').getX(v),1);
        samples.push({mesh,vertex:v,hip:shin.parent,distance:point.distanceTo(hip)*.94,index:oldIndex,weight:oldWeight});
      }
      const weight=mesh.geometry.getAttribute('skinWeight');for(let v=0;v<weight.count;v++)assert.ok(Math.abs(weight.getX(v)+weight.getY(v)+weight.getZ(v)+weight.getW(v)-1)<1e-6);
    }
    assert.ok(samples.length>30,`${id} tests actual upper-leg surface vertices`);
    const anchor=new THREE.Group(),mover=new THREE.Group(),normalized=new THREE.Group();anchor.rotation.y=.7;anchor.position.set(5,.05,-4);normalized.scale.setScalar(.94);anchor.add(mover);mover.add(normalized);normalized.add(gltf.scene);
    const activity=createCharacterActivity(gltf.scene,mover,'christmas-carol',0);let oldWorstDrift=0;
    for(let frame=0;frame<220;frame++){
      activity.restore();activity.apply(.1,false,false);
      for(const sample of samples){
        const {mesh,vertex,hip,distance}=sample,hipPosition=hip.getWorldPosition(new THREE.Vector3());
        const point=mesh.localToWorld(mesh.getVertexPosition(vertex,new THREE.Vector3()));
        assert.ok(Math.abs(point.distanceTo(hipPosition)-distance)<.0001,`${id} upper leg stays attached near hip during cycle`);
        if(frame%20===0){
          const index=mesh.geometry.getAttribute('skinIndex'),weight=mesh.geometry.getAttribute('skinWeight');
          mesh.geometry.setAttribute('skinIndex',sample.index);mesh.geometry.setAttribute('skinWeight',sample.weight);
          oldWorstDrift=Math.max(oldWorstDrift,mesh.localToWorld(mesh.getVertexPosition(vertex,new THREE.Vector3())).distanceTo(hipPosition)-distance);
          mesh.geometry.setAttribute('skinIndex',index);mesh.geometry.setAttribute('skinWeight',weight);
        }
      }
    }
    assert.ok(oldWorstDrift>.08,`${id} reproduces the old detached rigid-shin surface; repair is meaningful`);activity.dispose();
  }
});
