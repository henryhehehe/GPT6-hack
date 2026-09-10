import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCharacterIdleMotion} from '../components/worlds/scene/characterIdleMotion';

function rig(){
  const root=new THREE.Group(),head=new THREE.Bone(),spine=new THREE.Bone(),foot=new THREE.Bone();
  head.name='Head';spine.name='Spine';foot.name='Foot.L';root.add(spine,foot);spine.add(head);head.position.y=1.5;
  return {root,head,spine,foot};
}
test('ambient rig movement is bounded, varies by companion, and does not drift or move feet',()=>{
  const a=rig(),b=rig(),motion=createCharacterIdleMotion(a.root,0),other=createCharacterIdleMotion(b.root,2.17);
  const originalRoot=a.root.position.clone(),originalFoot=a.foot.quaternion.clone(),rest=a.head.quaternion.clone();
  motion.apply(4,false,false);const pose=a.head.quaternion.clone();other.apply(4,false,false);
  assert.ok(!pose.equals(b.head.quaternion),'different phases avoid a synchronized cast');
  for(let i=0;i<1000;i++)motion.apply(4,false,false);
  assert.ok(a.head.quaternion.angleTo(pose)<1e-6,'offset cannot accumulate');
  for(const t of [0,10,100,10000,NaN,Infinity]){
    motion.apply(t,false,false);assert.ok(a.head.quaternion.angleTo(rest)<.12);assert.ok(a.spine.quaternion.angleTo(rest)<.02);
    assert.ok(a.head.quaternion.toArray().every(Number.isFinite));
  }
  assert.ok(a.root.position.equals(originalRoot));assert.ok(a.foot.quaternion.equals(originalFoot));
  motion.dispose();other.dispose();assert.ok(a.head.quaternion.angleTo(rest)<1e-6);
});
test('gestures retain their authored pose and nearby attention reduces idle glances',()=>{
  const a=rig(),motion=createCharacterIdleMotion(a.root,.9),rest=a.head.quaternion.clone();
  motion.apply(4,false,false);const glance=a.head.quaternion.angleTo(rest);
  motion.apply(4,true,false);assert.ok(a.head.quaternion.angleTo(rest)<glance);
  motion.restore();const gesture=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),.2);a.head.quaternion.copy(gesture);
  motion.apply(4,true,true);assert.ok(a.head.quaternion.equals(gesture));
  motion.restore();a.head.quaternion.copy(gesture);motion.apply(8,true,false);motion.restore();assert.ok(a.head.quaternion.equals(gesture),'mixer pose restored before the next sample');
});
