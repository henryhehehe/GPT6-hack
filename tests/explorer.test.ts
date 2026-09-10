import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createExplorer } from '../components/worlds/scene/explorer';

class Surface extends EventTarget {
  tabIndex=-1;hidden=false;
  setAttribute(){} focus(){} setPointerCapture(){}
}
function setup(){
  const canvas=new Surface(),win=new Surface(),doc=new Surface();
  Object.defineProperty(globalThis,'window',{value:win,configurable:true});
  Object.defineProperty(globalThis,'document',{value:doc,configurable:true});
  const camera=new PerspectiveCamera(37);camera.position.set(55,43,63);
  const orbit={enabled:true,target:new Vector3(),update(){}};
  const c=createExplorer(camera,orbit as unknown as OrbitControls,canvas as unknown as HTMLCanvasElement,{mode(){},nearby(){},inspect(){}});
  const key=(type:string,code:string,target:Surface=canvas)=>target.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{code,repeat:false,ctrlKey:false,altKey:false,metaKey:false}));
  return {camera,orbit,c,canvas,win,doc,key};
}

test('walking switches camera mode and restores the saved overview pose',()=>{
  const {camera,orbit,c}=setup();c.mode(true);assert.equal(orbit.enabled,false);assert.equal(camera.fov,60);
  c.input('forward',true);c.update(.05);c.mode(false);
  assert.deepEqual(camera.position.toArray(),[55,43,63]);assert.equal(camera.fov,37);assert.equal(orbit.enabled,true);c.dispose();
});
test('diagonal movement has the same speed as straight movement',()=>{
  function distance(diagonal:boolean){const {camera,c}=setup();c.mode(true);const start=camera.position.clone();c.input('forward',true);if(diagonal)c.input('right',true);c.update(.05);const d=Math.hypot(camera.position.x-start.x,camera.position.z-start.z);c.dispose();return d;}
  assert.ok(Math.abs(distance(false)-distance(true))<1e-6);
});
test('keyboard movement is scoped to the focused canvas and stops on blur',()=>{
  const {camera,c,canvas,win,key}=setup();c.mode(true);key('keydown','KeyW',win);c.update(.05);assert.equal(camera.position.z,8);
  key('keydown','KeyW');c.update(.05);assert.ok(camera.position.z<8);canvas.dispatchEvent(new Event('blur'));const z=camera.position.z;c.update(.05);assert.equal(camera.position.z,z);c.dispose();
});
test('release, tab hiding and escape never leave movement held',()=>{
  const {camera,c,win,doc,key}=setup();c.mode(true);key('keydown','KeyW');key('keyup','KeyW',win);c.update(.05);assert.equal(camera.position.z,8);
  c.input('forward',true);doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));c.update(.05);assert.equal(camera.position.z,8);
  key('keydown','Escape');assert.equal(c.walking,false);c.dispose();
});
test('invalid and stalled frame deltas cannot cause a movement jump',()=>{
  const {camera,c}=setup();c.mode(true);c.input('forward',true);c.update(NaN);c.update(-100);assert.equal(camera.position.z,8);
  c.update(100);assert.ok(camera.position.z>=7.75);c.dispose();
});
test('disposing the controller removes keyboard handlers',()=>{
  const {c,key,canvas}=setup();c.mode(true);c.dispose();assert.equal(canvas.tabIndex,-1);assert.equal(key('keydown','KeyW'),true);
});

test('authored arrival direction faces the relocated companion instead of a harbor-specific angle',()=>{
 const {canvas,win,c:legacy}=setup();legacy.dispose();
 const camera=new PerspectiveCamera(),orbit={enabled:true,target:new Vector3(),update(){}};
 const points={harbor:{x:4,z:2},market:{x:1,z:2},library:{x:1,z:1}};
 const c=createExplorer(camera,orbit as unknown as OrbitControls,canvas as unknown as HTMLCanvasElement,{mode(){},nearby(){},inspect(){}},{groundHeight:()=>0,moveWalker:p=>p,spawns:points,approach:points,facing:{harbor:Math.PI/2,market:Math.PI,library:0}});
 c.mode(true);c.focus('harbor');assert.ok(camera.getWorldDirection(new Vector3()).distanceTo(new Vector3(-1,0,0))<1e-8);
 c.focus('market');assert.ok(camera.getWorldDirection(new Vector3()).distanceTo(new Vector3(0,0,1))<1e-8);
 assert.deepEqual(camera.position.toArray().filter((_,i)=>i!==1),[1,2]);c.dispose();void win;
});
