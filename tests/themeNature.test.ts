import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES} from '../lib/worldThemes';
import {addThemeNature} from '../components/worlds/scene/themeNature';
import {vegetationGeometry,foliageTexture} from '../components/worlds/scene/vegetationGeometry';
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
  for(const p of [...Object.values(nav.spawns),...Object.values(nav.approach)])assert.ok(nav.isWalkable(p)&&queue.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<.75&&Math.hypot(nav.moveWalker(q,{x:p.x-q.x,z:p.z-q.z}).x-p.x,nav.moveWalker(q,{x:p.x-q.x,z:p.z-q.z}).z-p.z)<.01),`${theme.id}: reachable ${p.x},${p.z}`);
  nature.update(4,true);const frozen=nature.root.getObjectByName('Distant birds')!.children.map(o=>o.position.toArray());
  nature.update(9,true);assert.deepEqual(nature.root.getObjectByName('Distant birds')!.children.map(o=>o.position.toArray()),frozen);
  const resources=new Map<THREE.BufferGeometry|THREE.Material,number>();
  nature.root.traverse(o=>{if(o instanceof THREE.Mesh)for(const resource of [o.geometry,...(Array.isArray(o.material)?o.material:[o.material])])if(!resources.has(resource)){resources.set(resource,0);resource.addEventListener('dispose',()=>resources.set(resource,resources.get(resource)!+1));}});
  assert.ok(nature.root.children.length<32,'bounded landscape batches');nature.dispose();assert.ok([...resources.values()].every(n=>n===1));architecture.dispose();assert.equal(scene.children.length,0);
 }
});

test('wind bends foliage and rooted ground cover within culling bounds, without moving trunks',()=>{
 const scene=new THREE.Scene(),nature=addThemeNature(scene,WORLD_THEMES.tempest,()=>true);
 const meshes=nature.root.children.filter((o):o is THREE.InstancedMesh=>o instanceof THREE.InstancedMesh);
 const originals=new Map(meshes.map(mesh=>[mesh,new Float32Array(mesh.instanceMatrix.array)]));
 const leaves=meshes.find(mesh=>mesh.name==='Wind in foliage')!,grass=meshes.find(mesh=>mesh.name==='Wind in ground cover'&&mesh.geometry.name==='Botanical grass')!;
 assert.ok(leaves&&grass);
 nature.update(12,false);
 assert.notDeepEqual(leaves.instanceMatrix.array,originals.get(leaves));
 const varying=new Set<number>(),base=new THREE.Matrix4(),animated=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Vector3();
 for(const mesh of meshes){
  const original=originals.get(mesh)!;
  if(!mesh.name.startsWith('Wind'))assert.deepEqual(mesh.instanceMatrix.array,original,'solid trunks and rocks stay fixed');
  for(let i=0;i<mesh.count;i++){
   base.fromArray(original,i*16);mesh.getMatrixAt(i,animated);assert.ok(animated.elements.every(Number.isFinite));
   if(mesh===leaves)varying.add(Math.round((animated.elements[12]-base.elements[12])*100000));
   if(mesh.name==='Wind in ground cover'){p.set(0,0,0).applyMatrix4(base);q.set(0,0,0).applyMatrix4(animated);assert.ok(p.distanceTo(q)<1e-5,'botanical roots stay anchored');}
   const vertices=mesh.geometry.getAttribute('position');
   for(let v=0;v<vertices.count;v++){
    p.fromBufferAttribute(vertices,v).applyMatrix4(base);q.fromBufferAttribute(vertices,v).applyMatrix4(animated);
    assert.ok(p.distanceTo(q)<.7,'bounded branch and stem movement');
    if(mesh.name.startsWith('Wind'))assert.ok(mesh.boundingBox!.containsPoint(q)&&mesh.boundingSphere!.containsPoint(q),'animated vertices remain inside expanded culling bounds');
   }
  }
 }
 assert.ok(varying.size>20,'nearby leaves do not all move in lockstep');
 const version=leaves.instanceMatrix.version;nature.update(12.001,false);assert.equal(leaves.instanceMatrix.version,version,'instance uploads capped at 30 Hz');
 nature.update(24,true);for(const mesh of meshes)assert.deepEqual(mesh.instanceMatrix.array,originals.get(mesh),'reduced motion restores authored rest pose');
 nature.update(120,true);for(const mesh of meshes)assert.deepEqual(mesh.instanceMatrix.array,originals.get(mesh));
 const birds=nature.root.getObjectByName('Distant birds')!;
 const rest=birds.children.map(b=>Array.from((b as THREE.Mesh).geometry.getAttribute('position').array));
 nature.update(8,false);assert.ok(birds.children.some((b,i)=>JSON.stringify(Array.from((b as THREE.Mesh).geometry.getAttribute('position').array))!==JSON.stringify(rest[i])),'wings flap independently');
 nature.update(NaN,false);for(const mesh of meshes)assert.ok(Array.from(mesh.instanceMatrix.array).every(Number.isFinite));
 nature.dispose();const disposedVersion=leaves.instanceMatrix.version;nature.update(45,false);nature.dispose();assert.equal(leaves.instanceMatrix.version,disposedVersion);assert.equal(scene.children.length,0);
});


test('botanical geometry stays finite, ground rooted and cheap enough for instancing',()=>{
 for(const kind of ['grass','plant','flowers'] as const){
  const geometry=vegetationGeometry(kind),position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal'),index=geometry.index!;
  assert.ok(index.count/3<=160,'each botanical instance stays below 160 triangles');
  assert.ok(geometry.boundingBox!.min.y>=0&&geometry.boundingBox!.max.y<=1,'geometry fits authored metre scales');
  for(const attribute of [position,normal,geometry.getAttribute('color')])assert.ok(Array.from(attribute.array).every(Number.isFinite));
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<index.count;i+=3){
   a.fromBufferAttribute(position,index.getX(i));b.fromBufferAttribute(position,index.getX(i+1));c.fromBufferAttribute(position,index.getX(i+2));
   assert.ok(b.sub(a).cross(c.sub(a)).lengthSq()>1e-12,'tapered tips never create zero-area triangles');
  }
  if(kind!=='flowers')assert.equal(geometry.boundingBox!.min.y,0,'roots share the wind pivot');
  geometry.dispose();
 }
 const texture=foliageTexture(),data=texture.image.data as Uint8Array,shades=new Set<number>();let filled=0;
 for(let i=0;i<data.length;i+=4)if(data[i+3]){filled++;shades.add(data[i]);}
 assert.ok(filled>128*128*.25&&filled<128*128*.8,'leaf clusters retain real openings');
 assert.ok(shades.size>20,'pigment and veins provide tonal structure');texture.dispose();
});
