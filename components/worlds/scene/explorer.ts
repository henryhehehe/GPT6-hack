import * as THREE from 'three';
import {HUMAN_SCALE} from './humanScale';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ZoneId } from '@/lib/world';
import { groundHeight, moveWalker, WALK_SPAWNS } from './walkGeometry';

type Callbacks = { mode: (walking: boolean) => void; nearby: (zone: ZoneId | null) => void; inspect: (zone: ZoneId) => void };
const keys = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ShiftLeft','ShiftRight']);
const approach: Record<ZoneId, {x:number;z:number}> = { harbor:{x:-14,z:8},market:{x:8,z:8},library:{x:0,z:-2} };

/** Ground-level navigation, local to this viewer; never sends per-frame classroom writes. */
export function createExplorer(camera: THREE.PerspectiveCamera, orbit: OrbitControls, canvas: HTMLCanvasElement, callbacks: Callbacks, navigation:{groundHeight:typeof groundHeight;moveWalker:typeof moveWalker;spawns:Record<ZoneId,{x:number;z:number}>;approach:Record<ZoneId,{x:number;z:number}>}={groundHeight,moveWalker,spawns:WALK_SPAWNS,approach}) {
  let walking=false,point={x:1,z:8},yaw=0,pitch=0,nearby:ZoneId|null=null,skipFocus:ZoneId|null=null;
  let drag: {id:number;x:number;y:number}|null=null;
  const held=new Set<string>(),touch=new Set<string>();
  const savedPosition=camera.position.clone(),savedTarget=orbit.target.clone();
  const previousTabIndex=canvas.tabIndex;canvas.tabIndex=0;
  canvas.setAttribute('aria-label','Explore the world. In Walk mode use W A S D or arrow keys, drag to look, E to inspect, Escape for overview.');

  function clear(){held.clear();touch.clear();drag=null;}
  function view(){camera.position.set(point.x,navigation.groundHeight(point)+HUMAN_SCALE.eyeHeight,point.z);camera.rotation.set(pitch,yaw,0,'YXZ');}
  function mode(value:boolean){
    if(walking===value)return;
    clear();walking=value;orbit.enabled=!value;
    if(value){savedPosition.copy(camera.position);savedTarget.copy(orbit.target);camera.fov=60;view();}
    else{camera.position.copy(savedPosition);orbit.target.copy(savedTarget);camera.fov=37;orbit.update();nearby=null;callbacks.nearby(null);}
    camera.updateProjectionMatrix();callbacks.mode(value);canvas.focus({preventScroll:true});
  }
  function inspect(){if(nearby){skipFocus=nearby;callbacks.inspect(nearby);clear();}}
  function keydown(event:KeyboardEvent){
    if(!walking||event.ctrlKey||event.altKey||event.metaKey)return;
    if(keys.has(event.code)){event.preventDefault();held.add(event.code);}
    if(event.code==='KeyE'&&!event.repeat){event.preventDefault();inspect();}
    if(event.code==='Escape'){event.preventDefault();mode(false);}
  }
  function keyup(event:KeyboardEvent){held.delete(event.code);}
  function down(event:PointerEvent){if(!walking||event.button!==0)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);drag={id:event.pointerId,x:event.clientX,y:event.clientY};}
  function move(event:PointerEvent){if(!walking||!drag||drag.id!==event.pointerId)return;event.preventDefault();yaw-=(event.clientX-drag.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(event.clientY-drag.y)*.004,-1.1,.9);drag.x=event.clientX;drag.y=event.clientY;}
  function up(event:PointerEvent){if(drag?.id===event.pointerId)drag=null;}
  function visibility(){if(document.hidden)clear();}
  canvas.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);
  canvas.addEventListener('blur',clear);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',visibility);

  return {
    mode,
    visit(destination:{x:number;z:number},direction=0){clear();point={...destination};yaw=direction;pitch=0;if(!walking)mode(true);else view();canvas.focus({preventScroll:true});},
    get walking(){return walking;},
    input(action:string,pressed:boolean){if(pressed)touch.add(action);else touch.delete(action);},
    inspect,
    focus(zone:ZoneId|null){
      if(zone===skipFocus){skipFocus=null;return;}skipFocus=null;
      if(!zone){mode(false);return;}
      point={...navigation.spawns[zone]};yaw=zone==='harbor'?Math.PI*.45:zone==='market'?-Math.PI*.4:0;pitch=0;clear();view();
    },
    update(delta:number){
      if(!walking)return;
      const dt=Number.isFinite(delta)?Math.max(0,Math.min(delta,.05)):0;
      const active=(...codes:string[])=>codes.some(c=>held.has(c)||touch.has(c));
      let forward=Number(active('KeyW','ArrowUp','forward'))-Number(active('KeyS','ArrowDown','back'));
      let right=Number(active('KeyD','ArrowRight','right'))-Number(active('KeyA','ArrowLeft','left'));
      const length=Math.hypot(forward,right);if(length>1){forward/=length;right/=length;}
      yaw+=(Number(touch.has('turn-left'))-Number(touch.has('turn-right')))*dt*1.5;
      const speed=active('ShiftLeft','ShiftRight')?HUMAN_SCALE.jogSpeed:HUMAN_SCALE.walkSpeed;
      point=navigation.moveWalker(point,{x:(-Math.sin(yaw)*forward+Math.cos(yaw)*right)*speed*dt,z:(-Math.cos(yaw)*forward-Math.sin(yaw)*right)*speed*dt});view();
      let closest:ZoneId|null=null,distance=4.5;
      for(const zone of ['harbor','market','library'] as ZoneId[]){const p=navigation.approach[zone],d=Math.hypot(p.x-point.x,p.z-point.z);if(d<distance){distance=d;closest=zone;}}
      if(closest!==nearby){nearby=closest;callbacks.nearby(closest);}
    },
    dispose(){clear();canvas.tabIndex=previousTabIndex;canvas.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('lostpointercapture',up);canvas.removeEventListener('blur',clear);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',visibility);},
  };
}
