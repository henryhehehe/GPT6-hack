import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import type {World} from '@/lib/world';
import {createCrowdRig} from './crowdRig';
import {CROWD_ROUTES,approachingPerson,type CrowdRoute} from './crowdRoutes';
import {groundHeight,moveWalker} from './walkGeometry';

type Person={rig:ReturnType<typeof createCrowdRig>|null;root:THREE.Group;route:CrowdRoute;index:number;mixer:THREE.AnimationMixer|null;walk:THREE.AnimationAction|null;idle:THREE.AnimationAction|null;travel:number;direction:number;pause:number;clock:number};
/** Authored adults share geometry/materials. Unrigged assets stay planted, never skate. */
export function loadStreetCrowd(parent:THREE.Object3D){
 const root=new THREE.Group();root.name='AuthoredStreetCrowd';parent.add(root);
 const people:Person[]=[],sources:THREE.Object3D[]=[];let disposed=false;
 const loader=new GLTFLoader();
 const release=(source:THREE.Object3D)=>{const gs=new Set<THREE.BufferGeometry>(),ms=new Set<THREE.Material>(),ts=new Set<THREE.Texture>();source.traverse(o=>{if(!(o instanceof THREE.Mesh))return;gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){ms.add(m);Object.values(m).forEach(v=>{if(v instanceof THREE.Texture)ts.add(v);});}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());};
 ['ochre','teal','indigo','rose'].forEach((variant,variantIndex)=>{
  void loader.loadAsync(`/models/characters/citizen-${variant}.glb`).then(gltf=>{
   if(disposed){release(gltf.scene);return;}sources.push(gltf.scene);
   const bounds=new THREE.Box3().setFromObject(gltf.scene),height=bounds.max.y-bounds.min.y;
   const walkingClip=gltf.animations.find(c=>/walk/i.test(c.name)),idleClip=gltf.animations.find(c=>/idle|stand/i.test(c.name));
   CROWD_ROUTES.forEach((route,index)=>{if(index%4!==variantIndex)return;
    const body=clone(gltf.scene),person=new THREE.Group(),adultHeight=1.58+(index*7%11)*.03;
    body.scale.multiplyScalar(adultHeight/Math.max(height,.01));body.position.y-=bounds.min.y*adultHeight/Math.max(height,.01);
    body.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});const rig=index%5===0?createCrowdRig(gltf.scene,adultHeight,['#ad783d','#376b64','#454f6b','#9a6260'][variantIndex]):null;person.add(rig?rig.root:body);root.add(person);
    person.position.set(route.points[0].x,groundHeight(route.points[0]),route.points[0].z);person.rotation.y=rig?Math.atan2(route.points[1].x-route.points[0].x,route.points[1].z-route.points[0].z):index*2.39996;
    const mixer=gltf.animations.length?new THREE.AnimationMixer(body):null;
    const walk=walkingClip&&mixer?mixer.clipAction(walkingClip):null,idle=idleClip&&mixer?mixer.clipAction(idleClip):null;idle?.play();
    people.push({rig,root:person,route,index,mixer,walk,idle,travel:0,direction:1,pause:2+index%5,clock:0});
   });
  }).catch(()=>{/* A decorative character load cannot interrupt the lesson. */});
 });
 return {update(dt:number,t:number,camera:THREE.Camera,world:World,blend:number,reduced:boolean){
  const delta=Math.min(.05,Math.max(0,dt));
  for(const p of people){
   const group=CROWD_ROUTES.filter(r=>r.zone===p.route.zone),rank=group.indexOf(p.route),activity=world.nodes.find(n=>n.id===p.route.zone)?.activity??1;
   p.root.visible=rank/group.length<1-THREE.MathUtils.clamp(blend,0,1)*(1-activity);if(!p.root.visible)continue;
   const distance=camera.position.distanceTo(p.root.position);
   // Most figures retain the full authored body; six use an articulated walking variant.
   if((!p.walk&&!p.rig)||reduced){p.walk?.stop();p.rig?.update(p.travel,false);if(!reduced&&distance<45){const turn=Math.sin(t*.16+p.index)*.08;p.root.rotation.y=THREE.MathUtils.damp(p.root.rotation.y,p.index*2.39996+turn,2,delta);}continue;}
   if(distance>70){p.rig?.update(p.travel,false);continue;}p.pause=Math.max(0,p.pause-delta);
   if(p.pause>0){p.rig?.update(p.travel,false);const target=p.route.points[p.direction===1?1:0],angle=Math.atan2(target.x-p.root.position.x,target.z-p.root.position.z);p.root.rotation.y+=Math.atan2(Math.sin(angle-p.root.rotation.y),Math.cos(angle-p.root.rotation.y))*(1-Math.exp(-3*delta));}
   if(p.pause===0){
    const destination=p.route.points[p.direction===1?1:0],dx=destination.x-p.root.position.x,dz=destination.z-p.root.position.z,d=Math.hypot(dx,dz);
    const probe=Math.min(d,.16),nextX=p.root.position.x+dx/Math.max(d,.001)*probe,nextZ=p.root.position.z+dz/Math.max(d,.001)*probe;
    const blocked=people.some(other=>other!==p&&other.root.visible&&approachingPerson({x:p.root.position.x,z:p.root.position.z},{x:nextX,z:nextZ},{x:other.root.position.x,z:other.root.position.z}));
    if(d<.12||blocked){p.pause=1.8+p.index%4;p.direction*=-1;p.walk?.stop();p.idle?.play();p.rig?.update(p.travel,false);}
    else{p.idle?.stop();p.walk?.play();const speed=.9+p.index%4*.07,step=Math.min(d,speed*delta);const point=moveWalker({x:p.root.position.x,z:p.root.position.z},{x:dx/d*step,z:dz/d*step});p.travel+=Math.hypot(point.x-p.root.position.x,point.z-p.root.position.z);p.root.position.set(point.x,groundHeight(point),point.z);const angle=Math.atan2(dx,dz);p.root.rotation.y+=Math.atan2(Math.sin(angle-p.root.rotation.y),Math.cos(angle-p.root.rotation.y))*(1-Math.exp(-8*delta));p.rig?.update(p.travel,true);}
   }
   p.clock+=delta;const interval=distance<22?0:1/15;if(p.clock>=interval){p.mixer?.update(p.clock);p.clock=0;}
  }
 },dispose(){disposed=true;parent.remove(root);people.forEach(p=>{p.rig?.dispose();p.mixer?.stopAllAction();p.mixer?.uncacheRoot(p.root.children[0]);p.root.traverse(o=>{if(o instanceof THREE.SkinnedMesh)o.skeleton.dispose();});});sources.forEach(release);people.length=0;sources.length=0;}};
}
