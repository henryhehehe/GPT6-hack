import * as THREE from 'three';
import {appearanceLighting,type SceneAppearance} from '@/lib/sceneAppearance';
import {Sky} from 'three/addons/objects/Sky.js';
import {Water} from './vendor/Water.js';
import type {WorldTheme} from '@/lib/worldThemes';
import {themeLayout} from './themeLayouts';
import {applyThemeSurfaces} from './themeSurfaces';

export type ThemeLighting={sun:[number,number,number];strength:number;fill:number;exposure:number;haze:number;cloud:number;environment:number};
const daylight:ThemeLighting={sun:[-45,60,35],strength:2.6,fill:.65,exposure:.8,haze:.005,cloud:.22,environment:.22};
export const THEME_LIGHTING:Record<string,ThemeLighting>={
  alexandria:daylight,
  'odyssey-ix':{...daylight,sun:[-50,65,30],strength:3.1,haze:.003},
  'austen-letter':{...daylight,sun:[-40,27,35],strength:2.2,exposure:.9,cloud:.3},
  macbeth:{...daylight,sun:[-30,18,-40],strength:1.3,fill:.7,haze:.012,cloud:.88,exposure:.95},
  frankenstein:{...daylight,sun:[25,35,-30],strength:.85,fill:.45,exposure:1.05,environment:.15,cloud:.7},
  'christmas-carol':{...daylight,sun:[-25,18,40],strength:1.8,fill:.75,cloud:.75,exposure:.82,haze:.008},
  tempest:{...daylight,sun:[40,22,-30],strength:1.6,fill:.6,cloud:.9,haze:.009,exposure:.9},
  declaration:{...daylight,sun:[-32,42,26],strength:2,fill:.6,environment:.18,exposure:.92},
  'douglass-literacy':{...daylight,sun:[30,48,25],strength:2.5,fill:.55,exposure:.85},
  'seneca-falls':{...daylight,sun:[-25,38,35],strength:1.9,fill:.7,environment:.2,exposure:.95},
};

/** Reuses the harbor's physical sky, filtered environment and local water-normal asset. */
export function createThemeEnvironment(scene:THREE.Scene,renderer:THREE.WebGLRenderer,theme:WorldTheme){
  const surfaces=applyThemeSurfaces(scene,theme);
  const settings=THEME_LIGHTING[theme.id]??daylight,layout=themeLayout(theme);
  const interior=['study','assembly','meeting'].includes(layout.kind),coast=['cove','island'].includes(layout.kind);
  renderer.toneMappingExposure=settings.exposure;
  renderer.shadowMap.type=THREE.PCFShadowMap;
  const sky=new Sky();sky.scale.setScalar(1000);
  const u=sky.material.uniforms,direction=new THREE.Vector3(...settings.sun).normalize();
  u.turbidity.value=2+settings.cloud*7;u.rayleigh.value=1.4;u.mieCoefficient.value=.004;u.mieDirectionalG.value=.8;u.sunPosition.value.copy(direction);
  u.cloudCoverage.value=settings.cloud;u.cloudDensity.value=settings.cloud*.6;
  const generator=new THREE.PMREMGenerator(renderer),environmentScene=new THREE.Scene();environmentScene.add(sky);
  const environment=generator.fromScene(environmentScene,.06,.1,2000);generator.dispose();
  if(!interior&&!theme.night)scene.add(sky);
  scene.environment=environment.texture;scene.environmentIntensity=settings.environment;
  scene.fog=new THREE.FogExp2(theme.horizon,settings.haze);
  const fill=new THREE.HemisphereLight(theme.sky,theme.ground,settings.fill);
  const sun=new THREE.DirectionalLight(theme.light,settings.strength);sun.position.set(...settings.sun);sun.target.position.set(0,0,-3);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00008;sun.shadow.normalBias=.035;sun.shadow.radius=3;
  Object.assign(sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:1,far:150});sun.shadow.camera.updateProjectionMatrix();
  scene.add(fill,sun,sun.target);
  const lamps:THREE.PointLight[]=[];
  if(interior||theme.id==='christmas-carol')for(const p of Object.values(layout.spots)){
    const light=new THREE.PointLight('#ffcc86',theme.night?14:5,10,2);light.position.set(p.x-.48,1.45,p.z-1.5);scene.add(light);lamps.push(light);
  }
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
  return {update(time:number,reduced:boolean,appearance?:SceneAppearance){applyAppearance(appearance);u.time.value=reduced?0:time;ocean?.update(time,reduced,appearance);},dispose(){
    surfaces.dispose();
    scene.remove(sky,fill,sun,sun.target,...lamps);scene.environment=null;environment.dispose();sky.geometry.dispose();sky.material.dispose();sun.shadow.map?.dispose();
    ocean?.dispose();
  }};
}
