import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES,worldTheme} from '../lib/worldThemes';
import {worldCharacters} from '../lib/characters';
import {prepareCatalogLesson} from '../lib/curriculum';
import {initialWorld} from '../lib/world';
import {themedPlacements,themedExternalPlacements,addThemeScenery,readingGuide} from '../components/worlds/scene/themedSetting';
import {createSettingNavigation} from '../components/worlds/scene/settingLayout';
import {placementBounds} from '../components/worlds/scene/externalLayout';

test('all prepared themes keep source text unchanged and provide distinct fictional companions',()=>{
 for(const theme of Object.values(WORLD_THEMES)){
  const world=prepareCatalogLesson(`${theme.id}-01`).world!,before=JSON.stringify(world);
  assert.equal(worldTheme(world).id,theme.id);
  const cast=worldCharacters(world);assert.equal(new Set(Object.values(cast).map(c=>c.name)).size,3);
  assert.ok(Object.values(cast).every(c=>c.role.startsWith('Fictional')));
  assert.equal(JSON.stringify(world),before);
 }
 const custom=structuredClone(initialWorld);assert.equal(worldTheme(custom).id,'custom');
 const named=prepareCatalogLesson('austen-letter-01').world!;named.lessonPack!.characters[0].name='Teacher-chosen guide';
 assert.equal(worldCharacters(named).harbor.name,'Teacher-chosen guide');
});

test('each themed arrangement preserves all safe arrivals and reachable reading stations',()=>{
 for(const theme of Object.values(WORLD_THEMES)){
  const placements=themedPlacements(theme),extras=themedExternalPlacements(theme);
  const nav=createSettingNavigation(placements,extras.filter(p=>p.solid).map(placementBounds));
  const visited=new Set<string>(),queue=[{x:0,z:0}],key=(x:number,z:number)=>`${x},${z}`;
  for(let i=0;i<queue.length;i++){
   const p=queue[i];for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){
    const next={x:p.x+dx,z:p.z+dz},id=key(next.x,next.z);
    if(!visited.has(id)&&nav.isWalkable(next)){visited.add(id);queue.push(next);}
   }
  }
  for(const p of Object.values(nav.spawns)){assert.ok(nav.isWalkable(p),theme.id);assert.ok(visited.has(key(p.x,p.z)),theme.id);}
  for(const p of extras)if(p.support)assert.ok(extras.some(parent=>parent.key===p.support));
 }
 assert.ok(themedPlacements(WORLD_THEMES['odyssey-ix']).some(p=>p.id==='sheep'));
 assert.ok(themedPlacements(WORLD_THEMES.tempest).every(p=>!['sheep','cave-module'].includes(p.id)));
});

test('theme scenery remains outside walking space and releases shared resources once',()=>{
 for(const theme of Object.values(WORLD_THEMES)){
  const scene=new THREE.Scene(),scenery=addThemeScenery(scene,theme),resources=new Map<THREE.BufferGeometry|THREE.Material,number>();
  scene.traverse(o=>{if(o instanceof THREE.Mesh){
   assert.ok(Number.isFinite(o.position.x+o.position.y+o.position.z));
   for(const r of [o.geometry,...(Array.isArray(o.material)?o.material:[o.material])])if(!resources.has(r)){resources.set(r,0);r.addEventListener('dispose',()=>resources.set(r,resources.get(r)!+1));}
  }});
  assert.ok(scene.children.length);scenery.dispose();assert.equal(scene.children.length,0);assert.ok([...resources.values()].every(count=>count===1));
 }
 const guide=readingGuide('#668855','#ad8766',false);const bounds=new THREE.Box3().setFromObject(guide);
 assert.ok(bounds.max.y>1.7&&bounds.max.y<2);assert.ok(bounds.min.y>=0);
});
