import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {addAlexandriaWind,applyAlexandriaWindDepth} from '../components/worlds/scene/alexandriaWind';

test('wind selects actual cloth/leaf surfaces, preserves rigid supports, and matches cloned shadow materials',async()=>{
 const bytes=await readFile(new URL('../public/models/alexandria/alexandria-kit.glb',import.meta.url));
 const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const cloth=scene.getObjectByName('market-canopy__linen') as THREE.Mesh,wood=scene.getObjectByName('market-canopy__wood') as THREE.Mesh;
 const original=cloth.material,woodMaterial=wood.material,positions=Array.from(cloth.geometry.getAttribute('position').array);
 const wind=addAlexandriaWind(scene);assert.ok(wind.count>=4);assert.notEqual(cloth.material,original);assert.equal(wood.material,woodMaterial);
 const clone=cloth.clone();applyAlexandriaWindDepth(clone);assert.equal(clone.customDepthMaterial,cloth.customDepthMaterial);
 const mat=cloth.material as THREE.Material,shader={uniforms:{},vertexShader:'#include <begin_vertex>'} as Parameters<typeof mat.onBeforeCompile>[0];
 mat.onBeforeCompile(shader,{} as THREE.WebGLRenderer);
 assert.ok(shader.vertexShader.includes('instanceMatrix*instanceOrigin'),'instanced foliage has individual spatial phase');
 const shadow={uniforms:{},vertexShader:'#include <begin_vertex>'} as typeof shader;cloth.customDepthMaterial!.onBeforeCompile(shadow,{} as THREE.WebGLRenderer);
 assert.equal(shadow.vertexShader,shader.vertexShader,'visible surface and sun shadow use the same deformation');
 wind.update(12,false);assert.equal(shader.uniforms.alexandriaTime.value,12);assert.equal(shader.uniforms.alexandriaMotion.value,1);
 wind.update(15,true);assert.equal(shader.uniforms.alexandriaMotion.value,0);assert.equal(shadow.uniforms.alexandriaMotion.value,0);
 assert.deepEqual(Array.from(cloth.geometry.getAttribute('position').array),positions,'CPU geometry remains unchanged');
 let disposed=0;mat.addEventListener('dispose',()=>disposed++);wind.dispose();wind.dispose();assert.equal(disposed,1);assert.equal(cloth.material,original);assert.equal(cloth.customDepthMaterial,undefined);
});
