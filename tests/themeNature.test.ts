import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES} from '../lib/worldThemes';
import {addThemeNature} from '../components/worlds/scene/themeNature';
import {addThemeArchitecture} from '../components/worlds/scene/themeArchitecture';
import {themeLayout} from '../components/worlds/scene/themeLayouts';
import {createSettingNavigation} from '../components/worlds/scene/settingLayout';
import {themedPlacements,themedExternalPlacements} from '../components/worlds/scene/themedSetting';
import {placementBounds} from '../components/worlds/scene/externalLayout';

test('vegetation preserves all reading routes, keeps islands off the sea, and releases resources',()=>{
 for(const theme of Object.values(WORLD_THEMES)){
  const scene=new THREE.Scene(),layout=themeLayout(theme),architecture=addThemeArchitecture(scene,theme,false);
  const placements=themedPlacements(theme),bounds=[...architecture.obstacles,...themedExternalPlacements(theme).filter(p=>p.solid).map(placementBounds)];
  const base=createSettingNavigation(placements,bounds,layout),nature=addThemeNature(scene,theme,base.isWalkable);
  const nav=createSettingNavigation(placements,[...bounds,...nature.obstacles],layout);
  assert.ok(nav.isWalkable({x:1,z:8}),theme.id);
  for(const p of nature.planted){assert.ok(Math.hypot(p.x,p.z)<25);assert.equal(nav.isWalkable(p),false,'rendered trunks also block movement');}
  if(['cove','island','garden','ruin'].includes(layout.kind))assert.ok(nature.planted.length>=3,theme.id);
  const queue=[{x:0,z:0}],seen=new Set(['0,0']);
  for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){
   const p={x:queue[i].x+dx,z:queue[i].z+dz},key=`${p.x},${p.z}`;
   if(!seen.has(key)&&nav.isWalkable(p)){seen.add(key);queue.push(p);}
  }
  for(const p of [...Object.values(nav.spawns),...Object.values(nav.approach)])assert.ok(seen.has(`${p.x},${p.z}`),`${theme.id}: reachable ${p.x},${p.z}`);
  nature.update(4,true);const frozen=nature.root.getObjectByName('Distant birds')!.children.map(o=>o.position.toArray());
  nature.update(9,true);assert.deepEqual(nature.root.getObjectByName('Distant birds')!.children.map(o=>o.position.toArray()),frozen);
  const resources=new Map<THREE.BufferGeometry|THREE.Material,number>();
  nature.root.traverse(o=>{if(o instanceof THREE.Mesh)for(const resource of [o.geometry,...(Array.isArray(o.material)?o.material:[o.material])])if(!resources.has(resource)){resources.set(resource,0);resource.addEventListener('dispose',()=>resources.set(resource,resources.get(resource)!+1));}});
  assert.ok(nature.root.children.length<32,'bounded landscape batches');nature.dispose();assert.ok([...resources.values()].every(n=>n===1));architecture.dispose();assert.equal(scene.children.length,0);
 }
});
