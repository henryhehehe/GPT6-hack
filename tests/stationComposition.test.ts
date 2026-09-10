import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import type {ZoneId} from '../lib/world';
import {WORLD_THEMES} from '../lib/worldThemes';
import {themeLayout} from '../components/worlds/scene/themeLayouts';
import {stationPoint} from '../components/worlds/scene/stationTransform';
import {createSettingNavigation,SETTING_ASSETS} from '../components/worlds/scene/settingLayout';
import {themedPlacements} from '../components/worlds/scene/themedSetting';
import {addThemeArchitecture} from '../components/worlds/scene/themeArchitecture';

test('rotated reading furniture, companion blockers and arrivals use the same frame and real floor',()=>{
 for(const theme of Object.values(WORLD_THEMES)){
  const layout=themeLayout(theme),props=themedPlacements(theme),nav=createSettingNavigation(props,[],layout);
  for(const zone of Object.keys(layout.spots) as ZoneId[]){
   const actor=stationPoint(layout,zone,1.3,.5),arrival=nav.spawns[zone],yaw=nav.facing![zone];
   assert.ok(Math.abs(Math.atan2(arrival.x-actor.x,arrival.z-actor.z)-yaw)<1e-8);
   assert.ok(Math.abs(Math.hypot(arrival.x-actor.x,arrival.z-actor.z)-3.3)<1e-8);
   assert.equal(nav.isWalkable(actor),false,'companion collision follows the visible character');
   for(const p of props.filter(p=>p.zone===zone&&['writing-desk','reading-table'].includes(p.id))){
    assert.ok(Math.abs(p.at[1]+SETTING_ASSETS[p.id].bounds.min[1]*p.scale-layout.floor!)<1e-7,'furniture feet meet the floor');
   }
  }
 }
});

test('generated worlds have no repeated raised reading stages or origin-spoke routes',()=>{
 for(const theme of Object.values(WORLD_THEMES)){
  if(theme.id==='alexandria')continue;
  const layout=themeLayout(theme),scene=new THREE.Scene(),architecture=addThemeArchitecture(scene,theme,false);
  assert.ok(architecture.root.children.every(o=>!(o instanceof THREE.Mesh&&o.geometry.type==='BoxGeometry'&&o.scale.x===8&&o.scale.y===.22&&o.scale.z===7)));
  for(const route of layout.paths??[]){assert.equal(route.length,3);assert.ok(route.every(p=>Math.hypot(p.x,p.z)>1));}
  architecture.dispose();
 }
});
