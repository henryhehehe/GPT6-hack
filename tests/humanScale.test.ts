import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HUMAN_SCALE,MARKET_COUNTER_Y} from '../components/worlds/scene/humanScale';
test('actual shipped furniture fits a standing adult and seated adult after calibration',async()=>{
 const bytes=await readFile(new URL('../public/models/alexandria/alexandria-kit.glb',import.meta.url));
 const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const height=(id:string,factor:number)=>{const o=scene.getObjectByName(id);assert.ok(o);return new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).y*factor;};
 assert.ok(height('wooden-stool',HUMAN_SCALE.stoolVertical)>.42&&height('wooden-stool',HUMAN_SCALE.stoolVertical)<.50);
 assert.ok(height('marble-bench',HUMAN_SCALE.benchVertical)>.45&&height('marble-bench',HUMAN_SCALE.benchVertical)<.53);
 assert.ok(height('market-canopy',HUMAN_SCALE.marketVertical)>2.5&&height('market-canopy',HUMAN_SCALE.marketVertical)<3);
 assert.ok(MARKET_COUNTER_Y-1>.75&&MARKET_COUNTER_Y-1<.95);
 assert.ok(height('writing-desk',HUMAN_SCALE.deskVertical)<.95,'desk including its small authored objects stays below chest height');
});
