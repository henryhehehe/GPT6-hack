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
import {themeLayout,THEME_LAYOUTS} from '../components/worlds/scene/themeLayouts';
import {addThemeArchitecture} from '../components/worlds/scene/themeArchitecture';
import externalAssets from '../lib/externalAssetIndex.json';

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
  const architecture=addThemeArchitecture(new THREE.Scene(),theme);
  const nav=createSettingNavigation(placements,[...architecture.obstacles,...extras.filter(p=>p.solid).map(placementBounds)],themeLayout(theme));
  assert.ok(nav.isWalkable({x:1,z:8}),`${theme.id}: explorer initial position`);
  const visited=new Set<string>(),queue=[{x:0,z:0}],key=(x:number,z:number)=>`${x},${z}`;
  for(let i=0;i<queue.length;i++){
   const p=queue[i];for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){
    const next={x:p.x+dx,z:p.z+dz},id=key(next.x,next.z);
    if(!visited.has(id)&&nav.isWalkable(next)){visited.add(id);queue.push(next);}
   }
  }
  for(const p of [...Object.values(nav.spawns),...Object.values(nav.approach)]){assert.ok(nav.isWalkable(p),theme.id);assert.ok(queue.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<.75&&Math.hypot(nav.moveWalker(q,{x:p.x-q.x,z:p.z-q.z}).x-p.x,nav.moveWalker(q,{x:p.x-q.x,z:p.z-q.z}).z-p.z)<.01),`${theme.id}: reachable ${p.x},${p.z}`);}
  for(const p of extras)if(p.support)assert.ok(extras.some(parent=>parent.key===p.support));
  for(const p of extras)assert.equal(externalAssets.find(a=>a.id===p.asset)?.classroomStatus,'scene-eligible',p.key);
  architecture.dispose();
 }
 assert.ok(themedPlacements(WORLD_THEMES['odyssey-ix']).some(p=>p.id==='sheep'));
 assert.ok(themedPlacements(WORLD_THEMES.tempest).every(p=>!['sheep','cave-module'].includes(p.id)));
});

test('works have distinct architecture and route compositions, with no invisible legacy pavilion blockers',()=>{
 assert.equal(new Set(Object.values(THEME_LAYOUTS).map(l=>l.kind)).size,10);
 assert.equal(new Set(Object.values(THEME_LAYOUTS).map(l=>JSON.stringify(l.spots))).size,10);
 for(const theme of Object.values(WORLD_THEMES)){
  const layout=themeLayout(theme),scene=new THREE.Scene(),a=addThemeArchitecture(scene,theme);
  const nav=createSettingNavigation([],a.obstacles,layout);
  for(const p of Object.values(layout.spots))assert.equal(nav.groundHeight(p),layout.floor??.22);
  const resources=new Set<THREE.BufferGeometry|THREE.Material>();
  scene.traverse(o=>{if(o instanceof THREE.Mesh){resources.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>resources.add(m));}});
  const disposal=new Map([...resources].map(r=>[r,0]));resources.forEach(r=>r.addEventListener('dispose',()=>disposal.set(r,disposal.get(r)!+1)));
  a.dispose();assert.equal(scene.children.length,0);assert.ok([...disposal.values()].every(n=>n===1));
 }
 const nav=createSettingNavigation([],[],THEME_LAYOUTS.frankenstein);
 assert.ok(nav.isWalkable({x:-15,z:7.5}),'Removed pavilion column must not remain an invisible obstacle');
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
