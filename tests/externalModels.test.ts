import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ExternalModelDepot} from '../components/worlds/scene/externalModels';
import {externalPlacements,placementBounds} from '../components/worlds/scene/externalLayout';
import {settingPlacements,createSettingNavigation,SETTING_SPOTS,SETTING_ASSETS} from '../components/worlds/scene/settingLayout';
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
 const unique=new Set(additions.map(p=>p.asset)),bytes=index.filter(a=>unique.has(a.id)).reduce((n,a)=>n+a.bytes,0);assert.ok(bytes<6_000_000,`external payload ${bytes}`);
 const authoredIds=new Set(settingPlacements(setting).map(p=>p.id)),authoredBytes=[...authoredIds].reduce((n,id)=>n+SETTING_ASSETS[id].bytes,0);assert.ok(bytes+authoredBytes<10_000_000,'combined authored and external GLBs stay under 10 MB');
});

test('every scene-eligible asset is used and no assembly or adaptation reference is placed',()=>{
 const used=new Set(['alexandria','coast','garden','archive'].flatMap(setting=>externalPlacements(setting as 'alexandria'|'coast'|'garden'|'archive').map(p=>p.asset)));
 assert.deepEqual([...used].sort(),eligible.map(a=>a.id).sort());
});

for(const setting of ['coast','garden','archive'] as const)test(`${setting} activity areas connect to the plaza and furniture footprints do not overlap`,()=>{
 const additions=externalPlacements(setting),authored=settingPlacements(setting),nav=createSettingNavigation(authored,additions.filter(p=>p.solid).map(placementBounds));
 const queue=[{x:0,z:0}],seen=new Set(['0,0']);
 for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){
  const p={x:queue[i].x+dx,z:queue[i].z+dz},key=`${p.x},${p.z}`;
  if(!seen.has(key)&&nav.isWalkable(p)){seen.add(key);queue.push(p);}
 }
 for(const item of additions.filter(p=>p.solid&&p.zone)){
  const [x0,x1,z0,z1]=placementBounds(item);
  assert.ok(queue.some(p=>Math.hypot(Math.max(x0-p.x,0,p.x-x1),Math.max(z0-p.z,0,p.z-z1))<1.25),`cannot reach ${item.key}`);
 }
 const ground=additions.filter(p=>p.solid);
 for(let i=0;i<ground.length;i++)for(let j=i+1;j<ground.length;j++){
  const a=placementBounds(ground[i]),b=placementBounds(ground[j]);
  assert.ok(Math.min(a[1],b[1])-Math.max(a[0],b[0])<.01||Math.min(a[3],b[3])-Math.max(a[2],b[2])<.01,`${ground[i].key} overlaps ${ground[j].key}`);
 }
});

test('display items rest on real model surfaces, including the half-scale tea table',async()=>{
 const {readFile}=await import('node:fs/promises');const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
 const cache=new Map<string,THREE.Group>();
 async function geometry(id:string){
  if(cache.has(id))return cache.get(id)!;
  const asset=index.find(a=>a.id===id)!,bytes=await readFile(new URL(`../public${asset.url}`,import.meta.url));
  const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  delete doc.images;delete doc.textures;delete doc.materials;
  for(const mesh of doc.meshes??[])for(const primitive of mesh.primitives)delete primitive.material;
  const json=Buffer.from(JSON.stringify(doc)),padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
  const bin=bytes.subarray(20+bytes.readUInt32LE(12)),header=Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+padded.length+bin.length,8);header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
  const stripped=Buffer.concat([header,padded,bin]);const model=(await new GLTFLoader().parseAsync(stripped.buffer.slice(stripped.byteOffset,stripped.byteOffset+stripped.byteLength),'')).scene;
  cache.set(id,model);return model;
 }
 for(const setting of ['archive','garden','coast'] as const){
  const placements=externalPlacements(setting);
  for(const item of placements.filter(p=>p.trunkRadius)){
   const tree=await geometry(item.asset);tree.updateMatrixWorld(true);let measured=0;
   tree.traverse(o=>{if(o instanceof THREE.Mesh){const a=o.geometry.getAttribute('position');for(let i=0;i<a.count;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);if(p.y<1.9){measured++;assert.ok(Math.hypot(p.x,p.z)<=item.trunkRadius!,`${item.asset} trunk exceeds blocker: ${Math.hypot(p.x,p.z)}`);}}}});
   assert.ok(measured>0,'actual trunk vertices checked');
  }
  for(const item of placements.filter(p=>p.support)){
   const base=placements.find(p=>p.key===item.support)!;assert.ok(base,`${item.key} missing support`);
   const footprint=placementBounds(item),supportBounds=placementBounds(base);
   assert.ok(footprint[0]>=supportBounds[0]-.01&&footprint[1]<=supportBounds[1]+.01&&footprint[2]>=supportBounds[2]-.01&&footprint[3]<=supportBounds[3]+.01,`${item.key} overhangs its support`);
   const root=(await geometry(base.asset)).clone(true);root.position.set(...base.at);root.rotation.y=base.turn??0;root.scale.setScalar(base.scale??1);root.updateMatrixWorld(true);
   const ray=new THREE.Raycaster(new THREE.Vector3(item.at[0],10,item.at[2]),new THREE.Vector3(0,-1,0));
   const hit=ray.intersectObject(root,true)[0];assert.ok(hit,`${item.key} has no surface below it`);
   assert.ok(Math.abs(item.at[1]-hit.point.y)<.012,`${item.key} floor ${item.at[1]} differs from surface ${hit.point.y}`);
  }
 }
});
