'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createExplorer} from './scene/explorer';
import {SETTING_SPOTS as spots,settingPlacements,createSettingNavigation} from './scene/settingLayout';
import {loadSettingAssets} from './scene/settingAssets';
import {pickSceneSelection} from './scene/scenePicking';
import {generatedHintPositions} from './scene/lessonEffects';
import {externalPlacements,placementBounds} from './scene/externalLayout';
import {loadExternalModels} from './scene/externalModels';
import {SceneArtCredits} from './SceneArtCredits';
import {worldCharacters} from '@/lib/characters';
import type {World,ZoneId} from '@/lib/world';
type Props={hint:{id:string;zone:ZoneId}|null;world:World;scenario:boolean;focus:ZoneId|null;focusRevision?:number;onSelect:(id:ZoneId)=>void;onTalk:(id:ZoneId)=>void};
export default function GeneratedWorldScene(props:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(props);latest.current=props;
 const explorer=useRef<ReturnType<typeof createExplorer>|null>(null),labels=useRef<Partial<Record<ZoneId,HTMLButtonElement|null>>>({});const [walking,setWalking]=useState(false),[nearby,setNearby]=useState<ZoneId|null>(null),[error,setError]=useState('');
 const sceneIdentity=JSON.stringify(props.world);
 const cast=worldCharacters(props.world),setting=props.world.lessonPack!.scene;
 useEffect(()=>{if(!host.current)return;const el=host.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setError('3D is unavailable. Use the place and character buttons to explore this lesson.');return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;el.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.fog=new THREE.Fog('#163345',60,125);const camera=new THREE.PerspectiveCamera(37,1,.1,200);camera.position.set(34,31,43);const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.target.set(0,0,-1);orbit.minDistance=12;orbit.maxDistance=85;orbit.maxPolarAngle=1.48;
 scene.add(new THREE.HemisphereLight('#d7efff','#4e5040',2.5));const sun=new THREE.DirectionalLight('#ffe0b2',3);sun.position.set(-15,30,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35});scene.add(sun);
 const stone=new THREE.MeshStandardMaterial({color:setting==='garden'?'#e5d5c1':'#ccbba0',roughness:.8}),ground=new THREE.MeshStandardMaterial({color:setting==='garden'?'#55735d':setting==='coast'?'#afaa87':'#788887',roughness:1}),gold=new THREE.MeshStandardMaterial({color:'#dfbb72',metalness:.4,roughness:.4}),green=new THREE.MeshStandardMaterial({color:'#466a51'}),dark=new THREE.MeshStandardMaterial({color:'#303e3b'});
 function mesh(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
 mesh(new THREE.CylinderGeometry(27,29,2,64),ground,0,-1,0);const sea=new THREE.MeshStandardMaterial({color:setting==='coast'?'#286579':'#263e4c',roughness:.3,metalness:.3});mesh(new THREE.CylinderGeometry(100,100,.1,64),sea,0,-2.6,0);
 mesh(new THREE.CylinderGeometry(5.5,5.5,.15,48),stone,0,.02,0);mesh(new THREE.TorusGeometry(4.8,.04,6,64),gold,0,.15,0).rotation.x=Math.PI/2;
 const hint=mesh(new THREE.OctahedronGeometry(.7),gold,0,1.8,0);hint.visible=false;
 const markers:THREE.Object3D[]=[],roofs:THREE.Mesh[]=[];
 for(const [id,p] of Object.entries(spots) as [ZoneId,{x:number;z:number}][]){
  const path=mesh(new THREE.BoxGeometry(2,.06,Math.hypot(p.x,p.z)),stone,p.x/2,.04,p.z/2);path.rotation.y=Math.atan2(p.x,p.z);
  mesh(new THREE.CylinderGeometry(4,4.2,.22,32),stone,p.x,.11,p.z);
  // Open pavilions keep the three source stations legible and accessible on foot.
  for(const dx of [-3,3])for(const dz of [-2.5,2.5]){mesh(new THREE.CylinderGeometry(.18,.23,4.5,12),stone,p.x+dx,2.25,p.z+dz);mesh(new THREE.BoxGeometry(.7,.2,.7),gold,p.x+dx,4.45,p.z+dz);}
  const roof=mesh(new THREE.BoxGeometry(7,.3,6),stone,p.x,4.7,p.z);roof.visible=false;roofs.push(roof);
  const marker=mesh(new THREE.OctahedronGeometry(.45),gold,p.x-1.5,1.3,p.z+.5);marker.userData.zone=id;markers.push(marker);
  const body=mesh(new THREE.CapsuleGeometry(.3,.8,4,8),new THREE.MeshStandardMaterial({color:cast[id].color}),p.x+1.3,.95,p.z+.5);body.userData.npc=id;const head=mesh(new THREE.SphereGeometry(.26,12,8),stone,p.x+1.3,1.75,p.z+.5);head.userData.npc=id;
 }
 if(setting!=='coast')for(let i=0;i<22;i++){const a=i/22*Math.PI*2,x=Math.cos(a)*23,z=Math.sin(a)*23;mesh(new THREE.CylinderGeometry(.12,.22,2,8),dark,x,1,z);mesh(new THREE.IcosahedronGeometry(setting==='garden'?2:1.25,1),green,x,3,z);}
 const additions=externalPlacements(setting),external=loadExternalModels(scene,additions);
 const placements=settingPlacements(setting),models=loadSettingAssets(scene,placements),nav=createSettingNavigation(placements,additions.filter(p=>p.solid).map(placementBounds));
 const walk=createExplorer(camera,orbit,renderer.domElement,{mode:setWalking,nearby:setNearby,inspect:id=>latest.current.onSelect(id)},nav);explorer.current=walk;
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const ray=new THREE.Raycaster(),point=new THREE.Vector2();let down:[number,number]|null=null;const start=(e:PointerEvent)=>{down=[e.clientX,e.clientY];};const click=(e:PointerEvent)=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;down=null;const rect=el.getBoundingClientRect();point.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(point,camera);const hit=pickSceneSelection(ray,scene);if(hit?.action==='talk')latest.current.onTalk(hit.zone);else if(hit?.action==='evidence')latest.current.onSelect(hit.zone);};renderer.domElement.addEventListener('pointerdown',start);renderer.domElement.addEventListener('pointerup',click);
 const resize=new ResizeObserver(()=>{renderer.setSize(Math.max(1,el.clientWidth),Math.max(1,el.clientHeight));camera.aspect=Math.max(1,el.clientWidth)/Math.max(1,el.clientHeight);camera.updateProjectionMatrix();});resize.observe(el);let frame=0,last=performance.now(),oldRevision=-1;const v=new THREE.Vector3();
 function render(now:number){const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;const p=latest.current;if(oldRevision!==(p.focusRevision??0)){oldRevision=p.focusRevision??0;if(walk.walking)walk.focus(p.focus);else if(p.focus){const pos=spots[p.focus];orbit.target.set(pos.x,1,pos.z);camera.position.set(pos.x+12,12,pos.z+16);}else{orbit.target.set(0,0,-1);camera.position.set(34,31,43);}}walk.update(dt);roofs.forEach(roof=>{roof.visible=walk.walking;});if(!walk.walking)orbit.update();hint.visible=!!p.hint;if(p.hint)hint.position.set(...generatedHintPositions[p.hint.zone]);if(!reducedMotion.matches)markers.forEach(m=>{m.rotation.y+=dt*.5;});gold.color.set(p.scenario?'#f09857':'#dfbb72');for(const [id,pos] of Object.entries(spots) as [ZoneId,{x:number;z:number}][]){const button=labels.current[id];if(button){v.set(pos.x+1.3,2.8,pos.z+.5).project(camera);button.style.display=v.z>-1&&v.z<1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.9?'flex':'none';button.style.left=`${(v.x+1)/2*el.clientWidth}px`;button.style.top=`${(1-v.y)/2*el.clientHeight}px`;}}renderer.render(scene,camera);frame=requestAnimationFrame(render);}frame=requestAnimationFrame(render);
 return()=>{cancelAnimationFrame(frame);resize.disconnect();external.dispose();models.dispose();walk.dispose();explorer.current=null;orbit.dispose();renderer.domElement.removeEventListener('pointerdown',start);renderer.domElement.removeEventListener('pointerup',click);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
 },[sceneIdentity]);
 return <><div ref={host} className="world-canvas"/>{error&&<p className="scene-note">{error}</p>}<div className="explorer-controls"><div className="explorer-modes"><button aria-pressed={!walking} onClick={()=>explorer.current?.mode(false)}>Overview</button><button aria-pressed={walking} onClick={()=>explorer.current?.mode(true)}>Walk around</button></div>{walking&&<p>WASD / arrows · drag to look · E to inspect</p>}{nearby&&walking&&<button className="explorer-inspect" onClick={()=>explorer.current?.inspect()}>Read evidence · E</button>}<SceneArtCredits/><details className="character-directory"><summary>Talk to someone</summary>{props.world.nodes.map(n=><button key={n.id} onClick={()=>props.onTalk(n.id)}>{cast[n.id].name} · {cast[n.id].role}</button>)}</details></div>{props.world.nodes.map(n=><button key={n.id} ref={el=>{labels.current[n.id]=el;}} className="character-world-label" onClick={()=>props.onTalk(n.id)}>{cast[n.id].name}<small>Talk</small></button>)}{walking&&<div className="explorer-pad">{[['turn-left','↶'],['forward','↑'],['turn-right','↷'],['left','←'],['back','↓'],['right','→']].map(([id,label])=><button key={id} aria-label={id} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);explorer.current?.input(id,true);}} onPointerUp={()=>explorer.current?.input(id,false)} onLostPointerCapture={()=>explorer.current?.input(id,false)} onPointerCancel={()=>explorer.current?.input(id,false)} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();explorer.current?.input(id,true);}}} onKeyUp={()=>explorer.current?.input(id,false)} onBlur={()=>explorer.current?.input(id,false)}>{label}</button>)}</div>}</>;
}
