import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {contactBufferSize,contributesContactDepth,createSceneContactShading,withContactDepth} from '../components/worlds/scene/sceneContactShading';

test('contact resolution is bounded, aspect preserving and safe during a collapsed layout',()=>{
 assert.deepEqual(contactBufferSize(3840,2160),{width:800,height:450});
 assert.deepEqual(contactBufferSize(300,900),{width:267,height:800});
 assert.deepEqual(contactBufferSize(320,240),{width:320,height:240});
 assert.deepEqual(contactBufferSize(0,NaN),{width:1,height:1});
});

test('normal depth retains solid and skinned geometry but excludes cutouts, water, sky and particles',()=>{
 const solid=new THREE.MeshStandardMaterial();
 assert.equal(contributesContactDepth(new THREE.Mesh(undefined,solid)),true);
 assert.equal(contributesContactDepth(new THREE.SkinnedMesh(undefined,solid)),true);
 assert.equal(contributesContactDepth(new THREE.InstancedMesh(new THREE.BoxGeometry(),solid,1)),true);
 for(const material of [new THREE.ShaderMaterial(),new THREE.MeshStandardMaterial({alphaTest:.45}),new THREE.MeshStandardMaterial({alphaMap:new THREE.Texture()}),new THREE.MeshStandardMaterial({transparent:true}),new THREE.MeshBasicMaterial({depthWrite:false})]){
  assert.equal(contributesContactDepth(new THREE.Mesh(undefined,material)),false);
  assert.equal(contributesContactDepth(new THREE.Mesh(undefined,[solid,material])),false);
 }
 assert.equal(contributesContactDepth(new THREE.Points()),false);
 assert.equal(contributesContactDepth(new THREE.Line()),false);
 const optOut=new THREE.Mesh();optOut.userData.contactDepth=false;assert.equal(contributesContactDepth(optOut),false);
});

function stateRenderer(){
 const clear=new THREE.Color('#345678');let alpha=.7;
 return {
  shadowMap:{enabled:true,autoUpdate:false,needsUpdate:true},autoClear:true,
  getClearColor:(target:THREE.Color)=>target.copy(clear),getClearAlpha:()=>alpha,
  setClearColor:(color:THREE.Color,value?:number)=>{clear.copy(color);if(value!==undefined)alpha=value;},
 } as unknown as THREE.WebGLRenderer;
}

for(const throws of [false,true])test(`normal-pass scope restores visibility, background, override and shadow state after ${throws?'failure':'success'}`,()=>{
 const scene=new THREE.Scene(),renderer=stateRenderer(),background=new THREE.Color('#abcdff'),override=new THREE.MeshBasicMaterial();
 scene.background=background;scene.overrideMaterial=override;
 const visibleWater=new THREE.Mesh(undefined,new THREE.ShaderMaterial()),hiddenWater=visibleWater.clone(),solid=new THREE.Mesh();hiddenWater.visible=false;
 scene.add(visibleWater,hiddenWater,solid);
 const run=()=>withContactDepth(scene,renderer,()=>{
  assert.equal(visibleWater.visible,false);assert.equal(hiddenWater.visible,false);assert.equal(solid.visible,true);
  assert.equal(scene.background,null);assert.equal(renderer.shadowMap.enabled,false);assert.equal(renderer.shadowMap.autoUpdate,false);
  scene.overrideMaterial=new THREE.MeshNormalMaterial();renderer.shadowMap.needsUpdate=false;renderer.autoClear=false;renderer.setClearColor(new THREE.Color('red'),0);
  if(throws)throw new Error('render failure');return 42;
 });
 if(throws)assert.throws(run,/render failure/);else assert.equal(run(),42);
 assert.equal(visibleWater.visible,true);assert.equal(hiddenWater.visible,false);assert.equal(solid.visible,true);
 assert.equal(scene.background,background);assert.equal(scene.overrideMaterial,override);
 assert.equal(renderer.shadowMap.enabled,true);assert.equal(renderer.shadowMap.autoUpdate,false);assert.equal(renderer.shadowMap.needsUpdate,true);
 assert.equal(renderer.autoClear,true);assert.equal(renderer.getClearColor(new THREE.Color()).getHexString(),'345678');assert.equal(renderer.getClearAlpha(),.7);
});

test('unsupported and explicitly low-power hardware retain direct rendering without allocating a composer',()=>{
 for(const lowPower of [false,true]){
  let calls=0,extensionChecks=0;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();
  const renderer={
   getContext:()=>({getContextAttributes:()=>({powerPreference:lowPower?'low-power':'default'})}),
   extensions:{has:()=>{extensionChecks++;return false;}},
   render:(s:THREE.Scene,c:THREE.Camera)=>{assert.equal(s,scene);assert.equal(c,camera);calls++;},
  } as unknown as THREE.WebGLRenderer;
  const contact=createSceneContactShading(renderer,scene,camera);
  contact.resize(1920,1080);contact.render();contact.render();assert.equal(calls,2);
  assert.equal(extensionChecks,lowPower?0:1);
  contact.dispose();contact.dispose();contact.render();assert.equal(calls,2);
 }
});

test('composer caps AO independently, maps output once and falls back permanently after a render failure',t=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();let direct=0,composed=0,freed=0,target:THREE.WebGLRenderTarget|null=null;
 const renderer=Object.assign(stateRenderer(),{
  getContext:()=>({getContextAttributes:()=>({powerPreference:'default'})}),extensions:{has:()=>true},
  capabilities:{maxSamples:4,maxTextureSize:4096},getPixelRatio:()=>2,getSize:(v:THREE.Vector2)=>v.set(1920,1080),
  getRenderTarget:()=>target,setRenderTarget:(value:THREE.WebGLRenderTarget|null)=>{target=value;},
  toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.2,
  render:()=>{direct++;},
 }) as unknown as THREE.WebGLRenderer;
 t.mock.method(EffectComposer.prototype,'render',function(this:EffectComposer){
  composed++;assert.equal(this.passes.length,3);
  assert.equal(this.passes.filter(pass=>(pass as unknown as {isOutputPass:boolean}).isOutputPass).length,1);
  const ao=this.passes[1] as unknown as {width:number;height:number;blendIntensity:number;gtaoMaterial:THREE.ShaderMaterial};
  assert.equal(ao.width,800);assert.equal(ao.height,450);assert.equal(ao.blendIntensity,.28);
  assert.equal(this.readBuffer.width,2048);assert.equal(this.readBuffer.height,1152);
  this.renderTarget1.addEventListener('dispose',()=>{freed++;});ao.gtaoMaterial.addEventListener('dispose',()=>{freed++;});
  renderer.setRenderTarget(this.readBuffer);renderer.autoClear=false;scene.overrideMaterial=new THREE.MeshNormalMaterial();
  throw new Error('device error');
 });
 const contact=createSceneContactShading(renderer,scene,camera);contact.render();contact.render();
 assert.equal(composed,1);assert.equal(direct,2);assert.equal(freed,2);
 assert.equal(target,null);assert.equal(renderer.autoClear,true);assert.equal(scene.overrideMaterial,null);
 assert.equal(renderer.toneMapping,THREE.ACESFilmicToneMapping);assert.equal(renderer.toneMappingExposure,1.2);
 contact.dispose();assert.equal(freed,2);
});
