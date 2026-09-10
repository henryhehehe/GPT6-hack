import * as THREE from 'three';
import type {WorldTheme} from '@/lib/worldThemes';
import {themeWind,windGust,windDisplacement} from './themeWind';

type Weather={kind:'snow'|'spray'|'motes'|'mist'|'seeds';count:number;color:string;size:number;opacity:number;fall:number;drift:number};
export const WORLD_WEATHER:Record<string,Weather>={
 'odyssey-ix':{kind:'spray',count:80,color:'#d3e5de',size:.9,opacity:.13,fall:.3,drift:.35},
 'austen-letter':{kind:'seeds',count:100,color:'#eee4ba',size:.4,opacity:.45,fall:.12,drift:.2},
 macbeth:{kind:'mist',count:80,color:'#adb9b4',size:6,opacity:.035,fall:0,drift:.3},
 frankenstein:{kind:'motes',count:100,color:'#eed2a2',size:.28,opacity:.38,fall:.025,drift:.025},
 'christmas-carol':{kind:'snow',count:260,color:'#f1f4f5',size:.7,opacity:.62,fall:.5,drift:.15},
 tempest:{kind:'spray',count:160,color:'#bdced2',size:1.1,opacity:.16,fall:.5,drift:1},
 declaration:{kind:'motes',count:70,color:'#f3dfbc',size:.25,opacity:.3,fall:.025,drift:.025},
 'douglass-literacy':{kind:'seeds',count:55,color:'#d6cba7',size:.3,opacity:.28,fall:.1,drift:.12},
 'seneca-falls':{kind:'motes',count:85,color:'#fff0ca',size:.28,opacity:.32,fall:.03,drift:.03},
};
const wrap=(value:number,width:number)=>((value%width)+width)%width;

/** Low-density atmosphere stays separate from source objects and never intercepts picking. */
export function addThemeAtmosphere(scene:THREE.Scene,theme:WorldTheme){
 const wind=themeWind(theme);
 const profile=WORLD_WEATHER[theme.id],root=new THREE.Group();root.name='Ambient weather';scene.add(root);
 if(!profile)return {root,update(_time:number,_reduced:boolean){},dispose(){root.removeFromParent();}};
 let seed=[...theme.id].reduce((n,c)=>n*31+c.charCodeAt(0),7)>>>0;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const starts=Array.from({length:profile.count},()=>({x:random()*44-22,y:random()*14,z:random()*44-24,phase:random()*6.28}));
 const positions=new Float32Array(profile.count*3),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const material=new THREE.ShaderMaterial({
  uniforms:{tint:{value:new THREE.Color(profile.color)},size:{value:profile.size},opacity:{value:profile.opacity}},
  vertexShader:'uniform float size; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(size*160.0/max(5.0,-p.z),1.0,36.0);gl_Position=projectionMatrix*p;}',
  fragmentShader:'uniform vec3 tint; uniform float opacity; void main(){float r=length(gl_PointCoord-vec2(0.5))*2.0;float a=(1.0-smoothstep(0.15,1.0,r))*opacity;if(a<0.002)discard;gl_FragColor=vec4(tint,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  transparent:true,depthWrite:false,depthTest:true,
 });
 const points=new THREE.Points(geometry,material);points.name=profile.kind;points.raycast=()=>{};points.frustumCulled=false;root.add(points);
 let disposed=false,lastFrame=-1;
 function update(time:number,reduced:boolean){
  if(disposed)return;
  root.visible=!reduced;if(reduced){lastFrame=-1;return;}
  const frame=Math.floor((Number.isFinite(time)?Math.max(0,time):0)*30);
  if(frame===lastFrame)return;lastFrame=frame;
  const t=frame/30,gust=windGust(wind,t),drift=windDisplacement(wind,t);
  starts.forEach((p,i)=>{
   let x=wrap(p.x+22+t*profile.drift,44)-22,z=p.z,y=wrap(p.y-t*profile.fall,14);
   if(profile.kind==='spray'){x=(i%2?-1:1)*(24+wrap(p.x,6));z=wrap(p.z+t*profile.drift,44)-24;y=wrap(y,2.5);}
   else if(profile.kind==='mist')y=.35+wrap(p.y,1.2);
   else if(profile.kind==='motes'){x=-13+wrap(p.x,25);z=-16+wrap(p.z,10);y=1.3+wrap(y,5);}
   // Spray stays on the coast; enclosed rooms receive only the weakest air movement.
   const shelter=profile.kind==='motes'?.18:1;
   x+=Math.sin(t*.25+p.phase)*.3+wind.directionX*drift*shelter;
   z+=wind.directionZ*drift*shelter;
   if(profile.kind==='seeds'||profile.kind==='snow')y+=Math.sin(t*.9+p.phase)*gust*.12;
   y=Math.max(.01,y);
   positions[i*3]=x;positions[i*3+1]=y;positions[i*3+2]=z;
  });
  geometry.getAttribute('position').needsUpdate=true;
 }
 update(0,false);
 return {root,update,dispose(){if(disposed)return;disposed=true;root.removeFromParent();geometry.dispose();material.dispose();}};
}
