import * as THREE from 'three';
import {CITY_COLUMNS,CITY_TREES,DISTRICT_BUILDINGS} from './cityLayout';

function stoneTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
 c.fillStyle='#a69a83';c.fillRect(0,0,512,512);
 let seed=37;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let row=0;row<8;row++)for(let col=-1;col<4;col++){
  const x=col*170+(row%2)*85,y=row*64,shade=172+Math.floor(random()*24);c.fillStyle=`rgb(${shade+25},${shade+16},${shade})`;c.fillRect(x+2,y+2,166,60);
  c.strokeStyle='#e0d4bb';c.lineWidth=1;c.strokeRect(x+3,y+3,164,58);
 }
 for(let i=0;i<19000;i++){const light=random()>.5;c.fillStyle=light?'#ffffff0c':'#382a1710';const s=1+random()*2;c.fillRect(random()*512,random()*512,s,s);}
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}

/** Repeated architecture is instanced: district size does not multiply draw calls. */
export function createCityDistrict(parent:THREE.Object3D){
 const root=new THREE.Group();root.name='ExpandedAlexandriaDistrict';parent.add(root);
 const masonry=stoneTexture(),paving=masonry.clone();paving.repeat.set(.16,.16);paving.needsUpdate=true;
 const stone=new THREE.MeshStandardMaterial({map:masonry,bumpMap:masonry,bumpScale:.08,color:'#e0c7a2',roughness:.88});
 const plaster=new THREE.MeshStandardMaterial({color:'#d9c6a6',roughness:.93});
 const trim=new THREE.MeshStandardMaterial({color:'#e6d5b4',roughness:.8});
 const terracotta=new THREE.MeshStandardMaterial({color:'#a86848',roughness:.85});
 const wood=new THREE.MeshStandardMaterial({color:'#544336',roughness:.88});
 const shadow=new THREE.MeshStandardMaterial({color:'#293f3c',roughness:1});
 const leaves=new THREE.MeshStandardMaterial({color:'#637957',roughness:.9});
 const darkLeaves=new THREE.MeshStandardMaterial({color:'#36584c',roughness:.9});
 const brass=new THREE.MeshStandardMaterial({color:'#a6884b',metalness:.6,roughness:.45});
 const cloth=new THREE.MeshStandardMaterial({color:'#afbb9c',side:THREE.DoubleSide,roughness:1});
 const floor=new THREE.MeshStandardMaterial({map:paving,bumpMap:paving,bumpScale:.045,color:'#d8c8ab',roughness:.94,side:THREE.DoubleSide});
 const materials=[stone,plaster,trim,terracotta,wood,shadow,leaves,darkLeaves,brass,cloth,floor];
 const cube=new THREE.BoxGeometry(1,1,1),column=new THREE.CylinderGeometry(1,1,1,12),sphere=new THREE.SphereGeometry(1,12,8),cone=new THREE.ConeGeometry(1,1,12);
 const geometries=new Set<THREE.BufferGeometry>([cube,column,sphere,cone]);
 const batches=new Map<string,{geometry:THREE.BufferGeometry;material:THREE.Material;matrices:THREE.Matrix4[];shadow:boolean}>();
 const transform=new THREE.Object3D();
 function put(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number,turn=0,cast=true){
  const key=`${geometry.uuid}:${material.uuid}:${cast}`;let batch=batches.get(key);if(!batch){batch={geometry,material,matrices:[],shadow:cast};batches.set(key,batch);}
  transform.position.set(x,y,z);transform.rotation.set(0,turn,0);transform.scale.set(sx,sy,sz);transform.updateMatrix();batch.matrices.push(transform.matrix.clone());
 }
 const box=(m:THREE.Material,x:number,y:number,z:number,w:number,h:number,d:number,turn=0,cast=true)=>put(cube,m,x,y+h/2,z,w,h,d,turn,cast);
 const treePositions:{x:number;z:number;scale:number}[]=[],foliageFallback=new THREE.Group();root.add(foliageFallback);
 function tree(x:number,z:number,scale=1){
  treePositions.push({x,z,scale});const trunk=new THREE.Mesh(column,wood);trunk.position.set(x,3.3,z);trunk.scale.set(.16,4.8,.16);foliageFallback.add(trunk);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2,leaf=new THREE.Mesh(sphere,i%2?leaves:darkLeaves);leaf.position.set(x+Math.cos(a)*1.05*scale,5.6+Math.sin(i*3)*.35,z+Math.sin(a)*1.05*scale);leaf.scale.set(1.5*scale,.45*scale,.62*scale);leaf.rotation.y=-a;foliageFallback.add(leaf);}
 }
 // Streets connect the original waterfront to the districts and garden.
 for(const [x,z,w,d] of [[0,-28,53,5],[-27,-37,5,65],[28,-38,5,66],[-43,3,37,5],[48,3,37,5],[0,-34,36,4],[0,-66,36,4],[0,-49,5,34]] as const)box(trim,x,.91,z,w,.035,d,0,false);
 for(const b of DISTRICT_BUILDINGS){
  box(b.style===1?stone:plaster,b.x,.94,b.z,b.w,b.h,b.d);
  box(stone,b.x,.94,b.z,b.w+.18,.55,b.d+.18);
  box(trim,b.x,.94+b.h,b.z,b.w+.55,.3,b.d+.55);
  box(terracotta,b.x,1.25+b.h,b.z,b.w-.2,.18,b.d-.2);
  // Parapet perimeter, shaded doors and inset shutters retain depth at walking scale.
  for(const side of [-1,1]){box(trim,b.x,1.3+b.h,b.z+side*(b.d/2-.14),b.w,.55,.28);box(trim,b.x+side*(b.w/2-.14),1.3+b.h,b.z,.28,.55,b.d);}
  box(shadow,b.x,1,b.z+b.d/2+.025,1.7,2.5,.06,0,false);box(wood,b.x,1,b.z+b.d/2+.075,1.35,2.35,.06,0,false);
  for(const side of [-1,1])for(const level of [2.7,5.2]){if(level+1>b.h)continue;const x=b.x+side*b.w*.29,z=b.z+b.d/2+.1;box(shadow,x,level,z,1.25,1.45,.09,0,false);box(wood,x-.34,level+.08,z+.09,.5,1.25,.1,0,false);box(trim,x,level-.14,z+.12,1.5,.15,.35,0,false);}
  if(b.style===2){box(wood,b.x,3.6,b.z+b.d/2+1.25,b.w*.72,.18,2.4);box(cloth,b.x,4.8,b.z+b.d/2+1.25,b.w*.76,.08,2.5);for(const side of [-1,1])put(column,wood,b.x+side*b.w*.33,2.9,b.z+b.d/2+2.25,.07,4,.07);}
  put(column,terracotta,b.x+b.w*.3,1.5,b.z+b.d/2+.7,.38,1.1,.38,0,false);
 }
 // An open colonnade: tall columns, layered capitals, overhead beams.
 for(const p of CITY_COLUMNS){
  box(trim,p.x,.95,p.z,1.25,.3,1.25);put(column,stone,p.x,4.1,p.z,.42,5.7,.42);
  box(trim,p.x,6.95,p.z,1.2,.35,1.2);box(trim,p.x,7.3,p.z,1.55,.28,1.55);
 }
 for(const x of [-19,19]){box(trim,x,7.55,-51,1.65,.6,38);box(terracotta,x,8.15,-51,3,.18,38);}
 box(trim,0,7.55,-69,39,.6,1.65);box(terracotta,0,8.15,-69,40,.18,3);
 // Garden beds are recessed away from the clear cross-shaped paths.
 for(const x of [-10,10])for(const z of [-43,-59])box(darkLeaves,x,.94,z,10,.12,9,0,false);
 put(column,trim,0,1.2,-52,2.35,.5,2.35);put(column,stone,0,1.45,-52,2.04,.18,2.04);put(column,brass,0,2,-52,.18,1.2,.18);
 const pool=new THREE.Mesh(new THREE.CircleGeometry(1.9,48),new THREE.MeshPhysicalMaterial({color:'#4a9290',roughness:.2,metalness:.2,clearcoat:1}));pool.rotation.x=-Math.PI/2;pool.position.set(0,1.55,-52);root.add(pool);geometries.add(pool.geometry);materials.push(pool.material);
 for(const x of [-11,11])for(const z of [-42,-61]){box(trim,x,1.5,z,4,.2,1.05);for(const dx of [-1.5,1.5])box(stone,x+dx,.95,z,.35,.55,.7);}
 for(const p of CITY_TREES)tree(p.x,p.z,p.scale);
 // Waterfront parapets and mooring posts signal the actual walk boundary.
 for(let x=34;x<64;x+=3){box(stone,x,.95,10,2.8,.65,.65);put(column,trim,x,1.8,10,.25,1.1,.25);}
 for(let x=-59;x<-28;x+=3)box(stone,x,.95,8.7,2.7,.75,.55);
 // A distant coastal ridge dissolves into atmospheric haze, beyond the playable city.
 const ridgeMaterial=new THREE.MeshStandardMaterial({color:'#8e9b88',roughness:1});materials.push(ridgeMaterial);
 for(let i=0;i<9;i++)put(sphere,ridgeMaterial,-380+i*92,-8,-320-(i%3)*35,100,24+(i*13)%32,90,0,false);
 for(let i=0;i<32;i++){const x=-120+i*8,z=-235-(i%4)*12,h=3+(i*7)%7;box(plaster,x,-.3,z,5,h,7,0,false);box(terracotta,x,h-.3,z,5.3,.35,7.3,0,false);}
 const instances:THREE.InstancedMesh[]=[];
 for(const batch of batches.values()){const mesh=new THREE.InstancedMesh(batch.geometry,batch.material,batch.matrices.length);batch.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=batch.shadow;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);instances.push(mesh);}
 let foliageReady=false;
 return {floor,upgradeFoliage(template?:THREE.Object3D){
  if(foliageReady||!template)return;foliageReady=true;
  const foliageBatches=new Map<string,{mesh:THREE.Mesh;matrices:THREE.Matrix4[]}>();
  for(const p of treePositions){const group=new THREE.Group();group.add(template.clone(true));group.position.set(p.x,.95,p.z);group.scale.setScalar(p.scale);group.rotation.y=(p.x+p.z)*.37;group.updateMatrixWorld(true);group.traverse(child=>{if(!(child instanceof THREE.Mesh))return;const key=child.geometry.uuid+':'+(Array.isArray(child.material)?child.material.map(m=>m.uuid).join(':'):child.material.uuid);const batch=foliageBatches.get(key)??{mesh:child,matrices:[] as THREE.Matrix4[]};batch.matrices.push(child.matrixWorld.clone());foliageBatches.set(key,batch);});}
  for(const {mesh,matrices} of foliageBatches.values()){const instance=new THREE.InstancedMesh(mesh.geometry,mesh.material,matrices.length);matrices.forEach((matrix,i)=>instance.setMatrixAt(i,matrix));instance.castShadow=false;instance.receiveShadow=true;instance.computeBoundingSphere();root.add(instance);instances.push(instance);}foliageFallback.visible=false;
 },dispose(){parent.remove(root);instances.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());masonry.dispose();paving.dispose();}};
}
