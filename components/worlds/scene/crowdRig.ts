import * as THREE from 'three';
/** Small articulated street walker: authored face/hair over a jointed short tunic. */
export function createCrowdRig(source:THREE.Object3D,height:number,color:string){
 const root=new THREE.Group(),owned:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[];
 source.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(source),scale=height/(bounds.max.y-bounds.min.y);
 source.traverse(o=>{if(!(o instanceof THREE.Mesh))return;
  const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);g.translate(0,-bounds.min.y,0);g.scale(scale,scale,scale);
  const positions=g.getAttribute('position'),selected:number[]=[];
  for(let i=0;i<positions.count;i+=3)if(Math.min(positions.getY(i),positions.getY(i+1),positions.getY(i+2))>height*.79)selected.push(i,i+1,i+2);
  if(selected.length){const head=new THREE.BufferGeometry();for(const name of Object.keys(g.attributes)){const a=g.getAttribute(name),values=[];for(const i of selected)for(let j=0;j<a.itemSize;j++)values.push(a.array[i*a.itemSize+j]);head.setAttribute(name,new THREE.Float32BufferAttribute(values,a.itemSize));}head.computeBoundingSphere();owned.push(head);const mesh=new THREE.Mesh(head,o.material);mesh.castShadow=true;root.add(mesh);}g.dispose();
 });
 const cloth=new THREE.MeshStandardMaterial({color,roughness:.95}),skin=new THREE.MeshStandardMaterial({color:'#b78a65',roughness:.9}),sandal=new THREE.MeshStandardMaterial({color:'#514034',roughness:1});materials.push(cloth,skin,sandal);
 const s=height/1.75;
 function part(parent:THREE.Object3D,g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number){owned.push(g);const mesh=new THREE.Mesh(g,m);mesh.position.set(x*s,y*s,z*s);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 part(root,new THREE.CylinderGeometry(.24*s,.30*s,.67*s,12),cloth,0,1.12,0);
 part(root,new THREE.CylinderGeometry(.10*s,.115*s,.12*s,10),skin,0,1.47,0);
 const limbs:[THREE.Group,THREE.Group,THREE.Mesh,number][]=[];
 for(const side of [-1,1]){
  const hip=new THREE.Group();hip.position.set(side*.12*s,.8125*s,0);root.add(hip);
  part(hip,new THREE.CylinderGeometry(.085*s,.065*s,.39*s,8),skin,0,-.195,0);
  const knee=new THREE.Group();knee.position.y=-.39*s;hip.add(knee);part(knee,new THREE.CylinderGeometry(.062*s,.043*s,.39*s,8),skin,0,-.195,0);
  const foot=part(knee,new THREE.BoxGeometry(.125*s,.065*s,.25*s),sandal,0,-.39,.055);
  const arm=new THREE.Group();arm.position.set(side*.28*s,1.39*s,0);root.add(arm);part(arm,new THREE.CylinderGeometry(.06*s,.044*s,.48*s,8),skin,0,-.24,0);limbs.push([hip,knee,foot,side]);arm.name=`arm${side}`;
 }
 return {root,update(distance:number,moving:boolean){
  const stride=.70*s,cycle=distance/stride;
  for(const [hip,knee,foot,side] of limbs){const phase=(cycle+(side===1?.5:0))%1;
   // Ground-contact half-cycle moves backward at the body's actual travel speed.
   const z=moving?(phase<.5?.175*s-phase*.70*s:-.175*s+(phase-.5)*.70*s):0;
   const lift=moving&&phase>=.5?Math.sin((phase-.5)*Math.PI*2)*.095*s:0;
   const y=.78*s-lift,L=.39*s,d=Math.min(.7799*s,Math.hypot(y,z)),bend=Math.acos(THREE.MathUtils.clamp(d/(2*L),-1,1));
   hip.rotation.x=-Math.atan2(z,y)-bend;knee.rotation.x=2*bend;foot.rotation.x=-hip.rotation.x-knee.rotation.x;
   root.getObjectByName(`arm${side}`)!.rotation.x=moving?Math.sin(phase*Math.PI*2)*.22:0;
  }
 },dispose(){owned.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
