import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES} from '../lib/worldThemes';
import {addThemeArchitecture} from '../components/worlds/scene/themeArchitecture';
import {applyThemeSurfaces} from '../components/worlds/scene/themeSurfaces';
import {surfaceUnionGeometry,type SurfaceRectangle} from '../components/worlds/scene/surfaceUnion';

test('crossing rotated paths cover their union once, including at grazing angles',()=>{
 const rectangles:SurfaceRectangle[]=[{x:0,z:0,width:1.8,depth:22},{x:0,z:0,width:1.8,depth:22,turn:.8},{x:0,z:0,width:1.8,depth:22,turn:-.7}];
 const mesh=new THREE.Mesh(surfaceUnionGeometry(rectangles,.05),new THREE.MeshBasicMaterial());mesh.updateMatrixWorld(true);
 for(let x=-8.873;x<9;x+=.413)for(let z=-8.719;z<9;z+=.397){
  const covered=rectangles.some(r=>{const c=Math.cos(r.turn??0),s=Math.sin(r.turn??0),dx=x-r.x,dz=z-r.z;return Math.abs(dx*c-dz*s)<r.width/2&&Math.abs(dx*s+dz*c)<r.depth/2;});
  for(const offset of [new THREE.Vector3(0,2,0),new THREE.Vector3(8,1.62,4)]){
   const target=new THREE.Vector3(x,.05,z),origin=target.clone().add(offset);
   const hits=new THREE.Raycaster(origin,target.clone().sub(origin).normalize()).intersectObject(mesh);
   assert.equal(hits.length,covered?1:0,`coverage at ${x},${z}`);
   if(hits.length)assert.ok(hits[0].face!.normal.y>.999);
  }
 }
 mesh.geometry.dispose();mesh.material.dispose();
});

test('indoor wooden floors have no coplanar terrain before or after material application',()=>{
 for(const id of ['frankenstein','declaration','seneca-falls']){
  const scene=new THREE.Scene(),theme=WORLD_THEMES[id],architecture=addThemeArchitecture(scene,theme,false);
  const check=()=>{
   scene.updateMatrixWorld(true);
   for(const [x,z] of [[.37,7.13],[3.13,14.17],[-3.27,8.71],[22.13,8.37]]){
    const target=new THREE.Vector3(x,0,z);
    for(const offset of [new THREE.Vector3(0,1.62,0),new THREE.Vector3(3,1.62,1)]){
     const origin=target.clone().add(offset),hits=new THREE.Raycaster(origin,target.clone().sub(origin).normalize()).intersectObject(architecture.root,true);
     const floorHits=hits.filter(hit=>Math.abs(hit.point.y)<1e-5&&hit.face!.normal.y>.9);
     assert.equal(floorHits.length,1,`${id} one ground surface at ${x},${z}`);
    }
   }
  };
  check();const surfaces=applyThemeSurfaces(scene,theme);check();surfaces.dispose();architecture.dispose();
 }
});

test('paved courtyard has no duplicate radial paths at the same elevation',()=>{
 const scene=new THREE.Scene(),architecture=addThemeArchitecture(scene,WORLD_THEMES['douglass-literacy'],false);scene.updateMatrixWorld(true);
 for(const [x,z] of [[.17,.19],[-4.13,2.67],[4.31,1.63],[.17,-3.13]]){
  const hits=new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)).intersectObject(architecture.root,true).filter(h=>Math.abs(h.point.y-.05)<1e-5);
  assert.equal(hits.length,1,`one courtyard surface at ${x},${z}`);
 }
 architecture.dispose();
});
