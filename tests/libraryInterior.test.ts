import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {isWalkable,moveWalker,groundHeight,WALK_SPAWNS,type WalkPoint} from '../components/worlds/scene/walkGeometry';
import {LIBRARY_OBSTACLES,LIBRARY_INTERIOR_PLACEMENTS,createLibraryFallback,addLibraryReadingLight} from '../components/worlds/scene/libraryInterior';

test('existing library arrival walks through the central entry and returns outdoors',()=>{
 let point:WalkPoint={...WALK_SPAWNS.library};assert.ok(isWalkable(point));
 for(let i=0;i<130;i++){const next=moveWalker(point,{x:0,z:-.1});assert.ok(next.z<point.z,'center aisle must remain continuous');assert.ok(Math.abs(groundHeight(next)-groundHeight(point))<.15);point=next;}
 assert.ok(Math.abs(point.z+15)<.0001);assert.equal(groundHeight(point),4);
 for(let i=0;i<130;i++)point=moveWalker(point,{x:0,z:.1});
 assert.ok(Math.abs(point.z-WALK_SPAWNS.library.z)<.0001);
});

test('walls, columns and furniture block movement while hall approaches remain walkable',()=>{
 for(const [x0,x1,z0,z1] of LIBRARY_OBSTACLES)assert.equal(isWalkable({x:(x0+x1)/2,z:(z0+z1)/2}),false);
 for(const point of [{x:0,z:-8},{x:0,z:-10},{x:0,z:-14},{x:2.5,z:-14},{x:-2.5,z:-14},{x:0,z:-17.5}])assert.ok(isWalkable(point),JSON.stringify(point));
 assert.ok(moveWalker({x:0,z:-14},{x:0,z:-10}).z>-18);
 for(const point of Object.values(WALK_SPAWNS))assert.ok(isWalkable(point));
});

test('height follows the terrace, shallow entrance treads and level hall',()=>{
 assert.equal(groundHeight({x:0,z:-3}),2.85);assert.equal(groundHeight({x:0,z:-6.9}),4);assert.equal(groundHeight({x:0,z:-16}),4);
 for(let i=0;i<=8;i++)assert.ok(Math.abs(groundHeight({x:0,z:-3-i*3.9/8})-(2.85+i*1.15/8))<1e-8);
 for(const p of LIBRARY_INTERIOR_PLACEMENTS)assert.ok(p.at[1]>=4);
});

test('fallback has a clear roofed entry and only one non-shadow reading light',()=>{
 const scene=new THREE.Scene(),fallback=createLibraryFallback(scene),light=addLibraryReadingLight(scene);scene.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(0,5.62,-6),new THREE.Vector3(0,0,-1),0,11);
 assert.equal(ray.intersectObject(fallback.group,true).length,0,'eye-level center aisle must be open');
 const ceiling=new THREE.Raycaster(new THREE.Vector3(0,5.62,-14),new THREE.Vector3(0,1,0),0,8);
 assert.ok(ceiling.intersectObject(fallback.group,true).length>0);
 assert.equal(light.castShadow,false);assert.equal(scene.children.filter(o=>o instanceof THREE.Light).length,1);
 const resources=new Set<THREE.BufferGeometry|THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){resources.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>resources.add(m));}});resources.forEach(r=>r.dispose());
});


test('authored library GLB has an open doorway, eye-level clearance and a continuous hall floor',async()=>{
 const data=await readFile(new URL('../public/models/library.glb',import.meta.url));
 const {scene}=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 scene.position.set(0,2.9,-13);let doors=0;
 scene.traverse(o=>{if(o.name==='ArchiveDoorLeft'||o.name==='ArchiveDoorRight'){o.rotation.y+=(o.name.endsWith('Left')?-1:1)*Math.PI*.46;doors++;}});
 scene.updateMatrixWorld(true);assert.equal(doors,2);
 for(const x of [-.28,0,.28])for(const y of [4.25,5.62,6.7]){
  const hits=new THREE.Raycaster(new THREE.Vector3(x,y,-6.2),new THREE.Vector3(0,0,-1),0,11.5).intersectObject(scene,true);
  assert.equal(hits.length,0,`Aisle blocked at x=${x}, y=${y}`);
 }
 for(const z of [-7,-8,-11,-14,-17]){
  const floor=new THREE.Raycaster(new THREE.Vector3(0,4.5,z),new THREE.Vector3(0,-1,0),0,2).intersectObject(scene,true);
  assert.ok(floor.length);assert.ok(Math.abs(floor[0].point.y-4)<.02);
 }
 assert.ok(new THREE.Raycaster(new THREE.Vector3(0,5.62,-14),new THREE.Vector3(0,1,0),0,8).intersectObject(scene,true).length);
 const resources=new Set<THREE.BufferGeometry|THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){resources.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>resources.add(m));}});resources.forEach(r=>r.dispose());
});
