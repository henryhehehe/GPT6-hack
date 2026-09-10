import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {createHarborReflections} from '../components/worlds/scene/harborEnvironment';
import {defaultSceneAppearance,type SceneAppearance} from '../lib/sceneAppearance';

function fixture(){
 const scene=new THREE.Scene(),sky=new Sky();sky.scale.setScalar(4000);scene.add(sky);
 const original=new THREE.Texture();scene.environment=original;
 const state={target:new THREE.WebGLRenderTarget(2,2) as THREE.WebGLRenderTarget|null,face:2,mip:1,clear:new THREE.Color('#546372'),alpha:.4};
 const renderer={autoClear:true,toneMapping:THREE.ACESFilmicToneMapping as THREE.ToneMapping,toneMappingExposure:.7,xr:{enabled:true},
  getRenderTarget:()=>state.target,getActiveCubeFace:()=>state.face,getActiveMipmapLevel:()=>state.mip,
  getClearColor:(color:THREE.Color)=>color.copy(state.clear),getClearAlpha:()=>state.alpha,
  setRenderTarget:(target:THREE.WebGLRenderTarget|null,face=0,mip=0)=>{state.target=target;state.face=face;state.mip=mip;},
  setClearColor:(color:THREE.Color,alpha:number)=>{state.clear.copy(color);state.alpha=alpha;},
 };
 let fail=false,generatorDisposals=0;
 const captures:Array<{night:boolean;background:THREE.Color|null;sun:THREE.Vector3;cloud:number;target:THREE.WebGLRenderTarget;disposed:number}>=[];
 const generator={fromScene:(capture:THREE.Scene)=>{
   assert.equal(sky.parent,scene,'visible sky never gets reparented for a cube capture');
   const dome=capture.children[0] as THREE.Mesh<THREE.BufferGeometry,THREE.ShaderMaterial>;
   assert.equal(dome.geometry,sky.geometry);assert.equal(dome.material,sky.material);
   assert.equal(dome.material.uniforms.showSunDisc.value,false,'direct sun disc is excluded from filtered reflections');
   const target=new THREE.WebGLRenderTarget(4,4),record={night:!dome.visible,background:capture.background instanceof THREE.Color?capture.background.clone():null,sun:sky.material.uniforms.sunPosition.value.clone(),cloud:sky.material.uniforms.cloudCoverage.value,target,disposed:0};
   target.addEventListener('dispose',()=>record.disposed++);captures.push(record);
   renderer.autoClear=false;renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=17;renderer.xr.enabled=false;
   renderer.setRenderTarget(target,0,0);renderer.setClearColor(new THREE.Color('black'),0);
   if(fail){target.dispose();throw new Error('simulated GPU capture failure');}
   return target;
  },dispose:()=>{generatorDisposals++;}};
 const before={target:state.target,face:state.face,mip:state.mip,clear:state.clear.clone(),alpha:state.alpha};
 const reflections=createHarborReflections(scene,renderer as unknown as THREE.WebGLRenderer,sky,generator);
 function restored(){assert.equal(state.target,before.target);assert.equal(state.face,before.face);assert.equal(state.mip,before.mip);assert.ok(state.clear.equals(before.clear));assert.equal(state.alpha,before.alpha);assert.equal(renderer.autoClear,true);assert.equal(renderer.toneMapping,THREE.ACESFilmicToneMapping);assert.equal(renderer.toneMappingExposure,.7);assert.equal(renderer.xr.enabled,true);assert.equal(sky.material.uniforms.showSunDisc.value,1);}
 return {scene,sky,original,captures,reflections,restored,setFailure:(value:boolean)=>{fail=value;},generatorDisposals:()=>generatorDisposals};
}

test('reflection captures follow changed sunlight/clouds, excluding viewpoint, water, and animation updates',()=>{
 const f=fixture();f.reflections.update(defaultSceneAppearance);f.restored();assert.equal(f.captures.length,1);assert.equal(f.scene.environment,f.captures[0].target.texture);
 for(let i=0;i<120;i++)f.reflections.update({...defaultSceneAppearance,water:i%2?'choppy':'calm',viewpoint:(['overview','harbor','market','library'] as const)[i%4]});
 assert.equal(f.captures.length,1,'no per-frame or camera-change PMREM regeneration');
 f.sky.material.uniforms.sunPosition.value.set(.7,.15,.6);f.reflections.update({...defaultSceneAppearance,timeOfDay:'dawn'});
 assert.equal(f.captures.length,2);assert.ok(f.captures[1].sun.equals(new THREE.Vector3(.7,.15,.6)));assert.equal(f.captures[0].disposed,1);f.restored();
 f.sky.material.uniforms.cloudCoverage.value=.88;f.reflections.update({...defaultSceneAppearance,timeOfDay:'dawn',weather:'overcast'});
 assert.equal(f.captures.length,3);assert.equal(f.captures[2].cloud,.88);assert.equal(f.captures[1].disposed,1);assert.equal(f.captures[2].disposed,0);f.restored();
 f.reflections.dispose();f.reflections.dispose();assert.equal(f.captures[2].disposed,1);assert.equal(f.generatorDisposals(),1);assert.equal(f.scene.environment,f.original);assert.equal(f.sky.parent,f.scene);
});

test('night captures only the dark background and a failed refresh never leaves golden reflections or renderer state behind',()=>{
 const f=fixture();f.reflections.update(defaultSceneAppearance);f.setFailure(true);
 const night:SceneAppearance={...defaultSceneAppearance,timeOfDay:'night'};f.reflections.update(night);f.restored();
 assert.equal(f.captures[1].night,true);assert.ok(f.captures[1].background?.equals(new THREE.Color('#142238')));assert.equal(f.sky.visible,true,'capture visibility never changes the visible sky');
 assert.equal(f.scene.environment,null);assert.equal(f.captures[0].disposed,1);
 for(let i=0;i<60;i++)f.reflections.update(night);assert.equal(f.captures.length,2,'failed capture does not repeat every frame');
 f.setFailure(false);f.reflections.update({...night,weather:'overcast'});assert.equal(f.captures.length,3);assert.equal(f.scene.environment,f.captures[2].target.texture);f.restored();
 const external=new THREE.Texture();f.scene.environment=external;f.reflections.dispose();assert.equal(f.scene.environment,external,'cleanup preserves a later environment owner');assert.equal(f.captures[2].disposed,1);
 f.reflections.update(defaultSceneAppearance);assert.equal(f.captures.length,3,'disposed generator cannot be reused');
});
