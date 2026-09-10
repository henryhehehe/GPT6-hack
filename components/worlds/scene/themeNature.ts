import * as THREE from 'three';
import type {WorldTheme} from '@/lib/worldThemes';
import {themeLayout} from './themeLayouts';
import type {ArchitectureBounds} from './themeArchitecture';
import {themeWind,windGust} from './themeWind';
import {vegetationGeometry,foliageTexture} from './vegetationGeometry';

type Point={x:number;z:number};

/** Vegetation is composed in uneven groves, with clear source stations and paths. */
export function addThemeNature(scene:THREE.Scene,theme:WorldTheme,isWalkable:(p:Point,radius?:number)=>boolean){
 const root=new THREE.Group();root.name='Landscape and living nature';scene.add(root);
 const layout=themeLayout(theme),coast=['cove','island'].includes(layout.kind),interior=['study','assembly','meeting'].includes(layout.kind);
 const winter=layout.kind==='street',heath=layout.kind==='ruin',garden=layout.kind==='garden';
 let seed=[...theme.id].reduce((s,c)=>((s*31+c.charCodeAt(0))>>>0),91);
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const materials:THREE.MeshStandardMaterial[]=[],geometries:THREE.BufferGeometry[]=[],obstacles:ArchitectureBounds[]=[];
 const material=(color:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.95});materials.push(m);return m;};
 const bark=material(heath?'#514c42':'#74654d'),rock=material(theme.stone);
 const greens=(heath?['#626745','#767552','#4d5a40']:coast?['#637454','#7c8860','#485e42']:['#48653a','#687f45','#819658']).map(material);
 const grasses=(heath?['#8a795c','#6a6b43','#927a67']:coast?['#aa9f68','#929359','#71835a']:['#799450','#a2aa64','#54733d']).map(material);
 const petals=(heath?['#988091','#806d87']:['#e4d8b6','#b9a1c5','#bcba76']).map(material);
 // Fine folded blades and leaves keep a botanical silhouette at walking distance.
 for(const m of [...greens,...grasses,...petals]){m.vertexColors=true;m.side=THREE.DoubleSide;}
 const leafTexture=foliageTexture();
 const foliage=greens.map(g=>{const m=g.clone();m.vertexColors=false;m.map=leafTexture;m.alphaTest=.45;materials.push(m);return m;});
 const trunk=new THREE.CylinderGeometry(.7,1,1,7),blade=vegetationGeometry('grass'),plant=vegetationGeometry('plant'),flower=vegetationGeometry('flowers'),stone=new THREE.DodecahedronGeometry(1,0);
 const leafCard=new THREE.PlaneGeometry(1,1);geometries.push(trunk,blade,plant,flower,stone,leafCard);
 const batches=new Map<string,{g:THREE.BufferGeometry;m:THREE.Material;matrices:THREE.Matrix4[];cast:boolean}>(),transform=new THREE.Object3D();
 function put(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number,turn=0,tilt=0,cast=false){
  transform.position.set(x,y,z);transform.rotation.set(tilt,turn,0);transform.scale.set(sx,sy,sz);transform.updateMatrix();
  const key=`${g.uuid}:${m.uuid}:${cast}`,b=batches.get(key)??{g,m,matrices:[],cast};b.matrices.push(transform.matrix.clone());batches.set(key,b);
 }
 function branch(a:THREE.Vector3,b:THREE.Vector3,r:number){
  const delta=b.clone().sub(a);transform.position.copy(a).add(b).multiplyScalar(.5);transform.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());transform.scale.set(r,delta.length(),r);transform.updateMatrix();
  const key=`${trunk.uuid}:${bark.uuid}:true`,batch=batches.get(key)??{g:trunk,m:bark,matrices:[],cast:true};batch.matrices.push(transform.matrix.clone());batches.set(key,batch);
 }
 function tree(x:number,z:number,h:number,bare=false,local=false){
  const r=.13+h*.016;
  if(local)obstacles.push([x-r,x+r,z-r,z+r]);
  const lean=theme.id==='tempest'?h*.16:h*.025;
  branch(new THREE.Vector3(x,0,z),new THREE.Vector3(x+lean,h*.70,z+.1),r);
  for(let k=0;k<5;k++){
   const angle=k*2.4+random(),spread=h*(coast?.28:.22),end=new THREE.Vector3(x+lean+Math.cos(angle)*spread,h*(.68+random()*.27),z+Math.sin(angle)*spread);
   branch(new THREE.Vector3(x+lean*.6,h*.45,z),end,r*.40);
   if(!bare)for(let j=0;j<5;j++){
    const a=j*2.4,cr=h*(coast?.12:.17);
    for(let plane=0;plane<3;plane++)put(leafCard,foliage[(k+j)%3],end.x+Math.cos(a)*cr*.8,end.y+Math.sin(j)*cr*.4,end.z+Math.sin(a)*cr*.8,cr*2.4,cr*(coast?1.6:2.1),1,plane*Math.PI/3+a,.1*Math.sin(j),true);
   }
  }
 }
 function clear(p:Point,padding=0){
  if(Math.hypot(p.x-1,p.z-8)<2.5+padding)return false;
  for(const s of Object.values(layout.spots)){
   if(Math.abs(p.x-s.x)<5+padding&&Math.abs(p.z-s.z)<5+padding)return false;
   const length=Math.hypot(s.x,s.z),along=(p.x*s.x+p.z*s.z)/length,across=Math.abs(p.x*s.z-p.z*s.x)/length;
   if(along>-2&&along<length+2&&across<2+padding)return false;
  }
  return true;
 }
 const planted:Point[]=[];
 // Asymmetric foreground groves frame the view rather than ringing every world.
 if(!interior&&!winter&&layout.kind!=='courtyard')for(let i=0;i<170&&planted.length<(coast?10:heath?5:14);i++){
  const p={x:(random()-.5)*45,z:(random()-.5)*43};
  if(Math.hypot(p.x,p.z)<14||!clear(p,1)||!isWalkable(p,1)||planted.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<4.8))continue;
  planted.push(p);tree(p.x,p.z,coast?4+random()*2.2:5+random()*3,heath,true);
 }
 // Inland backdrops extend beyond the walkable set. Islands retain open water.
 if(!coast)for(let i=0;i<(winter?22:interior?35:65);i++){
  const x=(random()-.5)*125,z=-34-random()*36;
  if(Math.abs(x)<22&&z>-43)continue;
  tree(x,z,5+random()*8,winter||heath);
 }
 const outdoor=!interior&&!winter;
 if(outdoor){
  // Low mixed ground cover leaves every arrival apron and connecting route open.
  for(let i=0;i<2300;i++){
   const p={x:(random()-.5)*48,z:(random()-.5)*46};
   if(!clear(p)||!isWalkable(p,.5)||Math.hypot(p.x,p.z)>24)continue;
   if(layout.kind==='courtyard'&&!(p.x>3&&p.x<11&&p.z>10&&p.z<16))continue;
   const h=.16+random()*(heath?.38:.3);
   const spread=.17+random()*.10;
   put(blade,grasses[i%3],p.x,.005,p.z,spread,h,spread,random()*6);
   if(i%8===0)put(flower,petals[i%petals.length],p.x,h*.6,p.z,.14,.12,.14,random()*6);
   if(i%23===0)put(plant,greens[i%3],p.x,.005,p.z,.26+random()*.18,.25,.3,random()*6);
  }
 }
 // Plant the already-blocked beds instead of adding obstacles to their paths.
 const beds=garden?[[0,-5,7,3],[9,13,7,4],[-13,-3,5,3]]:layout.kind==='courtyard'?[[7,13,6.5,3.5]]:[];
 for(const [x,z,w,d] of beds)for(let i=0;i<100;i++){
  const xx=x+(random()-.5)*(w-.4),zz=z+(random()-.5)*(d-.4);
  put(plant,greens[i%3],xx,.86,zz,.32,.38,.32,random()*6);
  if(i%2===0)put(flower,petals[i%petals.length],xx,1.12,zz,.27,.20,.27,random()*6);
 }
 // Broken stone and heather occupy the heath's outer land, beyond the courtyard.
 if(heath)for(let i=0;i<28;i++){
  const x=(i%2?1:-1)*(25+random()*20),z=-30+random()*45,s=.5+random()*1.4;
  put(stone,rock,x,s*.35,z,s,s*.6,s*.8,random()*6);
 }
 const wind=themeWind(theme);
 const instances:THREE.InstancedMesh[]=[],swayBatches:{mesh:THREE.InstancedMesh;base:Float32Array;phase:Uint8Array;kind:'leaves'|'stems'}[]=[];
 const phases=new Float32Array(64),swayMatrix=new THREE.Matrix4();
 let disposed=false,lastWindFrame=-1,wasReduced=true;
 for(const b of batches.values()){
  const mesh=new THREE.InstancedMesh(b.g,b.m,b.matrices.length);mesh.name='Instanced landscape';b.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=b.cast;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);instances.push(mesh);
  const kind=foliage.includes(b.m as THREE.MeshStandardMaterial)?'leaves':b.g===blade||b.g===plant||b.g===flower?'stems':undefined;
  if(kind){
   mesh.name=kind==='leaves'?'Wind in foliage':'Wind in ground cover';mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
   const base=new Float32Array(mesh.instanceMatrix.array),phase=new Uint8Array(mesh.count);
   let margin=0;
   b.g.computeBoundingSphere();
   for(let i=0;i<mesh.count;i++){
    const o=i*16;phase[i]=Math.abs(Math.round(base[o+12]*9+base[o+14]*13+base[o+13]*7))%64;
    const scale=Math.max(Math.hypot(base[o],base[o+1],base[o+2]),Math.hypot(base[o+4],base[o+5],base[o+6]),Math.hypot(base[o+8],base[o+9],base[o+10]));
    margin=Math.max(margin,scale*b.g.boundingSphere!.radius*.4+.2);
   }
   // CPU instance transforms also drive depth shadows. Expand culling for every allowed pose.
   mesh.boundingSphere!.radius+=margin;mesh.computeBoundingBox();mesh.boundingBox!.expandByScalar(margin);
   swayBatches.push({mesh,base,phase,kind});
  }
 }
 // Small distant birds add movement without turning the setting into a crowd.
 const birds=new THREE.Group();birds.name='Distant birds';root.add(birds);
 const wingVertices=[0,0,0,-.48,.07,.12,-.12,0,.20,0,0,0,.12,0,.20,.48,.07,.12];
 const wing=new THREE.BufferGeometry();wing.setAttribute('position',new THREE.Float32BufferAttribute(wingVertices,3));wing.computeVertexNormals();geometries.push(wing);
 const birdMaterial=material('#53605b');birdMaterial.side=THREE.DoubleSide;
 if(!interior)for(let i=0;i<(coast?7:4);i++){
  const geometry=wing.clone();(geometry.getAttribute('position') as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);geometry.computeBoundingSphere();geometry.boundingSphere!.radius+=.3;geometries.push(geometry);
  birds.add(new THREE.Mesh(geometry,birdMaterial));
 }
 function update(time:number,reduced:boolean){
  if(disposed)return;
  const clock=Number.isFinite(time)?Math.max(0,time):0;
  if(reduced){
   if(!wasReduced)for(const b of swayBatches){b.mesh.instanceMatrix.array.set(b.base);b.mesh.instanceMatrix.needsUpdate=true;}
   wasReduced=true;lastWindFrame=-1;
  }else{
   const frame=Math.floor(clock*30);
   if(frame!==lastWindFrame||wasReduced){
    const t=frame/30,gust=windGust(wind,t);
    for(let i=0;i<64;i++)phases[i]=gust*(.72+.28*Math.sin(t*1.7+i*2.39996));
    for(const b of swayBatches)for(let i=0;i<b.mesh.count;i++){
     const o=i*16,amount=phases[b.phase[i]],bend=amount*(b.kind==='leaves'?.13:.28);
     const dx=wind.directionX*bend,dz=wind.directionZ*bend,e=swayMatrix.elements;
     for(let j=0;j<16;j++)e[j]=b.base[o+j];
     // Botanical meshes originate at soil level; shearing leaves their roots fixed.
     for(let j=0;j<12;j+=4){e[j]+=dx*b.base[o+j+1];e[j+2]+=dz*b.base[o+j+1];}
     if(b.kind==='leaves'){e[12]+=wind.directionX*amount*.12;e[14]+=wind.directionZ*amount*.12;}
     b.mesh.setMatrixAt(i,swayMatrix);
    }
    for(const b of swayBatches)b.mesh.instanceMatrix.needsUpdate=true;
    lastWindFrame=frame;wasReduced=false;
   }
  }
  birds.children.forEach((bird,i)=>{
   const t=(reduced?0:clock*.065)+i*.63;
   bird.position.set(Math.cos(t)*19,12+i*.6+Math.sin(t*2)*.5,-22+Math.sin(t)*9);bird.rotation.y=-t;bird.rotation.z=reduced?0:Math.sin(clock*2+i)*.08;
   // Alternating short flapping bouts and glides; each bird has its own cadence.
   const beat=reduced?0:Math.sin(clock*(4.2+i*.17)+i)*.38*Math.max(0,Math.sin(clock*.38+i*1.7));
   const geometry=(bird as THREE.Mesh).geometry,position=geometry.getAttribute('position'),cos=Math.cos(beat),sin=Math.sin(beat);
   for(let v=0;v<6;v++){
    const x=wingVertices[v*3],y=wingVertices[v*3+1];
    position.setXYZ(v,Math.sign(x)*(Math.abs(x)*cos-y*sin),Math.abs(x)*sin+y*cos,wingVertices[v*3+2]);
   }
   position.needsUpdate=true;geometry.computeVertexNormals();
  });
 }
 update(0,true);
 return {root,obstacles,planted,update,dispose(){if(disposed)return;disposed=true;root.removeFromParent();instances.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());leafTexture.dispose();}};
}
