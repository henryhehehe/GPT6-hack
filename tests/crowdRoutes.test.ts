import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CROWD_ROUTES,safeCrowdSegment} from '../components/worlds/scene/crowdRoutes';
import {isWalkable} from '../components/worlds/scene/walkGeometry';
import {WALK_SPAWNS} from '../components/worlds/scene/walkGeometry';
import {characters} from '../lib/characters';
test('crowd has 28 separated adult positions with independent activity zones',()=>{
 assert.equal(CROWD_ROUTES.length,28);
 for(const zone of ['harbor','market','library'])assert.ok(CROWD_ROUTES.filter(r=>r.zone===zone).length>=8);
 CROWD_ROUTES.forEach((route,i)=>{assert.ok(isWalkable(route.points[0],.42));for(const other of CROWD_ROUTES.slice(i+1))assert.ok(Math.hypot(route.points[0].x-other.points[0].x,route.points[0].z-other.points[0].z)>=2.1);});
});
test('every crowd route follows traversable terrain without crossing obstacles or terrace walls',()=>{
 for(const route of CROWD_ROUTES){assert.ok(safeCrowdSegment(route.points[0],route.points[1]));assert.ok(safeCrowdSegment(route.points[1],route.points[0]));}
 assert.equal(safeCrowdSegment({x:0,z:0},{x:0,z:-13}),false);
});

test('citizens populate the lesson market and forecourt rather than only distant back streets',()=>{
 const starts=CROWD_ROUTES.map(route=>({zone:route.zone,...route.points[0]}));
 assert.ok(starts.filter(p=>p.zone==='market'&&p.x>=10&&p.x<=30&&p.z>=2&&p.z<=18).length>=8);
 assert.ok(starts.filter(p=>p.zone==='library'&&p.x>=-15&&p.x<=18&&p.z>=-4&&p.z<=3).length>=6);
 assert.ok(starts.filter(p=>p.zone==='harbor'&&p.z>=12&&p.z<=24).length>=3);
});

test('entire activity routes leave teaching companions and player arrival points clear',()=>{
 const protectedPoints=[...Object.values(WALK_SPAWNS),...Object.values(characters).map(c=>({x:c.position[0],z:c.position[2]}))];
 for(const route of CROWD_ROUTES){
  const [a,b]=route.points,steps=Math.ceil(route.length/.1);
  for(let i=0;i<=steps;i++){
   const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps;
   for(const point of protectedPoints)assert.ok(Math.hypot(point.x-x,point.z-z)>=1.25,`${route.zone} route crowds an arrival or companion`);
  }
 }
});

import {approachingPerson} from '../components/worlds/scene/crowdRoutes';
test('a pedestrian yields when approaching but can retreat out of an overlap',()=>{
 assert.equal(approachingPerson({x:0,z:0},{x:.1,z:0},{x:.7,z:0}),true);
 assert.equal(approachingPerson({x:0,z:0},{x:-.1,z:0},{x:.7,z:0}),false);
});
