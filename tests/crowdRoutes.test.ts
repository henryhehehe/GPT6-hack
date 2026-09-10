import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CROWD_ROUTES,safeCrowdSegment} from '../components/worlds/scene/crowdRoutes';
import {isWalkable} from '../components/worlds/scene/walkGeometry';
test('crowd has 28 separated adult positions with independent activity zones',()=>{
 assert.equal(CROWD_ROUTES.length,28);
 for(const zone of ['harbor','market','library'])assert.ok(CROWD_ROUTES.filter(r=>r.zone===zone).length>=8);
 CROWD_ROUTES.forEach((route,i)=>{assert.ok(isWalkable(route.points[0],.42));for(const other of CROWD_ROUTES.slice(i+1))assert.ok(Math.hypot(route.points[0].x-other.points[0].x,route.points[0].z-other.points[0].z)>=2.1);});
});
test('every crowd route follows traversable terrain without crossing obstacles or terrace walls',()=>{
 for(const route of CROWD_ROUTES){assert.ok(safeCrowdSegment(route.points[0],route.points[1]));assert.ok(safeCrowdSegment(route.points[1],route.points[0]));}
 assert.equal(safeCrowdSegment({x:0,z:0},{x:0,z:-13}),false);
});

import {approachingPerson} from '../components/worlds/scene/crowdRoutes';
test('a pedestrian yields when approaching but can retreat out of an overlap',()=>{
 assert.equal(approachingPerson({x:0,z:0},{x:.1,z:0},{x:.7,z:0}),true);
 assert.equal(approachingPerson({x:0,z:0},{x:-.1,z:0},{x:.7,z:0}),false);
});
