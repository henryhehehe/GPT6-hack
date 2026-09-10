import * as THREE from 'three';
import type {WorldTheme} from '@/lib/worldThemes';
import {settingPlacements,SETTING_SPOTS,SETTING_ASSETS,type SettingPlacement} from './settingLayout';
import {themeLayout} from './themeLayouts';
import {createDistantTerrain} from './themeTerrain';
import {externalPlacements} from './externalLayout';
import {themeExternalDetails,linkSupportStations} from './themeExternalDetails';
import {themeExternalActivityAreas} from './themeExternalActivityAreas';

export function themedPlacements(theme:WorldTheme){
 const spots=themeLayout(theme).spots;
 const result=settingPlacements(theme.furniture).filter(p=>{
  if(theme.id==='custom')return true;
  if(theme.id==='tempest'&&['sheep','cave-module','merchant-ship','amphora','storage-jar'].includes(p.id))return false;
  if(['paneled-wall','garden-path'].includes(p.id))return false;
  if(p.id==='garden-bench'&&theme.id!=='austen-letter')return false;
  if(p.id==='coast-rocks'&&theme.id==='tempest'&&Number(p.key.split('-').at(-1))%2===0)return false;
  return true;
 }).map(p=>p.zone?{...p,at:[p.at[0]+spots[p.zone].x-SETTING_SPOTS[p.zone].x,p.at[1],p.at[2]+spots[p.zone].z-SETTING_SPOTS[p.zone].z] as [number,number,number]}:p);
 // Existing detailed joinery is shared at the model level, arranged per building.
 const add=(id:SettingPlacement['id'],x:number,y:number,z:number,scale=1,turn=0)=>result.push({key:`architecture-${id}-${result.length}`,id,at:[x,y-SETTING_ASSETS[id].bounds.min[1]*scale,z],scale,turn,collision:'none'});
 const kind=themeLayout(theme).kind;
 if(['study','assembly','meeting'].includes(kind)){
  for(let x=-16;x<=16;x+=4)add('paneled-wall',x,0,-18.04,1.5);
  for(let x=-13.5;x<=13.5;x+=4.5){if(kind==='study'&&Math.abs(x)<2)continue;add('sash-window',x,2.6,-17.7,1.2);}
  if(kind!=='study')add('austen-doorway',15,0,-17.6,1.2);
 }else if(kind==='garden'){
  for(let x=-12;x<=12;x+=4)add('sash-window',x,5.6,-26.65,1.2);
  add('austen-doorway',0,0,-26.6,1.5);
 }else if(kind==='courtyard'){
  for(let x=-15.75;x<=15.75;x+=4.5)add('sash-window',x,2.6,-20.1,1.2);
  add('austen-doorway',-7,0,-20.1,1.2);
 }else if(kind==='street'){
  for(const sign of [-1,1])for(let i=0;i<5;i++){
   const z=-25+i*12;for(const dz of [-1.75,1.75])add('sash-window',sign*16.15,3.6,z+dz,1.2,-sign*Math.PI/2);
   add('austen-doorway',sign*16.1,0,z,1.15,-sign*Math.PI/2);
  }
 }
 return result;

}
export function themedExternalPlacements(theme:WorldTheme){
 if(theme.id==='custom')return externalPlacements(theme.furniture);
 const spots=themeLayout(theme).spots;
 // Reuse curated Kenney, Quaternius and Poly Haven objects without repeating full kits.
 const all=externalPlacements(theme.furniture).filter(p=>{
  if(p.key.startsWith('coastal-palm'))return false;
  if(theme.furniture==='coast')return theme.id==='odyssey-ix'||(!p.key.startsWith('coastal-')&&!p.key.startsWith('shore-rowboat'));
  return p.key.endsWith('-candle')||(theme.id==='austen-letter'&&(p.key.endsWith('-planter')||p.key.endsWith('-basket')||p.key.startsWith('garden-tea')));
 });
 const result=all.map(p=>p.zone?{...p,at:[p.at[0]+spots[p.zone].x-SETTING_SPOTS[p.zone].x,p.at[1],p.at[2]+spots[p.zone].z-SETTING_SPOTS[p.zone].z] as [number,number,number]}:p);
 const prop=(name:string)=>`quaternius-fantasy-props-${name}`;
 const add=(key:string,asset:string,x:number,z:number,scale=1,turn=0)=>result.push({key,asset,at:[x,0,z],scale,turn,solid:true});
 if(theme.id==='frankenstein'){
  add('study-bookcase-left',prop('bookcase-2'),-15,-4,1.5);
  add('study-bookcase-right',prop('bookcase-2'),15,-4,1.5);
  add('study-cabinet',prop('cabinet'),-8,-16,1.3);
  add('study-shelf',prop('shelf-arch'),8,-16,1.5);
 }else if(theme.id==='declaration'){
  add('assembly-table-left',prop('table-large'),-7,-6,1.6);
  add('assembly-table-right',prop('table-large'),7,-6,1.6);
 }else if(theme.id==='christmas-carol'){
  add('street-cart',prop('stall-cart-empty'),10,13);
  add('street-crate',prop('farmcrate-empty'),13,12);
  add('counting-house-cabinet',prop('cabinet'),-13,15);
 }else if(theme.id==='douglass-literacy'){
  add('courtyard-bench',prop('bench'),-11,14,1.5);
  add('courtyard-table',prop('workbench-drawers'),11,-10);
 }else if(theme.id==='seneca-falls'){
  add('meeting-lectern',prop('bookstand'),0,-15,1.4);
  add('meeting-desk',prop('table-large'),-10,-13,1.4);
 }else if(theme.id==='macbeth'){
  add('ruin-crate',prop('crate-wooden'),-13,-7);
  add('ruin-vessel',prop('vase-4'),13,-9);
 }else if(theme.id==='tempest'){
  result.push({key:'storm-east-shelf',asset:'polyhaven-coast_rocks_01',at:[31,-.4,-8],turn:.4,scale:1.7});
  result.push({key:'storm-rock-shelf',asset:'polyhaven-coast_rocks_01',at:[-31,-.15,10],turn:1.2,scale:1.5});
 }
 return linkSupportStations([...result,...themeExternalDetails(theme,result),...themeExternalActivityAreas(theme)]);
}

/** Distant scenery is outside the walking boundary; local furniture owns its collisions. */
export function addThemeScenery(scene:THREE.Scene,theme:WorldTheme){
 const root=new THREE.Group();root.name='Interpreted setting';scene.add(root);
 const terrain=createDistantTerrain(theme);if(terrain)root.add(terrain);
 let disposed=false;
 return {dispose(){if(disposed)return;disposed=true;root.removeFromParent();terrain?.geometry.dispose();terrain?.material.dispose();}};
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
