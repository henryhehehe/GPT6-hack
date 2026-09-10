import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {loadExternalModels} from '../components/worlds/scene/externalModels';
import {pickSceneSelection} from '../components/worlds/scene/scenePicking';
import {themeExternalActivityAreas} from '../components/worlds/scene/themeExternalActivityAreas';
import {WORLD_THEMES} from '../lib/worldThemes';
import {catalogScenes,scenePlacements} from '../lib/modelCatalogScenes';
import {placementBounds} from '../components/worlds/scene/externalLayout';
import {externalGeometry} from './helpers/externalGeometry';
import index from '../lib/externalAssetIndex.json';

for(const world of catalogScenes.filter(s=>s.kind==='world'))test(`${world.label}: real GLBs attach, retain transforms and release shared resources`,async()=>{
 const scene=new THREE.Scene(),placements=scenePlacements(world),requests:string[]=[];
 const art=loadExternalModels(scene,placements,async url=>{requests.push(url);return externalGeometry(url);});
 const statuses=await art.ready;
 assert.equal(art.root.parent,scene);assert.equal(art.root.children.length,placements.length);
 assert.equal(requests.length,new Set(placements.map(p=>p.asset)).size);
 assert.ok([...statuses.values()].every(s=>s==='ready'));
 for(const p of placements){
  const group=art.root.getObjectByName(p.key)!;assert.ok(group);
  assert.deepEqual(group.position.toArray(),p.at);assert.equal(group.scale.x,p.scale??1);assert.equal(group.rotation.y,p.turn??0);
  assert.equal(group.userData.externalZone,p.zone);assert.ok(group.children[0] instanceof THREE.Group,'real GLB replaces box fallback');
 }
 for(const p of themeExternalActivityAreas(WORLD_THEMES[world.id])){
  const ray=new THREE.Raycaster(new THREE.Vector3(p.at[0],p.at[1]+index.find(a=>a.id===p.asset)!.dimensions[1]+.1,p.at[2]),new THREE.Vector3(0,-1,0));
  scene.updateMatrixWorld(true);assert.deepEqual(pickSceneSelection(ray,scene),{action:'evidence',zone:p.zone},`${p.key} source link`);
  if(p.support){
   const base=placements.find(b=>b.key===p.support)!,bounds=placementBounds(p),support=placementBounds(base);
   assert.ok(bounds[0]>=support[0]&&bounds[1]<=support[1]&&bounds[2]>=support[2]&&bounds[3]<=support[3]);
   // Start below a stall canopy so the test measures the usable counter.
   const hit=ray.intersectObject(art.root.getObjectByName(base.key)!,true)[0];assert.ok(hit);
   assert.ok(Math.abs(p.at[1]-hit.point.y)<.015,`${p.key}: surface ${hit.point.y}, object ${p.at[1]}`);
  }
 }
 const counts=new Map<THREE.BufferGeometry|THREE.Material,number>();
 art.root.traverse(o=>{if(o instanceof THREE.Mesh)for(const r of [o.geometry,...(Array.isArray(o.material)?o.material:[o.material])])if(!counts.has(r)){counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)!+1));}});
 art.dispose();art.dispose();assert.equal(scene.children.length,0);assert.ok([...counts.values()].every(c=>c===1));
});

test('failed or empty external models keep a source-selectable fallback',async()=>{
 const placement={key:'reading-book',asset:'quaternius-fantasy-props-book-5',at:[0,0,0] as [number,number,number],zone:'library' as const};
 for(const load of [async()=>{throw new Error('offline');},async()=>({scene:new THREE.Group()})]){
  const scene=new THREE.Scene(),art=loadExternalModels(scene,[placement],load);await art.ready;
  assert.equal(art.status.get(placement.asset),'failed');assert.ok(art.root.children[0].children[0] instanceof THREE.Mesh);
  scene.updateMatrixWorld(true);const ray=new THREE.Raycaster(new THREE.Vector3(0,1,0),new THREE.Vector3(0,-1,0));
  assert.deepEqual(pickSceneSelection(ray,scene),{action:'evidence',zone:'library'});art.dispose();
 }
});

