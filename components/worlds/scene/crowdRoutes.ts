import {groundHeight,isWalkable,moveWalker,type WalkPoint} from './walkGeometry';
import type {ZoneId} from '@/lib/world';
export type CrowdRoute={zone:ZoneId;points:WalkPoint[];length:number;lookAt:WalkPoint};
export function approachingPerson(from:WalkPoint,to:WalkPoint,other:WalkPoint){
 const current=Math.hypot(other.x-from.x,other.z-from.z),next=Math.hypot(other.x-to.x,other.z-to.z);
 return next<.85&&next<current;
}
export function safeCrowdSegment(a:WalkPoint,b:WalkPoint){
 if(!isWalkable(a,.42)||!isWalkable(b,.42))return false;
 const distance=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(distance/.12));
 let previous=a;
 for(let i=1;i<=steps;i++){const p={x:a.x+(b.x-a.x)*i/steps,z:a.z+(b.z-a.z)*i/steps};
  if(!isWalkable(p,.42)||Math.abs(groundHeight(p)-groundHeight(previous))>.2)return false;
  const resolved=moveWalker(previous,{x:p.x-previous.x,z:p.z-previous.z});if(Math.hypot(resolved.x-p.x,resolved.z-p.z)>.001)return false;previous=p;
 }return true;
}
/** Everyday activity around the visible quay, stalls and scholarly forecourt.
 * These are interpretive work areas, not a reconstruction of ancient street use.
 * Keep the first point beside an activity: unrigged citizens remain at that point.
 * The last pair turns a planted citizen toward nearby goods, tools or architecture.
 */
export function createCrowdRoutes():CrowdRoute[]{
 const areas:{zone:ZoneId;paths:[number,number,number,number,number,number][]}[]=[
  {zone:'harbor',paths:[
   [-24,6,-27,4,-25.5,8.3],       // Fishing gear to the quay-side approach.
   [-23,8,-23,11,-25.5,10],      // Beside the handcart and net rack.
   [-19,1.8,-24,1.8,-21,4.7],
   [-16,3.5,-11,3.5,-21,4.7],
   [-19,12.8,-19,17,-20,20.8],   // Lighthouse quay, outside its masonry footprint.
   [-12,18.5,-12,23,-8,23],   // Pier centerlines stay clear of mooring bollards.
   [-4,18,-4,23,1,23],
   [5,18,5,23,1,23],
   [-7,9.8,-3,9.8,-16,8],
   [-28,3,-32,3,-21,4.7],
  ]},
  {zone:'market',paths:[
   [17,7.4,24,7.4,21,5],     // Shoppers move along the actual market aisles.
   [12,2.5,17,2.5,13,5],
   [20,2.5,24,2.5,21,5],
   [29.2,6.5,29.2,10,27.3,5],  // Well and weaving area, outside their blockers.
   [17,11.9,17,15.8,13,10],
   [23,12.5,27,12.5,25.3,10],
   [10,12.8,10,16.6,13,15],
   [17,17,21,15,13,15],
   [31,1.5,33,4,27.3,5],       // A little traffic continues into the eastern district.
   [13,7.5,15.5,7.5,13,5],
  ]},
  {zone:'library',paths:[
   [-3,2.4,4,2.4,-9,0],      // Forecourt crossing, leaving the stair approach open.
   [-13.8,-1.5,-13.8,1.8,-12,0],
   [-4,-3.25,-1.5,-3.25,0,-8], // Short level terrace routes; never through the building.
   [7,-3.25,10,-3.25,6.5,-8],
   [14.1,-2.4,17,-2.4,7,-8],
   [6,1.8,9,1.8,0,-2],
   [-15,-23,-10,-23,-10,-40],   // A small continuation toward the scholars' garden.
   [11,-26,15,-26,10,-40],
  ]},
 ];
 return areas.flatMap(({zone,paths})=>paths.flatMap(([x,z,bx,bz,lookX,lookZ])=>{
  const a={x,z},b={x:bx,z:bz};
  // If navigation geometry changes before the matching scene pass, omit an
  // unsafe decorative route rather than placing a citizen inside an obstacle.
  return safeCrowdSegment(a,b)?[{zone,points:[a,b],length:Math.hypot(bx-x,bz-z),lookAt:{x:lookX,z:lookZ}}]:[];
 }));
}
export const CROWD_ROUTES=createCrowdRoutes();
