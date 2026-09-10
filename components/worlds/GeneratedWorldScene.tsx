'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createExplorer} from './scene/explorer';
import {createSettingNavigation} from './scene/settingLayout';
import {loadSettingAssets} from './scene/settingAssets';
import {pickSceneSelection} from './scene/scenePicking';
import {placementBounds} from './scene/externalLayout';
import {loadExternalModels} from './scene/externalModels';
import {SceneArtCredits} from './SceneArtCredits';
import {worldTheme} from '@/lib/worldThemes';
import {addThemeScenery,readingGuide,themedPlacements,themedExternalPlacements} from './scene/themedSetting';
import {themeLayout} from './scene/themeLayouts';
import {addThemeArchitecture} from './scene/themeArchitecture';
import {createThemeEnvironment} from './scene/themeEnvironment';
import {addThemeNature} from './scene/themeNature';
import {createCameraMotion} from './scene/cameraMotion';
import {themeViews} from './scene/themeViews';
import {addThemeAtmosphere} from './scene/themeAtmosphere';
import './world-theme.css';
import {worldCharacters} from '@/lib/characters';
import type {World,ZoneId} from '@/lib/world';
type Props={world:World;scenario:boolean;focus:ZoneId|null;focusRevision?:number;onSelect:(id:ZoneId)=>void;onTalk:(id:ZoneId)=>void};
export default function GeneratedWorldScene(props:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(props);
 useEffect(()=>{latest.current=props;},[props]);
 const explorer=useRef<ReturnType<typeof createExplorer>|null>(null),labels=useRef<Partial<Record<ZoneId,HTMLButtonElement|null>>>({});const [walking,setWalking]=useState(false),[nearby,setNearby]=useState<ZoneId|null>(null),[error,setError]=useState('');
 const cameraActions=useRef<{overview():void;view(index:number):void}|null>(null);
 const [activeView,setActiveView]=useState<string|null>(null);
 const sceneIdentity=JSON.stringify(props.world);
 const cast=worldCharacters(props.world),theme=worldTheme(props.world),layout=themeLayout(theme),spots=layout.spots,views=themeViews(theme);
 useEffect(()=>{if(!host.current)return;const el=host.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setError('3D is unavailable. Use the place and character buttons to explore this lesson.');return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;el.appendChild(renderer.domElement);
 setError('');setWalking(false);setActiveView(null);const scene=new THREE.Scene();scene.background=new THREE.Color(theme.sky);scene.fog=new THREE.Fog(theme.horizon,45,115);const scenery=addThemeScenery(scene,theme),architecture=addThemeArchitecture(scene,theme,false);const camera=new THREE.PerspectiveCamera(37,1,.1,2000);camera.position.set(...layout.camera);const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.target.set(0,0,-1);orbit.minDistance=12;orbit.maxDistance=85;orbit.maxPolarAngle=1.48;
 const environment=createThemeEnvironment(scene,renderer,theme),atmosphere=addThemeAtmosphere(scene,theme),motion=createCameraMotion(camera,orbit);
 const cancelMotion=()=>{motion.cancel();setActiveView(null);};orbit.addEventListener('start',cancelMotion);
 const gold=new THREE.MeshStandardMaterial({color:theme.accent,metalness:.4,roughness:.4});
 function mesh(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
 const markers:THREE.Object3D[]=[];
 for(const [id,p] of Object.entries(spots) as [ZoneId,{x:number;z:number}][]){
  const marker=mesh(new THREE.RingGeometry(.35,.42,32),gold,p.x-1.5,.245,p.z+.5);marker.rotation.x=-Math.PI/2;marker.castShadow=false;marker.visible=false;marker.userData.zone=id;markers.push(marker);
  const guide=readingGuide(cast[id].color,{harbor:'#b78464',market:'#cfac87',library:'#8e624a'}[id],theme.landscape==='shore');guide.position.set(p.x+1.3,.22,p.z+.5);guide.userData.npc=id;scene.add(guide);
 }
 const additions=themedExternalPlacements(theme),external=loadExternalModels(scene,additions);
 const placements=themedPlacements(theme),models=loadSettingAssets(scene,placements),baseObstacles=[...architecture.obstacles,...additions.filter(p=>p.solid).map(placementBounds)];
 const baseNav=createSettingNavigation(placements,baseObstacles,layout),nature=addThemeNature(scene,theme,baseNav.isWalkable),nav=createSettingNavigation(placements,[...baseObstacles,...nature.obstacles],layout);
 const walk=createExplorer(camera,orbit,renderer.domElement,{mode:value=>{motion.cancel();setWalking(value);setActiveView(null);},nearby:setNearby,inspect:id=>latest.current.onSelect(id)},nav);explorer.current=walk;
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 cameraActions.current={overview(){walk.mode(false);setActiveView(null);motion.go(layout.camera,[0,0,-1],reducedMotion.matches);},view(index){const view=views[index];if(!view)return;walk.mode(false);setActiveView(view.label);motion.go(view.position,view.target,reducedMotion.matches);}};
 const ray=new THREE.Raycaster(),point=new THREE.Vector2();let down:[number,number]|null=null;const start=(e:PointerEvent)=>{down=[e.clientX,e.clientY];};const click=(e:PointerEvent)=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;down=null;const rect=el.getBoundingClientRect();point.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(point,camera);const hit=pickSceneSelection(ray,scene);if(hit?.action==='talk')latest.current.onTalk(hit.zone);else if(hit?.action==='evidence')latest.current.onSelect(hit.zone);};renderer.domElement.addEventListener('pointerdown',start);renderer.domElement.addEventListener('pointerup',click);
 const resize=new ResizeObserver(()=>{renderer.setSize(Math.max(1,el.clientWidth),Math.max(1,el.clientHeight));camera.aspect=Math.max(1,el.clientWidth)/Math.max(1,el.clientHeight);camera.updateProjectionMatrix();});resize.observe(el);let frame=0,last=performance.now(),oldRevision=-1;const v=new THREE.Vector3();
 function render(now:number){const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;const p=latest.current;if(oldRevision!==(p.focusRevision??0)){oldRevision=p.focusRevision??0;setActiveView(null);if(walk.walking){motion.cancel();walk.focus(p.focus);}else if(p.focus){const pos=spots[p.focus];motion.go([pos.x+12,12,pos.z+16],[pos.x,1,pos.z],reducedMotion.matches);}else if(oldRevision!==0){motion.go(layout.camera,[0,0,-1],reducedMotion.matches);}}walk.update(dt);environment.update(now/1000,reducedMotion.matches);nature.update(now/1000,reducedMotion.matches);atmosphere.update(now/1000,reducedMotion.matches);if(!walk.walking&&!motion.update(dt,reducedMotion.matches))orbit.update();markers.forEach(m=>{m.visible=walk.walking&&camera.position.distanceTo(m.position)<6;});gold.color.set(p.scenario?'#f09857':theme.accent);for(const [id,pos] of Object.entries(spots) as [ZoneId,{x:number;z:number}][]){const button=labels.current[id];if(button){v.set(pos.x+1.3,2.8,pos.z+.5).project(camera);button.style.display=walk.walking&&Math.hypot(camera.position.x-pos.x-1.3,camera.position.z-pos.z-.5)<7&&v.z>-1&&v.z<1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.9?'flex':'none';button.style.left=`${(v.x+1)/2*el.clientWidth}px`;button.style.top=`${(1-v.y)/2*el.clientHeight}px`;}}renderer.render(scene,camera);frame=requestAnimationFrame(render);}frame=requestAnimationFrame(render);
 return()=>{cancelAnimationFrame(frame);resize.disconnect();motion.cancel();cameraActions.current=null;orbit.removeEventListener('start',cancelMotion);atmosphere.dispose();scenery.dispose();nature.dispose();environment.dispose();architecture.dispose();external.dispose();models.dispose();walk.dispose();explorer.current=null;orbit.dispose();renderer.domElement.removeEventListener('pointerdown',start);renderer.domElement.removeEventListener('pointerup',click);const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
 },[sceneIdentity]);
 return <><div ref={host} className="world-canvas"/><div className="world-theme-caption"><span>INTERPRETED READING WORLD</span><strong>{theme.place}</strong><p>{theme.atmosphere}</p></div>{error&&<p className="scene-note">{error}</p>}<div className="explorer-controls"><div className="explorer-modes"><button aria-pressed={!walking&&!activeView} onClick={()=>cameraActions.current?.overview()}>Overview</button><button aria-pressed={walking} onClick={()=>explorer.current?.mode(true)}>Walk around</button></div>{!walking&&views.length>0&&<div className="world-scenic-views" role="group" aria-label="Scenic viewpoints">{views.map((view,index)=><button key={view.label} aria-pressed={activeView===view.label} onClick={()=>cameraActions.current?.view(index)}>{view.label}</button>)}</div>}{walking&&<p>WASD / arrows · drag to look · E to inspect</p>}{nearby&&walking&&<button className="explorer-inspect" onClick={()=>explorer.current?.inspect()}>Read evidence · E</button>}<SceneArtCredits/><details className="character-directory"><summary>Places & reading companions</summary>{props.world.nodes.map(n=><button key={n.id} onClick={()=>props.onTalk(n.id)}>{cast[n.id].name} · {cast[n.id].role}</button>)}{props.world.nodes.map(n=><button key={`place-${n.id}`} onClick={()=>props.onSelect(n.id)}>Read at {n.title}</button>)}</details></div>{props.world.nodes.map(n=><button key={n.id} ref={el=>{labels.current[n.id]=el;}} className="character-world-label" style={{display:'none'}} onClick={()=>props.onTalk(n.id)}>{cast[n.id].name}<small>Talk</small></button>)}{walking&&<div className="explorer-pad">{[['turn-left','↶'],['forward','↑'],['turn-right','↷'],['left','←'],['back','↓'],['right','→']].map(([id,label])=><button key={id} aria-label={id} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);explorer.current?.input(id,true);}} onPointerUp={()=>explorer.current?.input(id,false)} onLostPointerCapture={()=>explorer.current?.input(id,false)} onPointerCancel={()=>explorer.current?.input(id,false)} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();explorer.current?.input(id,true);}}} onKeyUp={()=>explorer.current?.input(id,false)} onBlur={()=>explorer.current?.input(id,false)}>{label}</button>)}</div>}</>;
}
