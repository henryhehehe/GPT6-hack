import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES} from '../lib/worldThemes';
import {addThemeWildlife} from '../components/worlds/scene/themeWildlife';

test('wildlife stays outdoors and garden insects stay over planted beds',()=>{
 for(const id of ['frankenstein','declaration','seneca-falls']){
  const life=addThemeWildlife(new THREE.Scene(),WORLD_THEMES[id]);assert.equal(life.root.children.length,0);life.dispose();
 }
 const life=addThemeWildlife(new THREE.Scene(),WORLD_THEMES['austen-letter']);
 const insects=life.root.children.filter(o=>o.name==='Garden insect');assert.equal(insects.length,6);
 for(let t=0;t<=180;t+=.25){
  life.update(t,false);
  for(const insect of insects){assert.ok(insect.position.y>=1.35&&insect.position.y<=1.95);assert.ok([[0,-5],[9,13],[-13,-3]].some(([x,z])=>Math.abs(insect.position.x-x)<=1.3&&Math.abs(insect.position.z-z)<=.85));}
  for(const bird of life.root.children.filter(o=>o.name==='Gliding bird'))assert.ok(bird.position.y>6,'flight stays above the paths');
 }
 life.dispose();
});

test('wildlife moves deterministically, respects reduced motion and releases shared resources once',()=>{
 const scene=new THREE.Scene(),life=addThemeWildlife(scene,WORLD_THEMES.tempest);
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
 life.root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});
 let freed=0;[...geometries,...materials].forEach(r=>r.addEventListener('dispose',()=>freed++));
 life.update(5,false);const positions=life.root.children.map(o=>o.position.clone());
 life.update(6,false);assert.ok(life.root.children.some((o,i)=>!o.position.equals(positions[i])));
 life.update(5,false);assert.ok(life.root.children.every((o,i)=>o.position.equals(positions[i])));
 life.update(20,true);assert.equal(life.root.visible,false);assert.ok(life.root.children.every((o,i)=>o.position.equals(positions[i])));
 life.update(Number.NaN,false);life.root.traverse(o=>assert.ok([...o.position.toArray(),...o.quaternion.toArray()].every(Number.isFinite)));
 life.dispose();life.dispose();assert.equal(scene.children.length,0);assert.equal(freed,geometries.size+materials.size);
});
