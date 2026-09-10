import * as THREE from 'three';
import {appearanceLighting,type SceneAppearance} from '@/lib/sceneAppearance';
import {Sky} from 'three/addons/objects/Sky.js';
import {Water} from './vendor/Water.js';
import type {WorldTheme} from '@/lib/worldThemes';
import {themeLayout} from './themeLayouts';
import {applyThemeSurfaces} from './themeSurfaces';

import {themeLighting,addThemeLights} from './themeLighting';
export {THEME_LIGHTING} from './themeLighting';
export type {ThemeLighting} from './themeLighting';

/** Reuses the harbor's physical sky, filtered environment and local water-normal asset. */
export function createThemeEnvironment(scene:THREE.Scene,renderer:THREE.WebGLRenderer,theme:WorldTheme){
  const surfaces=applyThemeSurfaces(scene,theme);
  const settings=themeLighting(theme.id),layout=themeLayout(theme);
  const interior=['study','assembly','meeting'].includes(layout.kind),coast=['cove','island'].includes(layout.kind);
  renderer.toneMappingExposure=settings.exposure;
  renderer.shadowMap.type=THREE.PCFShadowMap;
  const sky=new Sky();sky.scale.setScalar(1000);
  const u=sky.material.uniforms,direction=new THREE.Vector3(...settings.sun).normalize();
  u.turbidity.value=2+settings.cloud*7;u.rayleigh.value=1.4;u.mieCoefficient.value=.004;u.mieDirectionalG.value=.8;u.sunPosition.value.copy(direction);
  u.cloudCoverage.value=settings.cloud;u.cloudDensity.value=settings.cloud>.9?.95:settings.cloud*.7;
  const generator=new THREE.PMREMGenerator(renderer),environmentScene=new THREE.Scene();environmentScene.add(sky);
  const environment=generator.fromScene(environmentScene,.06,.1,2000);generator.dispose();
  if(!interior&&!theme.night)scene.add(sky);
  scene.environment=environment.texture;scene.environmentIntensity=settings.environment;
  scene.fog=new THREE.FogExp2(theme.horizon,settings.haze);
  const lights=addThemeLights(scene,theme,layout),{sun,fill,lamps}=lights;
  let ocean:{update(time:number,reduced:boolean,appearance?:SceneAppearance):void;dispose():void}|undefined;
  if(coast){
    const normals=new THREE.TextureLoader().load('/textures/waternormals.jpg');normals.wrapS=normals.wrapT=THREE.RepeatWrapping;normals.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    const water=new Water(new THREE.PlaneGeometry(1600,1600),{textureWidth:256,textureHeight:256,waterNormals:normals,sunDirection:direction,sunColor:new THREE.Color(theme.light).getHex(),waterColor:new THREE.Color(theme.water).getHex(),distortionScale:theme.id==='tempest'?2.3:1,alpha:1,fog:true});
    const waterMaterial=water.material as THREE.ShaderMaterial;
    water.rotation.x=-Math.PI/2;water.position.y=-2.55;waterMaterial.transparent=false;waterMaterial.depthWrite=true;scene.add(water);
    const reflect=water.onBeforeRender;let last=-1;
    water.onBeforeRender=function(...args:Parameters<typeof reflect>){
      waterMaterial.uniforms.eye.value.setFromMatrixPosition(args[2].matrixWorld);
      const now=performance.now();if(now-last<33)return;last=now;reflect.apply(this,args);
    };
    ocean={update(time,reduced,appearance){const light=appearance?appearanceLighting(appearance):null;waterMaterial.uniforms.time.value=reduced?0:time*(light?.waterSpeed??(theme.id==='tempest'?.42:.18));waterMaterial.uniforms.distortionScale.value=light?.distortion??(theme.id==='tempest'?2.3:1);waterMaterial.uniforms.sunDirection.value.copy(direction);waterMaterial.uniforms.sunColor.value.copy(sun.color);},dispose(){
      scene.remove(water);water.dispose();water.geometry.dispose();waterMaterial.dispose();normals.dispose();
    }};
  }
  let appearanceKey='authored';
  function applyAppearance(appearance?:SceneAppearance){
    const key=appearance?JSON.stringify(appearance):'authored';if(key===appearanceKey)return;appearanceKey=key;
    const light=appearance?appearanceLighting(appearance):null,night=appearance?appearance.timeOfDay==='night':theme.night;
    if(light){direction.set(light.direction[0],light.direction[1],light.direction[2]).normalize();sun.position.copy(direction).multiplyScalar(80);}else{sun.position.set(...settings.sun);direction.copy(sun.position).normalize();}
    u.sunPosition.value.copy(direction);sun.color.set(light?.sun??theme.light);sun.intensity=light?.strength??settings.strength;
    fill.color.set(light?.sky??theme.sky);fill.groundColor.set(light?.ground??theme.ground);fill.intensity=light?.fill??settings.fill;
    renderer.toneMappingExposure=light?.exposure??settings.exposure;
    u.turbidity.value=2+(light?.cloud??settings.cloud)*7;u.cloudCoverage.value=light?.cloud??settings.cloud;u.cloudDensity.value=(light?.cloud??settings.cloud)*.6;
    const fog=scene.fog as THREE.FogExp2;fog.color.set(light?.fog??theme.horizon);fog.density=light?.haze??settings.haze;
    scene.environmentIntensity=light?(night?.04:settings.environment):settings.environment;
    if(!interior){if(!sky.parent)scene.add(sky);sky.visible=!night;}
    scene.background=new THREE.Color(appearance?(night?'#142238':light!.sky):theme.sky);
    lamps.forEach(lamp=>{lamp.intensity=night?14:5;});
  }
  return {update(time:number,reduced:boolean,appearance?:SceneAppearance){applyAppearance(appearance);u.time.value=reduced?0:time;ocean?.update(time,reduced,appearance);lights.update(time,reduced,appearance?(appearance.timeOfDay==='night'?14:5):settings.lamp);},dispose(){
    surfaces.dispose();
    lights.dispose();scene.remove(sky);scene.environment=null;environment.dispose();sky.geometry.dispose();sky.material.dispose();
    ocean?.dispose();
  }};
}
