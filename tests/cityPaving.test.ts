import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CITY_SURFACE_Y,createCityPavingGeometry} from '../components/worlds/scene/cityPaving';
import {groundHeight} from '../components/worlds/scene/walkGeometry';

test('plaza and street junctions have one visible floor at walking and grazing angles',()=>{
  const geometry=createCityPavingGeometry(),material=new THREE.MeshBasicMaterial();
  const mesh=new THREE.Mesh(geometry,material);mesh.updateMatrixWorld(true);
  // The old rectangular street slabs overlapped at these intersections.
  for (const [x,z] of [[1.13,1.17],[-25.13,-28.37],[27.13,-28.37],[1.13,-34.37],[1.13,-65.37]]) {
    const target=new THREE.Vector3(x,CITY_SURFACE_Y.paving,z);
    for (const offset of [new THREE.Vector3(0,1.62,0),new THREE.Vector3(8,1.62,4),new THREE.Vector3(-12,1.62,-3)]) {
      const origin=target.clone().add(offset),ray=new THREE.Raycaster(origin,target.clone().sub(origin).normalize());
      const hits=ray.intersectObject(mesh);
      assert.equal(hits.length,1,`one floor at ${x},${z} from ${offset.toArray()}`);
      assert.ok(Math.abs(hits[0].point.y-groundHeight({x,z}))<.001,'floor matches walking height');
      assert.ok(hits[0].face!.normal.y>.999,'paving faces upward');
    }
  }
  assert.ok(CITY_SURFACE_Y.ground-CITY_SURFACE_Y.island>=.05);
  assert.ok(CITY_SURFACE_Y.paving-CITY_SURFACE_Y.ground>=.049);
  geometry.dispose();material.dispose();
});
