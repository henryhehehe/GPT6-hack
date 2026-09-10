'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { zoneNames, type World, type ZoneId } from '@/lib/world';
import { createExplorer } from './scene/explorer';
import { loadLandmarks } from './scene/landmarks';
import LandmarkPreview from './LandmarkPreview';
import type { LandmarkId } from '@/lib/landmarkReferences';
import {alexandriaHintPositions,visibleAtActivity} from './scene/lessonEffects';
import { characters } from '@/lib/characters';

type Props={world:World;scenario:boolean;focus:ZoneId|null;focusRevision?:number;unlocked:boolean;hint:{id:string;zone:ZoneId}|null;onSelect:(zone:ZoneId)=>void;onTalk:(zone:ZoneId)=>void};
const positions:Record<ZoneId,[number,number,number]>={harbor:[-14,1,12],market:[8,2,7],library:[0,5,-12]};
export default function WorldScene(props:Props){
 const characterButtons=useRef<Partial<Record<ZoneId,HTMLButtonElement|null>>>({});
 const [reference,setReference]=useState<LandmarkId|null>(null),[pinned,setPinned]=useState(false),[ready,setReady]=useState<LandmarkId[]>([]);
 const pinRef=useRef(false),closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const keepReference=()=>{if(closeTimer.current)clearTimeout(closeTimer.current);};
 const closeReference=()=>{keepReference();pinRef.current=false;setPinned(false);setReference(null);};
 const showReference=(id:LandmarkId,pin=false)=>{keepReference();if(pin){pinRef.current=true;setPinned(true);}if(pin||!pinRef.current)setReference(id);};
 const leaveReference=()=>{keepReference();if(!pinRef.current)closeTimer.current=setTimeout(()=>setReference(null),450);};
 const referenceEvents=useRef({showReference,leaveReference,closeReference});referenceEvents.current={showReference,leaveReference,closeReference};
 useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')referenceEvents.current.closeReference();};window.addEventListener('keydown',escape);return()=>{window.removeEventListener('keydown',escape);if(closeTimer.current)clearTimeout(closeTimer.current);};},[]);
 const explorerRef=useRef<ReturnType<typeof createExplorer>|null>(null);
 const [walking,setWalking]=useState(false),[nearby,setNearby]=useState<ZoneId|null>(null);
 const host=useRef<HTMLDivElement>(null);const latest=useRef(props);latest.current=props;const [error,setError]=useState('');
 useEffect(()=>{
  if(!host.current)return;
  setError('');
  const el=host.current; let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setError('This browser cannot display the 3D world. You can still explore every place using the location buttons.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;el.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#112a3e',0.003);
  const camera=new THREE.PerspectiveCamera(37,1,.1,400);camera.position.set(55,43,63);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.target.set(0,0,0);controls.minDistance=28;controls.maxDistance=130;controls.maxPolarAngle=Math.PI*.46;controls.minPolarAngle=.2;controls.enablePan=false;
  scene.add(new THREE.HemisphereLight('#c0e7ff','#48544c',2.1));
  const sun=new THREE.DirectionalLight('#ffddac',4);sun.position.set(-25,50,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:150});sun.shadow.normalBias=.04;scene.add(sun);
  const mats={stone:new THREE.MeshStandardMaterial({color:'#d4c2a1',roughness:.85}),light:new THREE.MeshStandardMaterial({color:'#f0dfb8',roughness:.8}),edge:new THREE.MeshStandardMaterial({color:'#9c8262',roughness:1}),roof:new THREE.MeshStandardMaterial({color:'#b96c4d',roughness:.85}),wood:new THREE.MeshStandardMaterial({color:'#754b37',roughness:1}),dark:new THREE.MeshStandardMaterial({color:'#283d3b',roughness:1}),green:new THREE.MeshStandardMaterial({color:'#496f54',roughness:.8}),gold:new THREE.MeshStandardMaterial({color:'#e7ae54',metalness:.25,roughness:.55}),cloth:new THREE.MeshStandardMaterial({color:'#debf87',side:THREE.DoubleSide,roughness:.85}),teal:new THREE.MeshStandardMaterial({color:'#40b9b1',roughness:.7}),amber:new THREE.MeshStandardMaterial({color:'#f1a456',emissive:'#a65b1b',emissiveIntensity:.45})};
  function mesh(g:THREE.BufferGeometry,m:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(p:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m= mats.stone){return mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y+h/2,z);}
  function cylinder(p:THREE.Object3D,r:number,h:number,x:number,y:number,z:number,m=mats.light,n=12){return mesh(new THREE.CylinderGeometry(r,r,h,n),m,p,x,y+h/2,z);}
  const land=new THREE.Group();scene.add(land);
  // Layered cutaway island, with a harbor cut into the southern edge.
  const shape=new THREE.Shape();shape.moveTo(-28,-22);shape.lineTo(25,-22);shape.quadraticCurveTo(31,-22,31,-16);shape.lineTo(31,14);shape.quadraticCurveTo(31,19,24,19);shape.lineTo(8,19);shape.lineTo(8,12);shape.lineTo(-13,12);shape.lineTo(-13,23);shape.lineTo(-28,23);shape.closePath();
  const island=mesh(new THREE.ExtrudeGeometry(shape,{depth:3.8,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:1,bevelThickness:.5}),mats.edge,land);island.rotation.x=Math.PI/2;island.position.y=.4;
  const top=mesh(new THREE.ShapeGeometry(shape),mats.stone,land);top.rotation.x=Math.PI/2;top.material=new THREE.MeshStandardMaterial({color:'#cbb892',side:THREE.DoubleSide,roughness:1});top.position.y=.6;
  // Plaza, paved paths and raised library terrace.
  box(land,27,.2,7,0,.7,0,mats.light);box(land,5,.18,34,1,.7,0,mats.light);
  box(land,29,1.8,18,0,.7,-12,mats.edge);box(land,29,.35,18,0,2.5,-12,mats.light);
  // Eight shallow treads match the navigable ramp from street to terrace.
  for(let i=0;i<8;i++)box(land,11,.95+(i+1)*1.9/8-.7,2.5/8,0,.7,-.5-(i+.5)*2.5/8,mats.light);
  for(let x=-24;x<28;x+=3.5)for(let z=-18;z<14;z+=3.5){if(Math.abs(x)<3||Math.abs(z)<2)box(land,3.3,.04,3.3,x,.91,z,mats.stone);}
  function temple(x:number,z:number,w=19,d=10,h=7){const g=new THREE.Group();g.position.set(x,2.9,z);land.add(g);box(g,w,h,d,0,0,0,mats.light);box(g,w+2,.55,d+2,0,h,0,mats.light);box(g,w+3,.35,d+3,0,h+.6,0,mats.edge);
   for(let i=0;i<8;i++){const cx=-w/2+.9+i*(w-1.8)/7;cylinder(g,.38,h,cx,0,d/2+1.25);box(g,.95,.3,.95,cx,h-.25,d/2+1.25,mats.light);box(g,.9,.25,.9,cx,0,d/2+1.25,mats.light);}
   const roof=mesh(new THREE.CylinderGeometry(0,(w+3)/1.7,2.4,3),mats.roof,g,0,h+1.7,0);roof.rotation.z=Math.PI/2;roof.rotation.y=Math.PI/2;roof.scale.set(.9,.65,1);
   // The triangular pediment is a real mesh, not a flat image.
   const tri=new THREE.Shape();tri.moveTo(-w/2-1,h+.55);tri.lineTo(0,h+3.9);tri.lineTo(w/2+1,h+.55);tri.closePath();mesh(new THREE.ExtrudeGeometry(tri,{depth:d+2,bevelEnabled:false}),mats.light,g,0,0,-d/2-1);
   const door=box(g,2.8,4.7,.25,0,0,d/2+.13,mats.dark);return {group:g,door};
  }
  const library=temple(0,-13);const door=library.door;
  function house(x:number,z:number,w:number,d:number,h:number){box(land,w,h,d,x,1,z);box(land,w+.4,.4,d+.4,x,h+1,z,mats.light);box(land,1.1,2,.2,x,1,z+d/2+.1,mats.dark);for(let dx=-w/3;dx<=w/3;dx+=w/1.5)box(land,.7,.9,.2,x+dx,3,z+d/2+.12,mats.wood);}
  house(-21,-13,8,8,5);house(22,-14,8,10,7);house(23,-3,7,6,4);house(-23,-3,6,7,4);
  // Keep the lightweight beacon until its authored model is ready.
  const beacon=new THREE.Group();land.add(beacon);
  box(beacon,5,1,5,-24,1,16,mats.light);box(beacon,3.8,9,3.8,-24,2,16,mats.light);box(beacon,4.5,.55,4.5,-24,11,16,mats.edge);cylinder(beacon,1.35,3,-24,11.5,16);mesh(new THREE.ConeGeometry(1.9,1.5,8),mats.roof,beacon,-24,15.2,16);
  const flame=mesh(new THREE.SphereGeometry(.6,12,8),mats.amber,beacon,-24,14.1,16);
  const landmarks=loadLandmarks(land,library.group,beacon,()=>setError('Detailed architecture could not load. The simplified world remains playable.'),id=>setReady(ids=>ids.includes(id)?ids:[...ids,id]));
  // Water ripples, restrained enough that the world remains readable.
  const waterMat=new THREE.ShaderMaterial({transparent:true,uniforms:{time:{value:0}},vertexShader:`varying vec2 vUv; uniform float time; void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.22+time)*.10+sin(p.y*.3-time*.8)*.08;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 vUv;uniform float time;void main(){float a=sin(vUv.x*160.+sin(vUv.y*80.+time)*2.+time)*sin(vUv.y*150.-time);float foam=smoothstep(.84,1.,a);vec3 c=mix(vec3(.035,.24,.30),vec3(.12,.46,.49),vUv.y);c+=foam*.12;gl_FragColor=vec4(c,.92);}`});
  const water=mesh(new THREE.PlaneGeometry(150,140,50,50),waterMat,scene,0,-.1,0);water.rotation.x=-Math.PI/2;water.receiveShadow=false;water.castShadow=false;
  for(const x of [-12,-4,5]){box(land,3,.5,17.8,x,.7,20.6,mats.wood);for(let j=0;j<7;j++)box(land,3.1,.08,.12,x,1.21,14+j*2.2,mats.edge);for(const side of [-1,1])for(const z of [14,22,28])cylinder(land,.22,2.7,x+side*1.35,-.1,z,mats.wood);}
  const goods:THREE.Object3D[]=[],harborCrates:THREE.Object3D[]=[];const stalls:THREE.Object3D[]=[];
  for(let i=0;i<5;i++){const g=new THREE.Group();g.position.set(13+(i%2)*8,1,5+Math.floor(i/2)*5);land.add(g);stalls.push(g);box(g,5,.65,2.8,0,0,0,mats.wood);for(const x of [-2.4,2.4])for(const z of [-1.3,1.3])cylinder(g,.09,3.5,x,0,z,mats.wood,6);const roof=box(g,5.8,.16,3.5,0,3.5,0,i%2?mats.cloth:mats.teal);roof.rotation.z=.08;
   for(let j=0;j<5;j++){const fruit=mesh(new THREE.SphereGeometry(.36,8,6),j%2?mats.gold:mats.roof,g,-1.8+j*.9,1,0);goods.push(fruit);}
  }
  for(let i=0;i<14;i++){const crate=box(land,1.1,1.1,1.1,-18+(i%3)*1.3,1+Math.floor(i/6)*1.1,7+Math.floor(i/3)*1.1,mats.wood);harborCrates.push(crate);}
  function palm(x:number,z:number,s=1){const g=new THREE.Group();g.position.set(x,.8,z);g.scale.setScalar(s);land.add(g);cylinder(g,.22,5,x*0,0,0,mats.wood,7);for(let j=0;j<7;j++){const leaf=mesh(new THREE.ConeGeometry(.75,3.7,4),mats.green,g,Math.sin(j)*1.25,5.1,Math.cos(j)*1.25);leaf.rotation.set(Math.cos(j)*1.2,0,-Math.sin(j)*1.2);}}
  [[-17,-5],[17,-8],[26,12],[-27,7],[-15,-18],[17,-19]].forEach(([x,z],i)=>palm(x,z,.8+i%3*.1));
  // Decorative citizens follow a fixed loop, never pretending to be real students.
  const citizens:THREE.Group[]=[];
  for(let i=0;i<24;i++){const g=new THREE.Group();const color=[mats.cloth,mats.teal,mats.roof,mats.light][i%4];cylinder(g,.23,.85,0,0,0,color,6);mesh(new THREE.SphereGeometry(.20,8,6),mats.edge,g,0,1.04,0);g.position.set(-10+i%8*2.7,2.9,-5-Math.floor(i/8)*.8);scene.add(g);citizens.push(g);}
  // Named teaching characters stay in place and remain present in both scenarios.
  const npcs:THREE.Group[]=[];
  for(const id of ['harbor','market','library'] as ZoneId[]){const profile=characters[id],g=new THREE.Group();g.position.set(...profile.position);g.userData.character=id;land.add(g);npcs.push(g);const robe=new THREE.MeshStandardMaterial({color:profile.color,roughness:.9});mesh(new THREE.CylinderGeometry(.25,.4,1.2,12),robe,g,0,.65,0);mesh(new THREE.SphereGeometry(.25,16,12),mats.edge,g,0,1.55,0);mesh(new THREE.SphereGeometry(.26,16,8,0,Math.PI*2,0,Math.PI*.5),mats.dark,g,0,1.62,0);for(const side of [-1,1]){const arm=cylinder(g,.10,.75,side*.35,.65,0,robe,8);arm.rotation.z=side*.18;}const ring=mesh(new THREE.RingGeometry(.65,.74,32),mats.teal,g,0,.04,0);ring.rotation.x=-Math.PI/2;ring.castShadow=false;g.traverse(object=>{object.userData.character=id;});}
  const labelPoint=new THREE.Vector3();
  function ship(x:number,z:number,s:number){const g=new THREE.Group();scene.add(g);g.position.set(x,.3,z);g.scale.setScalar(s);const hull=mesh(new THREE.SphereGeometry(1,12,6),mats.wood,g);hull.scale.set(1.5,.65,3.5);box(g,2.2,.18,5,0,.2,0,mats.edge);cylinder(g,.10,5,0,.35,0,mats.wood,7);const sail=mesh(new THREE.PlaneGeometry(3.5,3.4,8,4),mats.cloth,g,0,3.15,.15);sail.rotation.y=.2;for(const z of [-1.8,1.8])box(g,2,.15,.18,0,.8,z,mats.wood);return g;}
  const ships=[ship(-8,23,1),ship(1,23,.85),ship(13,31,1.15),ship(-20,35,.8),ship(23,34,.7),ship(-4,40,.8)];
  const markers:THREE.Mesh[]=[];const ringMats:THREE.MeshBasicMaterial[]=[];
  for(const id of ['harbor','market','library'] as ZoneId[]){const [x,y,z]=positions[id];const m=new THREE.MeshBasicMaterial({color:'#6adeca',transparent:true,opacity:.7,side:THREE.DoubleSide});ringMats.push(m);const ring=mesh(new THREE.RingGeometry(1.2,1.4,40),m,scene,x,y,z);ring.rotation.x=-Math.PI/2;ring.userData.zone=id;ring.castShadow=false;markers.push(ring);const p=mesh(new THREE.OctahedronGeometry(.48),mats.teal,scene,x,y+2,z);p.userData.zone=id;markers.push(p);}
  const hint=box(scene,1.6,.16,1.1,-13,2.2,11,mats.gold);hint.visible=false;
  // Causal path sits above the city only in the hypothetical world.
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-14,2,12),new THREE.Vector3(-2,5,9),new THREE.Vector3(12,4,5),new THREE.Vector3(9,7,-6),new THREE.Vector3(0,7,-12)]);
  const pathMat=new THREE.MeshBasicMaterial({color:'#ffc574',transparent:true,opacity:0});const path=mesh(new THREE.TubeGeometry(curve,70,.055,5,false),pathMat,scene);path.castShadow=false;
  const particle=mesh(new THREE.SphereGeometry(.2,8,6),mats.amber,scene);particle.visible=false;
  const explorer=createExplorer(camera,controls,renderer.domElement,{mode:value=>{focusing=false;setWalking(value);},nearby:setNearby,inspect:zone=>latest.current.onSelect(zone)});explorerRef.current=explorer;
  const ray=new THREE.Raycaster();const pointer=new THREE.Vector2();let down:[number,number]|null=null;
  function pointRay(e:PointerEvent){const rect=el.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);}
  function objectAtPointer(){return ray.intersectObjects(land.children,true).find(hit=>{let object:THREE.Object3D|null=hit.object;while(object){if(!object.visible)return false;object=object.parent;}return true;})?.object;}
  function landmarkAtPointer(){return objectAtPointer()?.userData.landmarkReference as LandmarkId|undefined;}
  let lastHover=0;
  const onMove=(e:PointerEvent)=>{if(e.pointerType==='touch'||e.buttons||performance.now()-lastHover<80)return;lastHover=performance.now();pointRay(e);const id=landmarkAtPointer();if(id)referenceEvents.current.showReference(id);else referenceEvents.current.leaveReference();};
  const onLeave=()=>{down=null;referenceEvents.current.leaveReference();};
  const onDown=(e:PointerEvent)=>{down=[e.clientX,e.clientY]};const onUp=(e:PointerEvent)=>{const start=down;down=null;if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)return;pointRay(e);const object=objectAtPointer(),npc=object?.userData.character as ZoneId|undefined;if(npc){latest.current.onTalk(npc);return;}const id=object?.userData.landmarkReference as LandmarkId|undefined;if(id){referenceEvents.current.showReference(id,true);return;}if(explorer.walking)return;const hit=ray.intersectObjects(markers)[0];if(hit)latest.current.onSelect(hit.object.userData.zone);};
  el.addEventListener('pointerdown',onDown);el.addEventListener('pointerup',onUp);el.addEventListener('pointermove',onMove);el.addEventListener('pointerleave',onLeave);
  const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
  let frame=0,t=0,last=performance.now(),blend=0,oldFocus:ZoneId|null=null,oldFocusRevision=props.focusRevision;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target=new THREE.Vector3(0,0,0),cameraTarget=new THREE.Vector3(55,43,63);let focusing=false;
  const cameraViews:Record<ZoneId,[number,number,number]>={library:[27,23,23],harbor:[23,25,51],market:[40,29,39]};
  const interruptFocus=()=>{focusing=false;};controls.addEventListener('start',interruptFocus);
  function animate(now:number){const dt=Number.isFinite(now-last)?Math.max(0,Math.min((now-last)/1000,.05)):0;last=now;t+=dt;const p=latest.current;
   blend=THREE.MathUtils.damp(blend,p.scenario?1:0,reduced?100:2,dt);waterMat.uniforms.time.value=reduced?0:t;
   if(oldFocus!==p.focus||oldFocusRevision!==p.focusRevision){oldFocus=p.focus;oldFocusRevision=p.focusRevision;if(explorer.walking){explorer.focus(p.focus);}else{const point=p.focus?positions[p.focus]:[0,0,0];target.set(point[0],point[1],point[2]);cameraTarget.set(...(p.focus?cameraViews[p.focus]:[55,43,63] as [number,number,number]));focusing=true;}}
   if(focusing&&!explorer.walking){const alpha=reduced?1:1-Math.exp(-3*dt);controls.target.lerp(target,alpha);camera.position.lerp(cameraTarget,alpha);if(controls.target.distanceTo(target)<.1&&camera.position.distanceTo(cameraTarget)<.1)focusing=false;}
   ships.forEach((s,i)=>{s.position.y=.25+(reduced?0:Math.sin(t*1.1+i)*.16);s.rotation.z=reduced?0:Math.sin(t*.7+i)*.025;const visible=visibleAtActivity(p.world,'harbor',i,ships.length,blend);s.visible=visible;if(i>=2&&!reduced){s.position.x=[13,-20,23,-4][i-2]+Math.sin(t*.055+i)*2.5;}});
   goods.forEach((g,i)=>g.visible=visibleAtActivity(p.world,'market',i,goods.length,blend));harborCrates.forEach((g,i)=>g.visible=visibleAtActivity(p.world,'harbor',i,harborCrates.length,blend));
   citizens.forEach((c,i)=>{c.visible=visibleAtActivity(p.world,'library',i,citizens.length,blend);c.position.x=-10+i%8*2.7+(reduced?0:Math.sin(t*.2+i)*.8);});
   landmarks.update(p.unlocked,dt,reduced);door.scale.x=THREE.MathUtils.damp(door.scale.x,p.unlocked?.06:1,4,dt);hint.visible=!!p.hint;if(p.hint)hint.position.set(...alexandriaHintPositions[p.hint.zone]);hint.rotation.y=reduced?0:Math.sin(t)*.06;
   ringMats.forEach(m=>m.color.set(p.scenario?'#ffc574':'#6adeca'));pathMat.opacity=blend*.55;particle.visible=blend>.2;if(!reduced)particle.position.copy(curve.getPoint((t*.13)%1));flame.scale.setScalar(1+(reduced?0:Math.sin(t*5)*.12));
   explorer.update(dt);if(!explorer.walking)controls.update();
   for(const npc of npcs){const id=npc.userData.character as ZoneId,button=characterButtons.current[id];npc.rotation.y=Math.atan2(camera.position.x-npc.position.x,camera.position.z-npc.position.z);if(button){labelPoint.copy(npc.position);labelPoint.y+=2.4;const distance=camera.position.distanceTo(labelPoint);labelPoint.project(camera);const visible=labelPoint.z>-1&&labelPoint.z<1&&Math.abs(labelPoint.x)<.95&&Math.abs(labelPoint.y)<.85&&(!explorer.walking||distance<14);button.style.display=visible?'flex':'none';if(visible){button.style.left=`${(labelPoint.x+1)*.5*el.clientWidth}px`;button.style.top=`${(1-labelPoint.y)*.5*el.clientHeight}px`;}}}
   renderer.render(scene,camera);frame=requestAnimationFrame(animate);
  }frame=requestAnimationFrame(animate);
  return()=>{cancelAnimationFrame(frame);explorer.dispose();explorerRef.current=null;landmarks.dispose();observer.disconnect();controls.removeEventListener('start',interruptFocus);controls.dispose();el.removeEventListener('pointerdown',onDown);el.removeEventListener('pointerup',onUp);el.removeEventListener('pointermove',onMove);el.removeEventListener('pointerleave',onLeave);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <>
  <div ref={host} className="world-canvas" role="group" aria-label="Interactive harbor, market, and library">{error&&<p className="world-error">{error}</p>}</div>
  {(['harbor','market','library'] as ZoneId[]).map(id=><button key={id} ref={element=>{characterButtons.current[id]=element;}} className="character-world-label" style={{display:'none'}} onClick={()=>props.onTalk(id)} aria-label={`Talk to ${characters[id].name}, ${characters[id].role}`}><span>◌</span>{characters[id].name}<small>Talk</small></button>)}
  <div className="explorer-controls">
   <div className="explorer-modes" aria-label="Exploration mode"><button aria-pressed={!walking} onClick={()=>explorerRef.current?.mode(false)}>Overview</button><button aria-pressed={walking} onClick={()=>explorerRef.current?.mode(true)}>Walk around</button></div>
   <p>{walking?'WASD / arrows · drag to look · Shift to move faster · Esc to overview':'Orbit the world, or step into its streets.'}</p>
   <div className="landmark-reference-buttons" aria-label="Landmark photographs and context">{(['lighthouse','library'] as LandmarkId[]).map(id=><button key={id} onPointerEnter={event=>{if(event.pointerType!=='touch')showReference(id);}} onPointerLeave={leaveReference} onFocus={()=>showReference(id)} onBlur={leaveReference} onClick={()=>showReference(id,true)} aria-expanded={reference===id} aria-controls={reference===id?'landmark-reference':undefined}>{id==='lighthouse'?'Lighthouse site photo':'Library context'}{!ready.includes(id)&&<span className="sr-only">, available while model loads</span>}</button>)}</div>
   {walking&&nearby&&<button className="explorer-inspect" onClick={()=>explorerRef.current?.inspect()}>Inspect {zoneNames[nearby]} <kbd>E</kbd></button>}
   <details className="character-directory"><summary>Talk to someone</summary>{(['harbor','market','library'] as ZoneId[]).map(id=><button key={id} onClick={()=>props.onTalk(id)}>{characters[id].name} · {characters[id].role}</button>)}</details>
  </div>
  {reference&&<LandmarkPreview key={reference} id={reference} pinned={pinned} onPin={()=>{pinRef.current=!pinRef.current;setPinned(pinRef.current);}} onClose={closeReference} onEnter={keepReference} onLeave={leaveReference}/>}
  {walking&&<div className="explorer-pad" aria-label="Movement controls">
   {([{id:'turn-left',label:'Turn left',symbol:'↶'},{id:'forward',label:'Move forward',symbol:'↑'},{id:'turn-right',label:'Turn right',symbol:'↷'},{id:'left',label:'Move left',symbol:'←'},{id:'back',label:'Move backward',symbol:'↓'},{id:'right',label:'Move right',symbol:'→'}]).map(action=><button key={action.id} aria-label={action.label} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);explorerRef.current?.input(action.id,true);}} onPointerUp={()=>explorerRef.current?.input(action.id,false)} onPointerCancel={()=>explorerRef.current?.input(action.id,false)} onLostPointerCapture={()=>explorerRef.current?.input(action.id,false)} onKeyDown={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();explorerRef.current?.input(action.id,true);}}} onKeyUp={()=>explorerRef.current?.input(action.id,false)} onBlur={()=>explorerRef.current?.input(action.id,false)}>{action.symbol}</button>)}
  </div>}
 </>;
}
