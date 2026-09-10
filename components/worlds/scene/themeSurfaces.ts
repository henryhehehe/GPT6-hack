import * as THREE from 'three';
import {WORLD_SURFACES,type SurfaceFinish,type WorldTheme} from '@/lib/worldThemes';

export const SURFACE_TEXTURE_SIZE=256;
const SIZE=SURFACE_TEXTURE_SIZE;
const fract=(n:number)=>n-Math.floor(n);
const hash=(x:number,y:number)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453);
const smooth=(a:number,b:number,n:number)=>{const t=Math.max(0,Math.min(1,(n-a)/(b-a)));return t*t*(3-2*t);};
function noise(x:number,y:number){
 const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(0,1,fract(x)),fy=smooth(0,1,fract(y));
 return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),fx),THREE.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),fx),fy);
}
function periodic(u:number,v:number,fx:number,fy=fx){
 const x=u*fx,y=v*fy,ix=Math.floor(x),iy=Math.floor(y),a=smooth(0,1,fract(x)),b=smooth(0,1,fract(y));
 const h=(i:number,j:number)=>hash(((i%fx)+fx)%fx,((j%fy)+fy)%fy);
 return THREE.MathUtils.lerp(THREE.MathUtils.lerp(h(ix,iy),h(ix+1,iy),a),THREE.MathUtils.lerp(h(ix,iy+1),h(ix+1,iy+1),a),b);
}

/** Small deterministic material maps; no additional downloads or geometry displacement. */
export function surfaceTexel(finish:SurfaceFinish,u:number,v:number):{tone:number;height:number;roughness:number}{
 const grain=periodic(u,v,113,109),broad=periodic(u,v,5,7);
 let height=.55+grain*.15,tone=.94+grain*.06,roughness=.9;
 if(['brick','ashlar','slate'].includes(finish)){
  const cols=finish==='brick'?16:finish==='ashlar'?4:3,rows=finish==='brick'?40:finish==='ashlar'?8:6;
  const row=Math.floor(v*rows),x=u*cols+(row%2)*.5,y=v*rows;
  const edge=Math.min(fract(x),1-fract(x),fract(y),1-fract(y)),joint=1-smooth(.022,.085,edge),block=hash(Math.floor(x)%cols,((row%rows)+rows)%rows);
  const wear=periodic(u,v,29,31),pitting=smooth(.62,.88,grain)*.16;
  height=(.50+grain*.12+block*.12-pitting)*(1-joint*.68);
  tone=.76+block*.14+grain*.05+wear*.05-joint*.13;roughness=finish==='slate'?.65+wear*.18:.79+wear*.16;
 }else if(finish==='planks'||finish==='parquet'){
  const cellX=Math.floor(u*4),cellY=Math.floor(v*4),turn=finish==='parquet'&&(cellX+cellY)%2===1;
  const x=turn?v:u,y=turn?u:v,board=x*20,end=y*(finish==='parquet'?4:2)+Math.floor(board)%2*.5;
  const seam=Math.min(fract(board),1-fract(board),fract(end),1-fract(end));
  const ring=Math.sin(x*400+noise(x*4,y*10)*13+y*3)*.5+.5;
  const joint=1-smooth(.01,.045,seam);
  tone=.75+ring*.09+hash(Math.floor(board)%20,Math.floor(end)%4)*.12+broad*.04-joint*.18;height=.6+ring*.045-joint*.32;roughness=.5+grain*.12+broad*.1;
 }else if(finish==='sand'){
  const ripple=Math.sin(u*44+Math.sin(v*9)*1.8)*.5+.5;
  height=.4+ripple*.13+grain*.15;tone=.84+broad*.10+grain*.06;
 }else if(finish==='earth'){
  height=.35+broad*.25+grain*.2;tone=.72+broad*.20+grain*.08;
 }else if(finish==='chalk'){
  height=.4+broad*.15+grain*.1;tone=.93+broad*.05+grain*.02;
 }else if(finish==='frost'){
  height=.45+broad*.2+grain*.15;tone=.96+grain*.04;roughness=.77;
 }else{
  height=.5+grain*.08;tone=.97+broad*.03;roughness=.95;
 }
 return {tone,height,roughness};
}

function maps(finish:SurfaceFinish){
 const color=new Uint8Array(SIZE*SIZE*4),height=new Uint8Array(color.length),rough=new Uint8Array(color.length);
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const p=surfaceTexel(finish,x/SIZE,y/SIZE),offset=(y*SIZE+x)*4;
  const warm=['brick','planks','parquet','earth','sand'].includes(finish),stain=periodic(x/SIZE,y/SIZE,5,7);
  const pigment=warm?[1,.97+stain*.025,.94+stain*.05]:[.97+stain*.03,.985,1];
  for(let c=0;c<3;c++){color[offset+c]=Math.round(p.tone*pigment[c]*255);height[offset+c]=Math.round(p.height*255);rough[offset+c]=Math.round(p.roughness*255);}
  color[offset+3]=height[offset+3]=rough[offset+3]=255;
 }
 function texture(data:Uint8Array,srgb=false){
  const t=new THREE.DataTexture(data,SIZE,SIZE,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
 }
 return {map:texture(color,true),bumpMap:texture(height),roughnessMap:texture(rough)};
}

