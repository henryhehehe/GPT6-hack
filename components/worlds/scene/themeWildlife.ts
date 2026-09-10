import * as THREE from 'three';
import type {WorldTheme} from '@/lib/worldThemes';
import {themeLayout} from './themeLayouts';

/** Interpretive background life; no species or historical event is asserted. */
export function addThemeWildlife(scene:THREE.Object3D,theme:WorldTheme){
 const kind=themeLayout(theme).kind,coast=kind==='cove'||kind==='island';
 const interior=['study','assembly','meeting'].includes(kind);
 const root=new THREE.Group();root.name='Living landscape';scene.add(root);
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[];
 const birds:{body:THREE.Group;left:THREE.Group;right:THREE.Group;phase:number}[]=[];
 const insects:{body:THREE.Group;left:THREE.Mesh;right:THREE.Mesh;x:number;z:number;phase:number}[]=[];
 const material=(color:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.86,side:THREE.DoubleSide});materials.push(m);return m;};
 const geometry=(vertices:number[],indices:number[])=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();geometries.push(g);return g;};
 const mesh=(g:THREE.BufferGeometry,m:THREE.Material)=>{const o=new THREE.Mesh(g,m);o.raycast=()=>{};return o;};
 if(!interior){
  const plumage=material(coast?'#d7d6cb':'#45443d'),tips=material('#393c39');
  const bodyGeometry=new THREE.SphereGeometry(1,10,7);geometries.push(bodyGeometry);
  // Tapered, swept wings with a narrow trailing edge, kept small enough to read as distant wildlife.
  const wing=geometry([0,0,.09,.19,.02,.14,.53,0,-.02,.63,-.01,-.14,.39,0,-.10,.12,0,-.11,0,0,-.06],[0,1,5,1,4,5,1,2,4,2,3,4,0,5,6]);
  const tail=geometry([-.045,0,-.11,.045,0,-.11,.075,0,-.27,-.075,0,-.27],[0,1,2,0,2,3]);
  for(let i=0;i<(coast?4:kind==='ruin'?3:2);i++){
   const body=new THREE.Group();body.name='Gliding bird';root.add(body);
   const torso=mesh(bodyGeometry,plumage);torso.scale.set(.075,.065,.19);body.add(torso);
   const head=mesh(bodyGeometry,plumage);head.scale.set(.057,.055,.065);head.position.set(0,.027,.16);body.add(head);
   const fan=mesh(tail,tips);body.add(fan);
   const left=new THREE.Group(),right=new THREE.Group();left.add(mesh(wing,plumage));right.add(mesh(wing,plumage));right.scale.x=-1;body.add(left,right);
   body.scale.setScalar(coast?1:.65);birds.push({body,left,right,phase:i*2.13});
  }
 }
 if(kind==='garden'||kind==='courtyard'){
  const wing=geometry([0,0,0,.055,0,.055,.12,0,.025,.10,0,-.045,.035,0,-.065],[0,1,2,0,2,3,0,3,4]);
  const cream=material('#d8c893'),umber=material('#9a713e');
  const beds=kind==='garden'?[[0,-5],[9,13],[-13,-3]]:[[7,13]];
  for(const [index,[x,z]] of beds.entries())for(let i=0;i<2;i++){
   const body=new THREE.Group();body.name='Garden insect';root.add(body);
   const left=mesh(wing,i?cream:umber),right=mesh(wing,i?cream:umber);right.scale.x=-1;body.add(left,right);
   insects.push({body,left,right,x,z,phase:index*2.4+i*3.1});
  }
 }
 let disposed=false;
 function update(time:number,reduced:boolean){
  if(disposed)return;root.visible=!reduced;if(reduced)return;
  const t=Number.isFinite(time)?Math.max(0,time):0;
  for(const bird of birds){
   const phase=t*(coast?.10:.13)+bird.phase;
   const x=Math.sin(phase)*19,z=-9+Math.sin(phase*.5+bird.phase)*16;
   const dx=Math.cos(phase)*19,dz=Math.cos(phase*.5+bird.phase)*8;
   bird.body.position.set(x,7.5+Math.sin(phase*.7+bird.phase)*1.3+bird.phase*.45,z);
   bird.body.rotation.set(Math.sin(phase*.7)*.045,Math.atan2(dx,dz),-Math.sin(phase)*.13);
   // Brief wingbeats alternate with longer glides; birds never flap in synchrony.
   const beatWindow=Math.max(0,Math.sin(t*.52+bird.phase));
   const flap=Math.sin(t*7.2+bird.phase)*.43*beatWindow;
   bird.left.rotation.z=flap+.05;bird.right.rotation.z=-flap-.05;
  }
  for(const insect of insects){
   const p=insect.phase;
   insect.body.position.set(insect.x+Math.sin(t*.43+p)*1.3,1.65+Math.sin(t*.91+p)*.3,insect.z+Math.cos(t*.57+p)*.85);
   insect.body.rotation.y=Math.atan2(Math.cos(t*.43+p)*.43,-Math.sin(t*.57+p)*.57);
   const flap=.25+Math.sin(t*21+p)*.95;insect.left.rotation.z=flap;insect.right.rotation.z=-flap;
  }
 }
 update(0,false);
 return {root,update,dispose(){if(disposed)return;disposed=true;root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
