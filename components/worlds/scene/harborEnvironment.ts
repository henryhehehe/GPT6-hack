import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {Water} from './vendor/Water.js';
import {defaultSceneAppearance,appearanceLighting,type SceneAppearance} from '@/lib/sceneAppearance';

/** Cache image-based lighting independently of camera and water animation. */
export function createHarborReflections(scene:THREE.Scene,renderer:THREE.WebGLRenderer,sky:Sky,generator:Pick<THREE.PMREMGenerator,'fromScene'|'dispose'>=new THREE.PMREMGenerator(renderer)){
 const capture=new THREE.Scene(),dome=new THREE.Mesh(sky.geometry,sky.material);dome.scale.copy(sky.scale);capture.add(dome);
 const previous=scene.environment,nightBackground=new THREE.Color('#142238');
 let environment:THREE.WebGLRenderTarget|null=null,owned:THREE.Texture|null|undefined,key='',disposed=false;
 return {update(appearance:SceneAppearance){
  const nextKey=`${appearance.timeOfDay}:${appearance.weather}`;if(disposed||nextKey===key)return;
  // One attempt per appearance change: a failed GPU capture falls back to direct/fill light.
  key=nextKey;const night=appearance.timeOfDay==='night';dome.visible=!night;capture.background=night?nightBackground:null;
  const target=renderer.getRenderTarget(),face=renderer.getActiveCubeFace(),mip=renderer.getActiveMipmapLevel();
  const autoClear=renderer.autoClear,toneMapping=renderer.toneMapping,exposure=renderer.toneMappingExposure,xr=renderer.xr.enabled;
  const clearColor=renderer.getClearColor(new THREE.Color()),clearAlpha=renderer.getClearAlpha(),sunDisc=sky.material.uniforms.showSunDisc.value;
  let replacement:THREE.WebGLRenderTarget|null=null;
  try{
   // The directional light owns the direct sun; filtering its tiny bright disc causes hot pixels.
   sky.material.uniforms.showSunDisc.value=false;
   replacement=generator.fromScene(capture,.035,.1,5000);
  }catch{
   // Never leave a golden daytime reflection on a night scene after a failed refresh.
  }finally{
   sky.material.uniforms.showSunDisc.value=sunDisc;
   renderer.autoClear=autoClear;renderer.toneMapping=toneMapping;renderer.toneMappingExposure=exposure;renderer.xr.enabled=xr;
   renderer.setRenderTarget(target,face,mip);renderer.setClearColor(clearColor,clearAlpha);
  }
  const old=environment;environment=replacement;owned=replacement?.texture??null;scene.environment=owned;old?.dispose();
 },dispose(){
  if(disposed)return;disposed=true;
  if(scene.environment===owned)scene.environment=previous;
  environment?.dispose();generator.dispose();capture.remove(dome);
 }};
}

/** Sky/PMREM and planar water follow the official Three.js ocean example. */
export function createHarborEnvironment(scene:THREE.Scene,renderer:THREE.WebGLRenderer){
 const sky=new Sky();sky.scale.setScalar(4000);scene.add(sky);
 const u=sky.material.uniforms;u.turbidity.value=3.8;u.rayleigh.value=1.6;u.mieCoefficient.value=.004;u.mieDirectionalG.value=.82;
 const sunDirection=new THREE.Vector3(-.62,.43,.65).normalize();u.sunPosition.value.copy(sunDirection);u.cloudCoverage.value=.22;u.cloudDensity.value=.3;
 const reflections=createHarborReflections(scene,renderer,sky);scene.environmentIntensity=.06;
 scene.fog=new THREE.FogExp2('#c8d8dd',.0025);
 const ambient=new THREE.HemisphereLight('#d2e7f0','#8b775a',.75);scene.add(ambient);
 const sun=new THREE.DirectionalLight('#ffdfad',2.5);sun.position.copy(sunDirection).multiplyScalar(100);sun.target.position.set(0,0,-18);scene.add(sun,sun.target);
 sun.castShadow=true;sun.shadow.mapSize.setScalar(Math.min(3072,renderer.capabilities.maxTextureSize));sun.shadow.normalBias=.025;sun.shadow.bias=-.00008;sun.shadow.radius=3;
 Object.assign(sun.shadow.camera,{left:-58,right:58,top:62,bottom:-62,near:1,far:230});sun.shadow.camera.updateProjectionMatrix();
 const normals=new THREE.TextureLoader().load('/textures/waternormals.jpg');normals.wrapS=normals.wrapT=THREE.RepeatWrapping;normals.anisotropy=4;
 const water=new Water(new THREE.PlaneGeometry(5000,5000),{textureWidth:512,textureHeight:512,waterNormals:normals,sunDirection,sunColor:0xffe5b9,waterColor:0x073e42,distortionScale:1.7,alpha:1,fog:true});
 const waterMaterial=water.material as THREE.ShaderMaterial;
 water.rotation.x=-Math.PI/2;water.position.y=-.12;waterMaterial.transparent=false;waterMaterial.depthWrite=true;waterMaterial.uniforms.size.value=1.5;scene.add(water);
 // Planar reflections are updated at 30fps while the main view stays at its normal rate.
 const reflect=water.onBeforeRender;let lastReflection=-1;
 water.onBeforeRender=function(...args:Parameters<typeof reflect>){waterMaterial.uniforms.eye.value.setFromMatrixPosition(args[2].matrixWorld);const now=performance.now();if(now-lastReflection<32)return;lastReflection=now;reflect.apply(this,args);};
 let appearanceKey='',waterSpeed=.2;
 const nightBackground=new THREE.Color('#142238');
 return {sun,update(time:number,reduced:boolean,appearance:SceneAppearance=defaultSceneAppearance){
  const key=JSON.stringify(appearance);
  if(key!==appearanceKey){
   appearanceKey=key;const light=appearanceLighting(appearance),night=appearance.timeOfDay==='night';
   sunDirection.set(light.direction[0],light.direction[1],light.direction[2]).normalize();u.sunPosition.value.copy(sunDirection);sun.position.copy(sunDirection).multiplyScalar(100);
   sun.color.set(light.sun);sun.intensity=light.strength;ambient.color.set(light.sky);ambient.groundColor.set(light.ground);ambient.intensity=light.fill;
   renderer.toneMappingExposure=light.exposure;sky.visible=!night;scene.background=night?nightBackground:null;
   u.turbidity.value=2+light.cloud*7;u.cloudCoverage.value=light.cloud;u.cloudDensity.value=light.cloud*.6;
   const fog=scene.fog as THREE.FogExp2;fog.color.set(light.fog);fog.density=light.haze;
   scene.environmentIntensity=night?.015:.06;reflections.update(appearance);
   waterMaterial.uniforms.sunDirection.value.copy(sunDirection);waterMaterial.uniforms.sunColor.value.set(light.sun);waterMaterial.uniforms.distortionScale.value=light.distortion;waterSpeed=light.waterSpeed;
  }
  waterMaterial.uniforms.time.value=reduced?0:time*waterSpeed;u.time.value=reduced?0:time;
 },dispose(){scene.remove(sky,water,ambient,sun,sun.target);reflections.dispose();sky.geometry.dispose();sky.material.dispose();water.dispose();water.geometry.dispose();waterMaterial.dispose();normals.dispose();sun.shadow.map?.dispose();}};
}