/** Apply only to native architectural shells. GLB models and their PBR materials are untouched. */
export function applyThemeSurfaces(scene:THREE.Scene,theme:WorldTheme){
 const profile=WORLD_SURFACES[theme.id];
 const root=scene.children.find(o=>o.name.startsWith('Architecture:'));
 const originals:{mesh:THREE.Mesh;geometry:THREE.BufferGeometry;material:THREE.Material|THREE.Material[]}[]=[],materials=new Map<string,THREE.MeshStandardMaterial>(),textures=new Map<SurfaceFinish,ReturnType<typeof maps>>();
 const ownedGeometry=new Set<THREE.BufferGeometry>();
 if(root&&profile){
  root.updateWorldMatrix(true,true);
  const palette={ground:new THREE.Color(theme.ground),stone:new THREE.Color(theme.stone),wall:new THREE.Color(theme.building),wood:new THREE.Color(theme.roof)};
  root.traverse(object=>{
   if(!(object instanceof THREE.Mesh)||!(object.material instanceof THREE.MeshStandardMaterial)||object.material.emissiveIntensity&&object.material.emissive.getHex()!==0)return;
   if(!['BoxGeometry','ExtrudeGeometry','CylinderGeometry'].includes(object.geometry.type)&&!object.geometry.userData.worldSurface)return;
   const old=object.material;
   let role=(Object.keys(palette) as (keyof typeof palette)[]).find(key=>palette[key].equals(old.color));
   if(!role&&['884d3b','806252'].includes(old.color.getHexString()))role='wall';
   if(!role)return;
   object.geometry.computeBoundingBox();
   const size=object.geometry.boundingBox!.getSize(new THREE.Vector3()).multiply(object.scale);
   // Keep tiny trim, book spines and narrow trunks free of oversized masonry/wood patterns.
   if(Math.max(size.x,size.y,size.z)<1||Math.min(size.x,size.z)<.4&&size.y>2)return;
   const winterTop=theme.id==='christmas-carol'&&role==='wood'&&object.position.y>8;
   const snowyRoof=winterTop&&size.y<Math.min(size.x,size.z)*.25;
   const chimney=winterTop&&size.y>Math.max(size.x,size.z);
   const finish=chimney?'brick':snowyRoof?'frost':profile[role],key=`${old.uuid}:${finish}:${role}`;
   let material=materials.get(key);
   if(!material){
    let detail=textures.get(finish);if(!detail){detail=maps(finish);textures.set(finish,detail);}
    material=old.clone();Object.assign(material,detail);material.bumpScale=finish==='limewash'?.008:finish==='planks'||finish==='parquet'?.008:finish==='brick'?.012:.023;
    material.roughness=profile.wet&&role==='stone'?.68:1;material.metalness=0;
    if(role==='wood'&&!snowyRoof)material.color.set(profile.woodColor);
    if(chimney)material.color.set('#884d3b');
    if(role==='stone')material.color.set(profile.stoneColor);
    material.name=`${theme.id}: ${role} / ${finish}`;materials.set(key,material);
   }
   const geometry=object.geometry.clone(),position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal'),uv=new Float32Array(position.count*2),p=new THREE.Vector3(),n=new THREE.Vector3(),normalMatrix=new THREE.Matrix3().getNormalMatrix(object.matrixWorld);
   // Meter-based UVs preserve the same brick/board size on long walls and small aprons.
   for(let i=0;i<position.count;i++){
    p.fromBufferAttribute(position,i).applyMatrix4(object.matrixWorld);n.fromBufferAttribute(normal,i).applyMatrix3(normalMatrix).normalize();
    const x=Math.abs(n.x),y=Math.abs(n.y),z=Math.abs(n.z);
    uv[i*2]=(y>x&&y>z?p.x:x>z?p.z:p.x)/4;
    uv[i*2+1]=(y>x&&y>z?p.z:p.y)/4;
   }
   geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));ownedGeometry.add(geometry);
   originals.push({mesh:object,geometry:object.geometry,material:old});object.geometry=geometry;object.material=material;
  });
 }
 let disposed=false;
 return {count:originals.length,dispose(){
  if(disposed)return;disposed=true;
  originals.forEach(o=>{o.mesh.geometry=o.geometry;o.mesh.material=o.material;});
  ownedGeometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(detail=>Object.values(detail).forEach(t=>t.dispose()));
 }};
}
