import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/examples/jsm/postprocessing/GTAOPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

export function contactBufferSize(width:number,height:number,maxEdge=800){
 const w=Math.max(1,Number.isFinite(width)?width:1),h=Math.max(1,Number.isFinite(height)?height:1);
 const scale=Math.min(1,maxEdge/Math.max(w,h));
 return {width:Math.max(1,Math.round(w*scale)),height:Math.max(1,Math.round(h*scale))};
}

/** The override material cannot reproduce cutout maps or custom vertex/fragment shaders. */
export function contributesContactDepth(object:THREE.Object3D){
 const mesh=object as THREE.Mesh;
 if(!mesh.isMesh)return !(object as THREE.Points).isPoints&&!(object as THREE.Line).isLine;
 const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
 return object.userData.contactDepth!==false&&materials.every(m=>{
  const mapped=m as THREE.MeshStandardMaterial;
  return !(m as THREE.ShaderMaterial).isShaderMaterial&&!m.transparent&&m.opacity===1&&m.alphaTest===0&&!mapped.alphaMap&&m.depthWrite&&m.colorWrite;
 });
}

/** Scope mutations to the normal pass, including recovery when a render hook throws. */
export function withContactDepth<T>(scene:THREE.Scene,renderer:THREE.WebGLRenderer,render:()=>T):T{
 const hidden:THREE.Object3D[]=[];
 const background=scene.background,override=scene.overrideMaterial;
 const shadows=renderer.shadowMap.enabled,shadowAuto=renderer.shadowMap.autoUpdate,shadowNeeds=renderer.shadowMap.needsUpdate;
 const autoClear=renderer.autoClear,clearColor=renderer.getClearColor(new THREE.Color()),clearAlpha=renderer.getClearAlpha();
 try{
  scene.traverse(object=>{if(object.visible&&!contributesContactDepth(object)){hidden.push(object);object.visible=false;}});
  // In particular, Water.onBeforeRender must never run with a normal override.
  scene.background=null;renderer.shadowMap.enabled=false;renderer.shadowMap.autoUpdate=false;
  return render();
 }finally{
  for(const object of hidden)object.visible=true;
  scene.background=background;scene.overrideMaterial=override;
  renderer.shadowMap.enabled=shadows;renderer.shadowMap.autoUpdate=shadowAuto;renderer.shadowMap.needsUpdate=shadowNeeds;
  renderer.autoClear=autoClear;renderer.setClearColor(clearColor,clearAlpha);
 }
}

class ContactPass extends GTAOPass{
 override setSize(width:number,height:number){const size=contactBufferSize(width,height);super.setSize(size.width,size.height);}
 override render(renderer:THREE.WebGLRenderer,write:THREE.WebGLRenderTarget,read:THREE.WebGLRenderTarget){
  withContactDepth(this.scene,renderer,()=>super.render(renderer,write,read,0,false));
 }
 override dispose(){
  // This installed Three GTAOPass omits these two materials from its disposal.
  this.gtaoMaterial.dispose();this.blendMaterial.dispose();super.dispose();
 }
}

/** Optional short-range depth. Leaves renderer creation, lighting and exposure with the caller. */
export function createSceneContactShading(renderer:THREE.WebGLRenderer,scene:THREE.Scene,camera:THREE.Camera,options:{enabled?:boolean}={}){
 let composer:EffectComposer|undefined,ao:ContactPass|undefined,color:RenderPass|undefined,output:OutputPass|undefined,disposed=false;
 function release(){
  ao?.dispose();color?.dispose();output?.dispose();composer?.dispose();
  ao=undefined;color=undefined;output=undefined;composer=undefined;
 }
 function resize(width:number,height:number){
  if(!composer||disposed)return;
  const ratio=Math.min(renderer.getPixelRatio(),1.5);
  const size=contactBufferSize(width*ratio,height*ratio,Math.min(2048,renderer.capabilities.maxTextureSize));
  // Separate color and AO budgets; the color buffer retains readable clothing detail.
  composer.setSize(size.width,size.height);
 }
 try{
  const lowPower=renderer.getContext().getContextAttributes()?.powerPreference==='low-power';
  if(options.enabled!==false&&!lowPower&&renderer.extensions.has('EXT_color_buffer_float')&&renderer.capabilities.maxTextureSize>=1024){
   const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});
   target.samples=Math.min(4,renderer.capabilities.maxSamples);
   composer=new EffectComposer(renderer,target);composer.setPixelRatio(1);
   color=new RenderPass(scene,camera);ao=new ContactPass(scene,camera,1,1);output=new OutputPass();
   ao.blendIntensity=.28;
   ao.updateGtaoMaterial({radius:.4,thickness:.12,distanceFallOff:1,samples:8,screenSpaceRadius:false});
   ao.updatePdMaterial({radius:3,samples:8,rings:2});
   // Three renders the color target in linear HDR without tone mapping. OutputPass
   // applies the caller's tone mapping/exposure and display conversion exactly once.
   composer.addPass(color);composer.addPass(ao);composer.addPass(output);
   const size=renderer.getSize(new THREE.Vector2());resize(size.x,size.y);
  }
 }catch{release();}
 return {
  resize,
  render(){
   if(disposed)return;
   if(!composer){renderer.render(scene,camera);return;}
   const target=renderer.getRenderTarget(),autoClear=renderer.autoClear;
   const clearColor=renderer.getClearColor(new THREE.Color()),clearAlpha=renderer.getClearAlpha();
   const override=scene.overrideMaterial;
   let failed=false;
   try{composer.render();}catch{failed=true;release();}
   finally{renderer.setRenderTarget(target);renderer.autoClear=autoClear;renderer.setClearColor(clearColor,clearAlpha);scene.overrideMaterial=override;}
   if(failed)renderer.render(scene,camera);
  },
  dispose(){if(disposed)return;disposed=true;release();},
 };
}
