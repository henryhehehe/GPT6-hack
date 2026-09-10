import * as THREE from 'three';
import type {WorldTheme} from '@/lib/worldThemes';
import {settingPlacements} from './settingLayout';
import {externalPlacements} from './externalLayout';

export function themedPlacements(theme:WorldTheme){
 return settingPlacements(theme.furniture).filter(p=>theme.id!=='tempest'||!['sheep','cave-module'].includes(p.id));
}
export function themedExternalPlacements(theme:WorldTheme){
 const all=externalPlacements(theme.furniture);
 if(theme.id==='custom'||theme.id==='austen-letter'||theme.furniture==='coast')return all;
 // Keep writing-room furniture; market stalls and produce do not belong in every document lesson.
 const filtered=all.filter(p=>!p.key.startsWith('garden-display')&&!p.key.startsWith('garden-produce')&&!p.key.startsWith('garden-tea'));
 const keys=new Set(filtered.map(p=>p.key));return filtered.filter(p=>!p.support||keys.has(p.support));
}

/** Distant scenery is outside the walking boundary; local furniture owns its collisions. */
export function addThemeScenery(scene:THREE.Scene,theme:WorldTheme){
 const root=new THREE.Group();root.name='Interpreted setting';scene.add(root);
 const materials=new Set<THREE.Material>(),geometries=new Set<THREE.BufferGeometry>();
 const mat=(color:string,roughness=.9)=>{const m=new THREE.MeshStandardMaterial({color,roughness});materials.add(m);return m;};
 const wall=mat(theme.building),roof=mat(theme.roof),stone=mat(theme.stone),leaf=mat(theme.foliage),hill=mat(theme.ground),trim=mat('#ded6c2');
 const glass=new THREE.MeshStandardMaterial({color:theme.night?'#ffd994':'#71868a',emissive:theme.night?'#edb566':'#263c42',emissiveIntensity:theme.night?.55:.06,roughness:.3});materials.add(glass);
 const cube=new THREE.BoxGeometry(1,1,1),cone=new THREE.ConeGeometry(1,1,4),mound=new THREE.SphereGeometry(1,16,10);[cube,cone,mound].forEach(g=>geometries.add(g));
 function mesh(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=false;o.receiveShadow=true;root.add(o);return o;}
 if(theme.landscape==='shore'||theme.landscape==='highlands'){
  for(let i=0;i<9;i++){
   const angle=Math.PI*.12+i*Math.PI*.105,r=57+(i%3)*9,height=theme.landscape==='highlands'?13+i%4*5:5+i%4*3;
   mesh(mound,hill,Math.cos(angle)*r,-2,Math.sin(angle)*-r,12+i%3*4,height,10+i%2*4);
  }
 }else{
  // The path beyond the activity courtyard makes an inland setting, not another island.
  mesh(cube,hill,0,-1.9,0,280,.5,280);
  for(let i=0;i<11;i++){
   const x=(i-5)*8,z=-36-Math.abs(i-5)*1.8,height=theme.landscape==='town'?8+(i%3)*1.5:7;
   mesh(cube,wall,x,height/2-1.6,z,6,height,6);
   const top=mesh(cone,roof,x,height-.1,z,5,3,5);top.rotation.y=Math.PI/4;
   for(const dx of [-1.6,1.6])for(const dy of [1.5,4.3]){
    mesh(cube,trim,x+dx,dy,z+3.06,1.35,1.75,.12);
    mesh(cube,glass,x+dx,dy,z+3.15,1.05,1.45,.08);
    mesh(cube,trim,x+dx,dy,z+3.23,.055,1.45,.04);
   }
   mesh(cube,roof,x+1.8,height+1,z-1, .65,2,.65);
  }
  if(theme.landscape==='estate')for(let i=0;i<12;i++){
   const a=i/12*Math.PI*2;mesh(mound,leaf,Math.cos(a)*36,1,Math.sin(a)*36,3.5,5,3.5);
  }
 }
 // Quiet, static cloud layers preserve reduced-motion behavior and keep visual noise low.
 const cloud=new THREE.MeshBasicMaterial({color:theme.horizon,transparent:true,opacity:.3,depthWrite:false});materials.add(cloud);
 for(let i=0;i<7;i++)mesh(mound,cloud,(i-3)*20,30+(i%3)*4,-64-i%2*12,16,2.3,6);
 return {dispose(){root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}

/** Fictional reading companions, with a human silhouette and neutral period-inspired clothing. */
export function readingGuide(color:string,skin:string,robe:boolean){
 const root=new THREE.Group(),fabric=new THREE.MeshStandardMaterial({color,roughness:.95}),shirt=new THREE.MeshStandardMaterial({color:'#e5d9c4',roughness:1}),face=new THREE.MeshStandardMaterial({color:skin,roughness:.8}),hair=new THREE.MeshStandardMaterial({color:'#403630',roughness:1}),shoe=new THREE.MeshStandardMaterial({color:'#3b3733',roughness:1});
 const add=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;root.add(mesh);return mesh;};
 for(const side of [-1,1]){
  add(new THREE.CapsuleGeometry(.09,.48,3,7),fabric,side*.12,.43,0);
  add(new THREE.BoxGeometry(.16,.12,.3),shoe,side*.12,.08,.045);
  const arm=add(new THREE.CapsuleGeometry(.075,.47,3,7),fabric,side*.31,1.08,0);arm.rotation.z=side*.12;
  add(new THREE.SphereGeometry(.077,8,6),face,side*.35,.76,.02);
 }
 add(new THREE.CylinderGeometry(.22,robe?.33:.25,.69,10),fabric,0,1.04,0);
 add(new THREE.BoxGeometry(.13,.4,.04),shirt,0,1.15,.21);
 add(new THREE.CylinderGeometry(.075,.08,.13,8),face,0,1.43,0);
 add(new THREE.SphereGeometry(.19,14,10),face,0,1.65,0);
 const cap=add(new THREE.SphereGeometry(.195,12,8,0,Math.PI*2,0,Math.PI*.56),hair,0,1.67,-.015);cap.rotation.x=-.12;
 add(new THREE.BoxGeometry(.12,.15,.035),hair,0,1.64,-.18);
 return root;
}
