import * as THREE from 'three';
import {DISTRICT_BUILDINGS} from './cityLayout';

type Opening={x:number;bottom:number;width:number;height:number;door?:boolean};
export const NEIGHBORHOOD_HOUSES=[...DISTRICT_BUILDINGS,
 {x:-21,z:-13,w:8,d:8,h:5,style:1},
 {x:22,z:-14,w:8,d:10,h:7,style:0},
 {x:23,z:-3,w:7,d:6,h:4,style:0},
 {x:-23,z:-3,w:6,d:7,h:4,style:1},
];

/** Detailed, closed houses with genuinely recessed openings on all four sides.
 * Small repeated parts are instanced across the entire district. */
export function createDistrictHouses(parent:THREE.Object3D,plasterMap?:THREE.Texture){
 const root=new THREE.Group();root.name='DetailedDistrictHouses';parent.add(root);
 const make=(color:string,roughness=.92)=>new THREE.MeshStandardMaterial({color,roughness});
 const plaster=['#d7c8ab','#c8b28e','#ddd2ba','#c6b49e'].map(color=>{
  const m=make(color);if(plasterMap){m.map=plasterMap;m.bumpMap=plasterMap;m.bumpScale=.018;}return m;
 });
 const limestone=make('#c1af8e'),chalk=make('#e0d2b5'),mortar=make('#978b76');
 const timber=make('#64503b'),timberLight=make('#807055');
 const shutters=[make('#577b73'),make('#887455'),make('#776e61')];
 const clay=[make('#a77554'),make('#bc8961'),make('#956547')];
 const recess=make('#252d28'),metal=make('#6c6650',.5),reed=make('#b29e74');
 const materials=[...plaster,limestone,chalk,mortar,timber,timberLight,...shutters,...clay,recess,metal,reed];
 const cube=new THREE.BoxGeometry(1,1,1);
 const gableShape=new THREE.Shape();gableShape.moveTo(-.5,0);gableShape.lineTo(.5,0);gableShape.lineTo(0,1);gableShape.closePath();
 const gable=new THREE.ExtrudeGeometry(gableShape,{depth:1,bevelEnabled:false});gable.translate(0,0,-.5);
 // A shallow curved clay channel, with its long axis along local Z.
 const tile=new THREE.CylinderGeometry(1,1,1,8,1,true,0,Math.PI);tile.rotateX(Math.PI/2);tile.rotateZ(Math.PI/2);
 clay.forEach(m=>{m.side=THREE.DoubleSide;});
 const geometries=[cube,gable,tile];
 const batches=new Map<string,{g:THREE.BufferGeometry;m:THREE.Material;matrices:THREE.Matrix4[];cast:boolean}>();
 const transform=new THREE.Object3D();
 function part(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,w:number,h:number,d:number,ry=0,rx=0,rz=0,cast=true){
  // Rotate a tile into the roof run before applying its world-Z pitch.
  transform.position.set(x,y,z);transform.rotation.set(rx,ry,rz,'ZYX');transform.scale.set(w,h,d);transform.updateMatrix();
  const key=`${g.uuid}:${m.uuid}:${cast}`,batch=batches.get(key)??{g,m,matrices:[],cast};
  batch.matrices.push(transform.matrix.clone());batches.set(key,batch);
 }
 function box(m:THREE.Material,x:number,y:number,z:number,w:number,h:number,d:number,ry=0,rz=0,cast=true){part(cube,m,x,y+h/2,z,w,h,d,ry,0,rz,cast);}
 for(const [index,b] of NEIGHBORHOOD_HOUSES.entries()){
  const wall=plaster[index%plaster.length],paint=shutters[index%shutters.length],base=.95,roof=base+b.h;
  const facades=[{x:b.x,z:b.z+b.d/2,width:b.w,turn:0},{x:b.x+b.w/2,z:b.z,width:b.d,turn:Math.PI/2},{x:b.x,z:b.z-b.d/2,width:b.w,turn:Math.PI},{x:b.x-b.w/2,z:b.z,width:b.d,turn:-Math.PI/2}];
  for(const [side,f] of facades.entries()){
   const sin=Math.sin(f.turn),cos=Math.cos(f.turn);
   const faceBox=(m:THREE.Material,x:number,y:number,z:number,w:number,h:number,d:number,turn=0,cast=true)=>box(m,f.x+x*cos+z*sin,base+y,f.z-x*sin+z*cos,w,h,d,f.turn+turn,0,cast);
   const openings:Opening[]=[];
   if(side===0)openings.push({x:0,bottom:.05,width:1.28,height:2.18,door:true});
   for(const x of [-f.width*.29,f.width*.29]){
    openings.push({x,bottom:1.65,width:.96,height:1.22});
    if(b.h>6)openings.push({x,bottom:4.3,width:.88,height:1.12});
   }
   // Partition the wall around openings; no solid facade remains behind them.
   const xs=[...new Set([-f.width/2,f.width/2,...openings.flatMap(o=>[o.x-o.width/2,o.x+o.width/2])])].sort((a,b)=>a-b);
   const ys=[...new Set([0,b.h,...openings.flatMap(o=>[o.bottom,o.bottom+o.height])])].sort((a,b)=>a-b);
   for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
    const x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2;
    if(openings.some(o=>x>o.x-o.width/2&&x<o.x+o.width/2&&y>o.bottom&&y<o.bottom+o.height))continue;
    faceBox(wall,x,ys[j],-.16,xs[i+1]-xs[i],ys[j+1]-ys[j],.32);
   }
   // Individually separated ashlar base courses and alternating corner quoins.
   for(let row=0;row<3;row++)for(let x=-f.width/2+.37;x<f.width/2-.2;x+=.74){
    if(side===0&&Math.abs(x)<1.05)continue;
    faceBox((row+Math.round(x*10))%3?limestone:chalk,x,row*.24,.024,.70,.215,.07);
   }
   for(const sign of [-1,1])for(let row=0;row<Math.floor(b.h/.42);row++){
    const width=row%2?.31:.55;faceBox(row%3?limestone:chalk,sign*(f.width/2-width/2),row*.42,.036,width,.39,.095);
   }
   for(const [oi,o] of openings.entries()){
    const top=o.bottom+o.height;
    faceBox(recess,o.x,o.bottom,-.30,o.width,o.height,.035,0,false);
    for(const sign of [-1,1])faceBox(chalk,o.x+sign*(o.width/2+.085),o.bottom-.035,.02,.17,o.height+.07,.24);
    faceBox(chalk,o.x,top,.04,o.width+.42,.18,.29);
    faceBox(limestone,o.x,o.bottom-.12,.09,o.width+.42,.12,.44);
    if(o.door){
     for(let p=0;p<8;p++)faceBox(p%3?timber:timberLight,o.x-o.width/2+(p+.5)*o.width/8,o.bottom,-.235,o.width/8-.009,o.height-.025,.06);
     for(const y of [.36,1.72])faceBox(metal,o.x,o.bottom+y,-.19,o.width-.12,.065,.035,0,false);
     faceBox(metal,o.x+.36,1.03,-.13,.07,.19,.09);
    }else{
     // One closed leaf and one opened leaf expose the depth of the reveal.
     const leaf=o.width/2-.018,hinge=o.x-o.width/2,angle=(oi+side+index)%3===0?-.55:0;
     const cx=hinge+Math.cos(angle)*leaf/2,cz=.015-Math.sin(angle)*leaf/2;
     for(let p=0;p<3;p++)faceBox(paint,cx+(p-1)*leaf/3*Math.cos(angle),o.bottom+.025,cz-(p-1)*leaf/3*Math.sin(angle),leaf/3-.012,o.height-.05,.075,angle);
     for(let p=0;p<3;p++)faceBox(paint,o.x+(p+.5)*leaf/3,o.bottom+.025,-.14,leaf/3-.012,o.height-.05,.07);
     for(const y of [.22,o.height-.27]){
      faceBox(timberLight,cx,o.bottom+y,cz+.04,leaf-.03,.065,.035,angle);
      faceBox(timberLight,o.x+leaf/2,o.bottom+y,-.09,leaf-.03,.065,.035);
     }
    }
   }
   // Layered eaves, individual corbels and a restrained mid-storey string course.
   faceBox(limestone,0,b.h-.23,.045,f.width,.14,.18);
   faceBox(chalk,0,b.h-.09,.11,f.width+.28,.15,.34);
   for(let x=-f.width/2+.38;x<f.width/2;x+=.56)faceBox(chalk,x,b.h-.38,.08,.16,.17,.24);
   if(b.h>6)faceBox(limestone,0,3.58,.032,f.width,.11,.10);
  }
  box(mortar,b.x,roof,b.z,b.w-.28,.12,b.d-.28);
  if(b.style===1){
   // Low tiled roof: visible courses and ridge caps replace the flat red slab.
   const rise=1.15,half=b.w/2+.2,slope=Math.atan2(rise,half),length=Math.hypot(half,rise);
   for(const sign of [-1,1])part(gable,wall,b.x,roof+.12,b.z+sign*(b.d/2-.16),b.w,rise,.32);
   for(const sign of [-1,1]){
    box(clay[2],b.x+sign*half/2,roof+.16+rise/2,b.z,length,.13,b.d+.45,0,-sign*slope);
    const rows=Math.ceil(length/.5),cols=Math.ceil((b.d+.4)/.33);
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
     const along=(row+.5)/rows,xx=b.x+sign*half*along,yy=roof+.29+rise*(1-along);
     // Channels follow the fall of the roof, spaced to leave readable seams.
     part(tile,clay[(row+col+index)%3],xx,yy,b.z-(b.d+.4)/2+(col+.5)*(b.d+.4)/cols,.18,.09,length/rows+.045,Math.PI/2,0,-sign*slope,false);
    }
   }
   for(let z=b.z-b.d/2;z<b.z+b.d/2;z+=.48)part(tile,clay[1],b.x,roof+rise+.30,z,.22,.13,.51,0,0,0,false);
  }else{
   for(const sign of [-1,1]){
    box(wall,b.x,roof+.1,b.z+sign*(b.d/2-.14),b.w,.50,.28);
    box(chalk,b.x,roof+.60,b.z+sign*(b.d/2-.14),b.w+.1,.10,.36);
    box(wall,b.x+sign*(b.w/2-.14),roof+.1,b.z,.28,.50,b.d-.56);
    box(chalk,b.x+sign*(b.w/2-.14),roof+.60,b.z,.36,.10,b.d-.56);
   }
   // A roof shade frame stays entirely within the existing house footprint.
   if(index%2===0){
    for(const x of [-1.6,1.6])for(const z of [-1.4,1.4])box(timber,b.x+x,roof+.12,b.z+z,.11,1.8,.11);
    for(const z of [-1.4,1.4])box(timber,b.x,roof+1.92,b.z+z,3.6,.12,.13);
    for(let x=-1.7;x<=1.7;x+=.16)box(reed,b.x+x,roof+2.05,b.z,.055,.055,3.1);
   }
  }
  // Existing shop awning footprint is retained, now with slats and striped cloth.
  if(b.style===2){
   for(const side of [-1,1])box(timber,b.x+side*b.w*.33,base,b.z+b.d/2+2.25,.14,2.55,.14);
   box(timber,b.x,3.43,b.z+b.d/2+2.25,b.w*.74,.13,.16);
   for(let x=-b.w*.35;x<b.w*.36;x+=.38){
    box(timberLight,b.x+x,3.50,b.z+b.d/2+1.18,.065,.08,2.40);
    box((Math.round(x/.38)+index)%2?reed:chalk,b.x+x,3.61,b.z+b.d/2+1.18,.365,.045,2.40);
   }
  }
 }
 const instances:THREE.InstancedMesh[]=[];
 for(const batch of batches.values()){
  const mesh=new THREE.InstancedMesh(batch.g,batch.m,batch.matrices.length);mesh.name='House architectural details';
  batch.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=batch.cast;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);instances.push(mesh);
 }
 return {root,dispose(){parent.remove(root);instances.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
