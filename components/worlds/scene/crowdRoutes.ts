import {groundHeight,isWalkable,moveWalker,type WalkPoint} from './walkGeometry';
import type {ZoneId} from '@/lib/world';
export type CrowdRoute={zone:ZoneId;points:WalkPoint[];length:number};
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
/** Deterministic street positions, validated against the same geometry as the player. */
export function createCrowdRoutes():CrowdRoute[]{
 const regions:{zone:ZoneId;bounds:number[];count:number}[]=[
  {zone:'harbor',bounds:[-27,6,2,11],count:10},
  {zone:'market',bounds:[-59,-29,-61,4],count:10},
  {zone:'library',bounds:[-16,16,-66,-27],count:8},
 ];
 const routes:CrowdRoute[]=[];
 for(const {zone,bounds:[x0,x1,z0,z1],count} of regions){
  const candidates:WalkPoint[]=[];for(let x=x0;x<=x1;x+=2.7)for(let z=z0;z<=z1;z+=2.7)candidates.push({x,z});
  const rank=(p:WalkPoint)=>Math.sin(p.x*12.9898+p.z*78.233)*43758.5453%1;
  candidates.sort((a,b)=>rank(a)-rank(b));let added=0;
  for(const p of candidates){if(added>=count)break;if(!isWalkable(p,.42)||routes.some(r=>Math.hypot(r.points[0].x-p.x,r.points[0].z-p.z)<2.1))continue;
   const destinations=[10.4,6.4,4.2,2.2].flatMap(d=>[{x:p.x+d,z:p.z},{x:p.x,z:p.z+d},{x:p.x-d,z:p.z},{x:p.x,z:p.z-d}]);
   const b=destinations.find(q=>q.x>=x0&&q.x<=x1&&q.z>=z0&&q.z<=z1&&safeCrowdSegment(p,q));if(!b)continue;
   routes.push({zone,points:[p,b],length:Math.hypot(b.x-p.x,b.z-p.z)});added++;
  }
 }return routes;
}
export const CROWD_ROUTES=createCrowdRoutes();
