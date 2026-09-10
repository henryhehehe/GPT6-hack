import * as THREE from 'three';

type Point={x:number;z:number};
export type SurfaceRectangle={x:number;z:number;width:number;depth:number;turn?:number};
const cross=(a:Point,b:Point,p:Point)=>(b.x-a.x)*(p.z-a.z)-(b.z-a.z)*(p.x-a.x);

function clip(polygon:Point[],a:Point,b:Point,inside:boolean){
 const result:Point[]=[];
 for(let i=0;i<polygon.length;i++){
  const p=polygon[i],q=polygon[(i+1)%polygon.length],dp=cross(a,b,p),dq=cross(a,b,q);
  const acceptP=inside?dp>=0:dp<=0,acceptQ=inside?dq>=0:dq<=0;
  if(acceptP)result.push(p);
  if(acceptP!==acceptQ){const t=dp/(dp-dq);result.push({x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t});}
 }
 return result;
}
function subtract(polygon:Point[],cutter:Point[]){
 const result:Point[][]=[];let remaining=polygon;
 for(let i=0;i<cutter.length&&remaining.length>=3;i++){
  const a=cutter[i],b=cutter[(i+1)%cutter.length],outside=clip(remaining,a,b,false);
  if(outside.length>=3)result.push(outside);
  remaining=clip(remaining,a,b,true);
 }
 return result;
}

/** Join crossing paths without stacked coplanar triangles or depth-bias tricks. */
export function surfaceUnionGeometry(rectangles:SurfaceRectangle[],height:number){
 const occupied:Point[][]=[],positions:number[]=[];
 for(const r of rectangles){
  const c=Math.cos(r.turn??0),s=Math.sin(r.turn??0);
  const polygon=[[-r.width/2,-r.depth/2],[r.width/2,-r.depth/2],[r.width/2,r.depth/2],[-r.width/2,r.depth/2]].map(([x,z])=>({x:r.x+x*c+z*s,z:r.z-x*s+z*c}));
  let pieces=[polygon];
  for(const prior of occupied)pieces=pieces.flatMap(p=>subtract(p,prior));
  for(const piece of pieces)for(let i=1;i<piece.length-1;i++){
   const [a,b,c]=[piece[0],piece[i+1],piece[i]];
   if(Math.abs(cross(a,b,c))<1e-8)continue;
   for(const p of [a,b,c])positions.push(p.x,height,p.z);
  }
  occupied.push(polygon);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();geometry.computeBoundingSphere();geometry.userData.worldSurface=true;
 return geometry;
}
