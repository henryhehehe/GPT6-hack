import * as THREE from 'three';
import {TEACHING_HEIGHTS} from './humanScale';
import type {ZoneId} from '@/lib/world';
import {WORLD_THEMES} from '@/lib/worldThemes';
import {loadThemedCharacters} from './themedCharacters';

type FetchModel=(url:string)=>Promise<{scene:THREE.Group;animations:THREE.AnimationClip[]}>;
/** Alexandria uses the shared safe loader/gestures while retaining its fixed guide locations. */
export function loadTeachingCharacters(npcs:THREE.Group[],fetchModel?:FetchModel){
 const anchors=Object.fromEntries(npcs.map(npc=>[npc.userData.character as ZoneId,npc])) as Record<ZoneId,THREE.Group>;
 const actors=loadThemedCharacters(WORLD_THEMES.alexandria,anchors,fetchModel,{activity:false,heights:TEACHING_HEIGHTS});
 const camera=new THREE.Vector3();
 return {loaded:actors.ready,update(dt:number,reduced:boolean,cameraPosition=camera,walking=false){actors.update(dt,reduced,cameraPosition,walking);},talk:actors.talk,dispose:actors.dispose};
}
