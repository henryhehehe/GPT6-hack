import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createDistrictHouses,NEIGHBORHOOD_HOUSES} from '../components/worlds/scene/districtHouses';
import {DISTRICT_BUILDINGS} from '../components/worlds/scene/cityLayout';

test('district doors and windows are recessed into walls and detail stays batched',()=>{
 const parent=new THREE.Group(),houses=createDistrictHouses(parent);parent.updateMatrixWorld(true);
 assert.equal(NEIGHBORHOOD_HOUSES.length,20,'includes the four houses around the library');
 const b=DISTRICT_BUILDINGS[0],front=b.z+b.d/2;
 const hit=(x:number,y:number)=>new THREE.Raycaster(new THREE.Vector3(x,.95+y,front+1),new THREE.Vector3(0,0,-1),0,2).intersectObject(houses.root,true)[0];
 const wall=hit(b.x+2,1.4),door=hit(b.x+.05,1.4),window=hit(b.x+b.w*.29,2.25);
 assert.ok(wall&&door&&window);
 assert.ok(Math.abs(wall.distance-1)<.01,'solid wall lies on original footprint');
 assert.ok(door.distance>1.15,'door boards sit inside a real reveal');
 assert.ok(window.distance>1.2,'window gap exposes the recessed interior rather than a solid wall');
 let triangles=0,pitchedTiles=0;
 houses.root.traverse(o=>{
  if(!(o instanceof THREE.InstancedMesh))return;
  triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*o.count;
  for(let i=0;i<o.instanceMatrix.array.length;i++)assert.ok(Number.isFinite(o.instanceMatrix.array[i]));
  if(o.geometry.type==='CylinderGeometry')for(let i=0;i<o.count;i++){
   const matrix=new THREE.Matrix4();o.getMatrixAt(i,matrix);
   const direction=new THREE.Vector3(0,0,1).transformDirection(matrix);
   if(Math.abs(direction.x)>.9){
    assert.ok(Math.abs(direction.y)>.17&&Math.abs(direction.y)<.36,'roof channels follow the roof pitch instead of floating horizontally');pitchedTiles++;
   }
  }
 });
 assert.ok(houses.root.children.length<=28,'shared batches bound draw calls for all twenty houses');
 assert.ok(triangles<275000,'detail stays within the district geometry budget');
 assert.ok(pitchedTiles>1000,'pitched roofs carry individual tile courses');
 houses.dispose();assert.equal(parent.children.length,0);
});
