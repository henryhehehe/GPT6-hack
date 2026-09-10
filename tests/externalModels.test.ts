import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ExternalModelDepot} from '../components/worlds/scene/externalModels';
import {externalPlacements,placementBounds} from '../components/worlds/scene/externalLayout';
import {settingPlacements,createSettingNavigation,SETTING_SPOTS} from '../components/worlds/scene/settingLayout';
import index from '../lib/externalAssetIndex.json';
const eligible=index.filter(a=>a.classroomStatus==='scene-eligible');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function disposable(){const scene=new THREE.Group(),geometry=new THREE.BoxGeometry(),texture=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map:texture});scene.add(new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,material));const counts={geometry:0,material:0,texture:0};geometry.addEventListener('dispose',()=>counts.geometry++);material.addEventListener('dispose',()=>counts.material++);texture.addEventListener('dispose',()=>counts.texture++);return {scene,counts};}
test('external model cache deduplicates requests and shared resource disposal',async()=>{
 const source=disposable();let requests=0;const depot=new ExternalModelDepot(async()=>{requests++;return source;});
 const a=depot.load(eligible[0].id),b=depot.load(eligible[0].id);assert.equal(a,b);assert.equal(await a,source.scene);assert.equal(requests,1);depot.dispose();depot.dispose();assert.deepEqual(source.counts,{geometry:1,material:1,texture:1});
});
test('external loader caps concurrency and cancels queued work after disposal',async()=>{
 const finishes:((v:{scene:THREE.Group})=>void)[]=[];let requests=0;
 const depot=new ExternalModelDepot(()=>{requests++;return new Promise(resolve=>finishes.push(resolve));});
 const pending=eligible.slice(0,7).map(a=>depot.load(a.id));assert.equal(requests,3);
 depot.dispose();const late=finishes.map(()=>disposable());finishes.forEach((done,i)=>done(late[i]));assert.deepEqual(await Promise.all(pending),Array(7).fill(null));await tick();assert.equal(requests,3);late.forEach(s=>assert.deepEqual(s.counts,{geometry:1,material:1,texture:1}));
});
test('failure keeps fallback and frees a worker for the next asset',async()=>{
 let calls=0;const depot=new ExternalModelDepot(async()=>{if(++calls===1)throw new Error('offline');return {scene:new THREE.Group()};});
 const results=await Promise.all(eligible.slice(0,5).map(a=>depot.load(a.id)));assert.equal(results[0],null);assert.ok(results.slice(1).every(Boolean));assert.equal(calls,5);depot.dispose();
});
test('unregistered IDs, assemblies and undressed references never fetch in a lesson',async()=>{
 let calls=0;const depot=new ExternalModelDepot(async()=>{calls++;return {scene:new THREE.Group()};});
 for(const id of ['https://untrusted.invalid/a.glb',...index.filter(a=>a.classroomStatus!=='scene-eligible').map(a=>a.id)])assert.equal(await depot.load(id),null);
 assert.equal(calls,0);depot.dispose();
});
test('a skinned result cannot enter the static clone cache',async()=>{
 const scene=new THREE.Group(),mesh=new THREE.SkinnedMesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial());scene.add(mesh);let disposed=0;mesh.geometry.addEventListener('dispose',()=>disposed++);
 const depot=new ExternalModelDepot(async()=>({scene}));assert.equal(await depot.load(eligible[0].id),null);assert.equal(disposed,1);depot.dispose();
});
for(const setting of ['coast','garden','archive'] as const)test(`${setting} external additions preserve spawns, front approaches and ground blockers`,()=>{
 const additions=externalPlacements(setting),nav=createSettingNavigation(settingPlacements(setting),additions.filter(p=>p.solid).map(placementBounds));
 assert.equal(new Set(additions.map(a=>a.key)).size,additions.length);
 for(const p of additions)assert.ok(eligible.some(a=>a.id===p.asset));
 for(const [zone,spot] of Object.entries(SETTING_SPOTS)){
  const start=nav.spawns[zone as keyof typeof nav.spawns];assert.ok(nav.isWalkable(start),`blocked ${zone} spawn`);assert.ok(nav.isWalkable(spot),`blocked ${zone} approach`);
  let position={...start};for(let i=0;i<100;i++)position=nav.moveWalker(position,{x:(spot.x-start.x)/100,z:(spot.z-start.z)/100});assert.ok(Math.hypot(position.x-spot.x,position.z-spot.z)<.02,`unreachable ${zone} station`);
 }
 for(const p of additions.filter(p=>p.solid))assert.equal(nav.isWalkable({x:p.at[0],z:p.at[2]}),false,p.key);
 const unique=new Set(additions.map(p=>p.asset)),bytes=index.filter(a=>unique.has(a.id)).reduce((n,a)=>n+a.bytes,0);assert.ok(bytes<4_000_000,`external payload ${bytes}`);
});