test('disposing a scene before loading finishes cannot attach a late model',async()=>{
 const scene=new THREE.Scene(),source=new THREE.Group(),geometry=new THREE.BoxGeometry(),material=new THREE.MeshStandardMaterial();source.add(new THREE.Mesh(geometry,material));
 let finish!:(value:{scene:THREE.Group})=>void,disposed=0;geometry.addEventListener('dispose',()=>disposed++);
 const art=loadExternalModels(scene,[{key:'book',asset:'quaternius-fantasy-props-book-5',at:[0,0,0]}],()=>new Promise(resolve=>{finish=resolve;}));
 art.dispose();finish({scene:source});await art.ready;
 assert.equal(scene.children.length,0);assert.equal(art.root.children.length,0);assert.equal(disposed,1);assert.equal(art.status.get('quaternius-fantasy-props-book-5'),'disposed');
});

test('reading objects and their supports start loading before distant scenery',async()=>{
 const placements=[
  {key:'background',asset:'polyhaven-coast_rocks_01',at:[10,0,10] as [number,number,number]},
  {key:'vase',asset:'quaternius-fantasy-props-vase-2',at:[0,0,0] as [number,number,number],zone:'market' as const},
  {key:'book',asset:'quaternius-fantasy-props-book-5',at:[2,.631,0] as [number,number,number],zone:'library' as const,support:'table'},
  {key:'table',asset:'quaternius-fantasy-props-table-large',at:[2,0,0] as [number,number,number]},
 ];
 const before=JSON.stringify(placements),requests:string[]=[],scene=new THREE.Scene();
 const art=loadExternalModels(scene,placements,async url=>{requests.push(url);return externalGeometry(url);});
 assert.equal(requests.length,3);assert.ok(requests[0].includes('table-large'));assert.ok(requests[1].includes('vase-2'));assert.ok(requests[2].includes('book-5'));
 await art.ready;assert.ok(requests[3].includes('coast_rocks_01'));
 assert.equal(JSON.stringify(placements),before);assert.deepEqual(art.root.children.map(o=>o.name),placements.map(p=>p.key));art.dispose();
});

test('a failed stall leaves its produce visible through the counter opening',async()=>{
 const placements=themeExternalActivityAreas(WORLD_THEMES['christmas-carol']),scene=new THREE.Scene();
 const art=loadExternalModels(scene,placements,async url=>{if(url.includes('stall-empty'))throw new Error('offline');return externalGeometry(url);});
 await art.ready;scene.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(12,1.02,-13),new THREE.Vector3(0,0,-1));
 const hit=ray.intersectObject(scene,true)[0];assert.ok(hit);
 let selected:THREE.Object3D|null=hit.object;while(selected&&!selected.userData.assetId)selected=selected.parent;
 assert.equal(selected?.userData.assetId,'quaternius-fantasy-props-farmcrate-apple');
 assert.deepEqual(pickSceneSelection(ray,scene),{action:'evidence',zone:'market'});
 const supportRay=new THREE.Raycaster(new THREE.Vector3(12,1.8,-15),new THREE.Vector3(0,-1,0));
 const counter=supportRay.intersectObject(art.root.getObjectByName('winter-produce-stall')!,true)[0];assert.ok(Math.abs(counter.point.y-.88818)<.0001);
 const counts=new Map<THREE.BufferGeometry|THREE.Material,number>();
 art.root.traverse(o=>{if(o instanceof THREE.Mesh)for(const r of [o.geometry,...(Array.isArray(o.material)?o.material:[o.material])])if(!counts.has(r)){counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)!+1));}});
 art.dispose();assert.ok([...counts.values()].every(n=>n===1),'multi-part fallback resources release once');
});

test('the external inspect API respects walls and ignores another layer’s tags',async()=>{
 const scene=new THREE.Scene(),art=loadExternalModels(scene,[{key:'book',asset:'quaternius-fantasy-props-book-5',at:[0,0,0],zone:'library'}],async()=>{throw new Error('offline');});await art.ready;
 const wall=new THREE.Mesh(new THREE.BoxGeometry(2,.1,2),new THREE.MeshBasicMaterial());wall.position.y=.5;scene.add(wall);scene.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(0,1,0),new THREE.Vector3(0,-1,0));
 assert.equal(art.inspect(ray),null);wall.userData.externalZone='market';assert.equal(art.inspect(ray),null);
 wall.visible=false;assert.equal(art.inspect(ray),'library');art.dispose();wall.geometry.dispose();wall.material.dispose();
});
