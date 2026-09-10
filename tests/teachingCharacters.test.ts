import test from 'node:test';
import {geometryOnlyGlb} from './helpers/glbGeometry';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {loadTeachingCharacters} from '../components/worlds/scene/teachingCharacters';
import {TEACHING_HEIGHTS} from '../components/worlds/scene/humanScale';
import type {ZoneId} from '../lib/world';

test('Alexandria guides retain their human scale and fixed anchors, greet/talk, pause and restore fallbacks',async()=>{
 const zones:ZoneId[]=['harbor','market','library'],loaded:THREE.Group[]=[];
 const anchors=zones.map((zone,i)=>{const root=new THREE.Group();root.userData.character=zone;root.position.x=i*15;root.add(new THREE.Group());return root;});
 const actors=loadTeachingCharacters(anchors,async url=>{assert.match(url,/\?v=[a-f0-9]{12}$/);const bytes=await readFile(new URL('../public'+url.split('?')[0],import.meta.url));const gltf=await new GLTFLoader().parseAsync(geometryOnlyGlb(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),'');loaded.push(gltf.scene);return gltf;});
 assert.deepEqual(await actors.loaded,{harbor:'ready',market:'ready',library:'ready'});
 for(const [i,anchor] of anchors.entries()){const bounds=new THREE.Box3().setFromObject(anchor.children[1],true);assert.ok(Math.abs(bounds.max.y-bounds.min.y-TEACHING_HEIGHTS[zones[i]])<1e-6);assert.equal(anchor.children[0].visible,false);}
 const model=loaded.find(o=>o.getObjectByName('dorian__Rig'))!,arm=model.getObjectByName('ForearmR') as THREE.Bone;assert.ok(arm);
 const idle=arm.quaternion.clone();for(let i=0;i<10;i++)actors.update(.1,false,new THREE.Vector3(0,1.6,2),true);assert.ok(arm.quaternion.angleTo(idle)>.1,'approach plays the authored greeting');
 actors.talk('harbor');for(let i=0;i<6;i++)actors.update(.1,false,new THREE.Vector3(0,1.6,2),true);const speaking=arm.quaternion.clone();assert.ok(speaking.angleTo(idle)>.01);
 for(let i=0;i<40;i++)actors.update(.1,true,new THREE.Vector3(0,1.6,2),true);assert.ok(arm.quaternion.angleTo(speaking)<1e-6);
 anchors.forEach((anchor,i)=>assert.deepEqual(anchor.position.toArray(),[i*15,0,0]));actors.dispose();actors.dispose();anchors.forEach(anchor=>{assert.equal(anchor.children.length,1);assert.equal(anchor.children[0].visible,true);});
});

test('Alexandria arrival views face the actual named companions',async()=>{
 const {WALK_FACING,WALK_SPAWNS}=await import('../components/worlds/scene/walkGeometry');
 const {characters}=await import('../lib/characters');
 for(const zone of ['harbor','market','library'] as ZoneId[]){const origin=WALK_SPAWNS[zone],target=characters[zone].position,yaw=WALK_FACING[zone];const direction=new THREE.Vector2(target[0]-origin.x,target[2]-origin.z).normalize();assert.ok(direction.dot(new THREE.Vector2(-Math.sin(yaw),-Math.cos(yaw)))>.999,`${zone} faces the guide`);}
});
