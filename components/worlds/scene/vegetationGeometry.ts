import * as THREE from 'three';

/** Original, opaque botanical meshes. Shared instances retain thin silhouettes without alpha overdraw. */
export function vegetationGeometry(kind:'grass'|'plant'|'flowers'){
 const positions:number[]=[],colors:number[]=[],indices:number[]=[];
 function vertex(x:number,y:number,z:number,shade:number){
  positions.push(x,y,z);colors.push(shade,shade,shade);return positions.length/3-1;
 }
 // A folded ribbon follows a curved centreline. Its ridge catches the light like a leaf vein.
 function leaf(angle:number,length:number,reach:number,width:number,base:number,shade:number){
  const rows:number[][]=[],ca=Math.cos(angle),sa=Math.sin(angle);
  for(let row=0;row<4;row++){
   const t=row/4,d=reach*t*t,y=base+length*(t-.22*t*t),w=width*(.40+Math.sin(t*Math.PI)*.60)*(1-t*.5);
   const fold=w*.24,light=shade*(.62+t*.36);
   rows.push([vertex(ca*d-sa*w,y,sa*d+ca*w,light),vertex(ca*d,y+fold,sa*d,light*1.08),vertex(ca*d+sa*w,y,sa*d-ca*w,light*.92)]);
  }
  for(let row=0;row<3;row++)for(let side=0;side<2;side++){
   const a=rows[row][side],b=rows[row][side+1],c=rows[row+1][side],d=rows[row+1][side+1];
   indices.push(a,c,b,b,c,d);
  }
  const tip=vertex(ca*reach,base+length*.78,sa*reach,shade),last=rows[3];
  indices.push(last[0],tip,last[1],last[1],tip,last[2]);
 }
 if(kind==='grass'){
  for(let i=0;i<7;i++)leaf(i*2.39996,1+(i%3)*.12,.28+(i%4)*.11,.045+(i%2)*.012,0,.88+(i%3)*.06);
 }else if(kind==='plant'){
  for(let i=0;i<11;i++)leaf(i*2.39996,.45+(i%4)*.16,.48+(i%3)*.19,.16+(i%2)*.045,0,.82+(i%4)*.06);
 }else{
  // Five asymmetric open blooms per instance, with petals cupped around a small centre.
  for(let bloom=0;bloom<5;bloom++){
   const a=bloom*2.39996,r=bloom===0?0:.30,cx=Math.cos(a)*r,cz=Math.sin(a)*r,cy=.15+(bloom%3)*.17;
   for(let p=0;p<5;p++){
    const angle=p*Math.PI*2/5+bloom,ca=Math.cos(angle),sa=Math.sin(angle);
    const root=vertex(cx,cy,cz,.62),left=vertex(cx+ca*.15-sa*.09,cy+.09,cz+sa*.15+ca*.09,.94);
    const tip=vertex(cx+ca*.27,cy+.07,cz+sa*.27,1),right=vertex(cx+ca*.15+sa*.09,cy+.09,cz+sa*.15-ca*.09,.87);
    indices.push(root,left,tip,root,tip,right);
   }
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.name=`Botanical ${kind}`;
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);
 geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

/** Leaf pigment, midribs and soft serrated edges are painted procedurally; no external artwork. */
export function foliageTexture(){
 const size=128,pixels=new Uint8Array(size*size*4),leaves=Array.from({length:60},(_,i)=>{
  const a=i*2.39996,r=.43*Math.sqrt((i+.5)/60);return {x:.5+Math.cos(a)*r,y:.5+Math.sin(a)*r,a,shade:.76+(i%7)*.034};
 });
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const offset=(y*size+x)*4;
  for(const l of leaves){
   const dx=x/size-l.x,dy=y/size-l.y,u=(dx*Math.cos(l.a)+dy*Math.sin(l.a))/.095,v=(-dx*Math.sin(l.a)+dy*Math.cos(l.a))/.040;
   if(u*u+v*v>1-.065*Math.abs(Math.sin(u*23)))continue;
   const vein=Math.abs(v)<.055?1.15:1,shade=l.shade*(.84+.16*(1-v*v))*vein;
   pixels[offset]=Math.min(255,Math.round(242*shade));pixels[offset+1]=Math.min(255,Math.round(255*shade));pixels[offset+2]=Math.min(255,Math.round(208*shade));pixels[offset+3]=255;
  }
 }
 const texture=new THREE.DataTexture(pixels,size,size);texture.name='Original veined foliage';texture.needsUpdate=true;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
