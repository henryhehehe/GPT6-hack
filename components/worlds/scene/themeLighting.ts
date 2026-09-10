import * as THREE from 'three';
import type {WorldTheme} from '@/lib/worldThemes';
import type {ThemeLayout} from './themeLayouts';

export type ThemeLighting={sun:[number,number,number];strength:number;fill:number;exposure:number;haze:number;cloud:number;environment:number;bounce:number;bounceColor:string;lamp:number};
const daylight:ThemeLighting={sun:[-45,60,35],strength:2.4,fill:.55,exposure:.8,haze:.005,cloud:.22,environment:.08,bounce:.2,bounceColor:'#dbe3eb',lamp:4};
/** Calibrated for the authored linear vertex palettes, not white studio materials. */
export const THEME_LIGHTING:Readonly<Record<string,ThemeLighting>>={
  alexandria:daylight, // The legacy harbor retains its separately calibrated lighting.
  'odyssey-ix':{...daylight,sun:[-50,65,30],strength:2.6,haze:.003,environment:.085,exposure:.78,bounce:.16},
  'austen-letter':{...daylight,sun:[-40,27,35],strength:2,exposure:.84,environment:.07,cloud:.3,bounce:.16},
  macbeth:{...daylight,sun:[-30,18,-40],strength:1.05,fill:.6,haze:.007,cloud:.96,exposure:.88,environment:.11,bounce:.5,bounceColor:'#c4d4df'},
  frankenstein:{...daylight,sun:[25,35,-30],strength:.8,fill:.38,exposure:.94,environment:.075,cloud:.8,bounce:.38,bounceColor:'#b9cce1',lamp:8},
  'christmas-carol':{...daylight,sun:[-25,18,40],strength:1.65,fill:.6,cloud:.82,exposure:.78,haze:.006,environment:.065,bounce:.2},
  tempest:{...daylight,sun:[40,22,-30],strength:1.4,fill:.55,cloud:.97,haze:.006,exposure:.88,environment:.1,bounce:.42,bounceColor:'#c7d8dc'},
  declaration:{...daylight,sun:[-32,42,26],strength:1.8,fill:.5,environment:.065,exposure:.84,bounce:.22,bounceColor:'#e5ded1'},
  'douglass-literacy':{...daylight,sun:[30,48,25],strength:2.15,fill:.5,exposure:.8,environment:.07,bounce:.18},
  'seneca-falls':{...daylight,sun:[-25,38,35],strength:1.65,fill:.55,environment:.065,exposure:.85,bounce:.22,bounceColor:'#e5e0d3'},
};
export function themeLighting(id:string):ThemeLighting{
  return Object.hasOwn(THEME_LIGHTING,id)?THEME_LIGHTING[id]:daylight;
}

/** One shadowed key and a low, fixed sky/window bounce; no camera-following face light. */
export function addThemeLights(scene:THREE.Scene,theme:WorldTheme,layout:ThemeLayout){
  const settings=themeLighting(theme.id),root=new THREE.Group();root.name='World lighting';scene.add(root);
  const fill=new THREE.HemisphereLight(theme.sky,theme.ground,settings.fill);fill.name='Sky and ground fill';
  const sun=new THREE.DirectionalLight(theme.light,settings.strength);sun.name='Sun key';sun.position.set(...settings.sun);sun.target.position.set(0,0,-3);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00012;sun.shadow.normalBias=.035;sun.shadow.radius=3;
  Object.assign(sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:1,far:150});sun.shadow.camera.updateProjectionMatrix();
  const bounce=new THREE.DirectionalLight(settings.bounceColor,settings.bounce);bounce.name='Open-front sky bounce';bounce.position.set(-8,12,24);bounce.target.position.set(0,1,-5);
  root.add(fill,sun,sun.target,bounce,bounce.target);
  const lamps:THREE.PointLight[]=[];
  if(['study','assembly','meeting'].includes(layout.kind)||theme.id==='christmas-carol')for(const p of Object.values(layout.spots)){
    const light=new THREE.PointLight('#ffcc86',settings.lamp,8,2);light.name='Reading lamp';light.position.set(p.x-.48,1.45,p.z-1.5);root.add(light);lamps.push(light);
  }
  let disposed=false;
  return {root,sun,bounce,fill,lamps,
    update(time:number,reduced:boolean,lampIntensity=settings.lamp){
      if(disposed)return;const t=Number.isFinite(time)?time:0;
      lamps.forEach((lamp,i)=>{const shimmer=!reduced&&(theme.night||theme.id==='christmas-carol')?.015*Math.sin(t*1.7+i*2.1)+.01*Math.sin(t*3.9+i*.7):0;lamp.intensity=lampIntensity*(1+shimmer);});
    },
    dispose(){if(disposed)return;disposed=true;root.removeFromParent();sun.shadow.dispose();}};
}
