import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES} from '../lib/worldThemes';
import {addThemeAtmosphere,WORLD_WEATHER} from '../components/worlds/scene/themeAtmosphere';
import {themeViews} from '../components/worlds/scene/themeViews';

test('atmosphere is bounded, repeatable, non-interactive and removed for reduced motion',()=>{
 for(const [id,profile] of Object.entries(WORLD_WEATHER)){
  const scene=new THREE.Scene(),a=addThemeAtmosphere(scene,WORLD_THEMES[id]),b=addThemeAtmosphere(new THREE.Scene(),WORLD_THEMES[id]);
  const points=a.root.children[0] as THREE.Points;
  const position=points.geometry.getAttribute('position');assert.equal(position.count,profile.count);
  a.update(93,false);b.update(93,false);
  assert.deepEqual(position.array,(b.root.children[0] as THREE.Points).geometry.getAttribute('position').array);
  for(const time of [0,12,1000,NaN,Infinity]){
   a.update(time,false);assert.ok([...position.array].every(Number.isFinite));
   for(let i=0;i<position.count;i++)assert.ok(Math.abs(position.getX(i))<31&&Math.abs(position.getZ(i))<45&&position.getY(i)>=0&&position.getY(i)<15,id);
  }
  const ray=new THREE.Raycaster(new THREE.Vector3(0,30,0),new THREE.Vector3(0,-1,0));ray.params.Points.threshold=100;
  assert.equal(ray.intersectObject(a.root,true).length,0,'Weather must not intercept evidence picking');
  a.update(20,true);assert.equal(a.root.visible,false);
  a.update(20,false);assert.equal(a.root.visible,true);
  let geometryDisposals=0,materialDisposals=0;points.geometry.addEventListener('dispose',()=>geometryDisposals++);
  (points.material as THREE.Material).addEventListener('dispose',()=>materialDisposals++);
  a.dispose();a.dispose();b.dispose();assert.equal(scene.children.length,0);assert.equal(geometryDisposals,1);assert.equal(materialDisposals,1);
 }
});

test('each generated work has two distinct, finite, elevated scenic camera poses',()=>{
 const signatures=new Set<string>();
 for(const theme of Object.values(WORLD_THEMES).filter(t=>t.id!=='alexandria')){
  const views=themeViews(theme);assert.equal(views.length,2,theme.id);
  for(const view of views){
   assert.ok([...view.position,...view.target].every(Number.isFinite));assert.ok(view.position[1]>=10);
   const distance=new THREE.Vector3(...view.position).distanceTo(new THREE.Vector3(...view.target));assert.ok(distance>=12&&distance<=85);
   const signature=JSON.stringify([view.position,view.target]);assert.ok(!signatures.has(signature));signatures.add(signature);
  }
 }
});
