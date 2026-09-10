import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {WORLD_THEMES} from '../lib/worldThemes';
import {themedExternalPlacements} from '../components/worlds/scene/themedSetting';
import {themeExternalDetails} from '../components/worlds/scene/themeExternalDetails';
import {placementBounds} from '../components/worlds/scene/externalLayout';
import index from '../lib/externalAssetIndex.json';

const models=new Map<string,THREE.Group>();
async function geometry(id:string){
 if(models.has(id))return models.get(id)!;
 const asset=index.find(a=>a.id===id)!,bytes=readFileSync(new URL(`../public${asset.url}`,import.meta.url));
 // Geometry-only parsing in Node: browser texture decoding is not tested here.
 const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 delete doc.images;delete doc.textures;delete doc.materials;
 for(const mesh of doc.meshes??[])for(const primitive of mesh.primitives)delete primitive.material;
 const json=Buffer.from(JSON.stringify(doc)),padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
 const bin=bytes.subarray(20+bytes.readUInt32LE(12)),header=Buffer.alloc(20);
 header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+padded.length+bin.length,8);header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
 const stripped=Buffer.concat([header,padded,bin]);
 const model=(await new GLTFLoader().parseAsync(stripped.buffer.slice(stripped.byteOffset,stripped.byteOffset+stripped.byteLength),'')).scene;
 models.set(id,model);return model;
}

test('themed reading details rest on their actual scaled support mesh without overlapping',async()=>{
 let count=0;
 for(const theme of Object.values(WORLD_THEMES)){
  const placements=themedExternalPlacements(theme),details=themeExternalDetails(theme,placements);
  assert.equal(new Set(placements.map(p=>p.key)).size,placements.length);
  for(const item of details){
   count++;const base=placements.find(p=>p.key===item.support)!;
   assert.ok(base);assert.equal(placements.filter(p=>p.key===item.key).length,1);
   assert.equal(item.solid,false);assert.ok(item.zone);
   const footprint=placementBounds(item),support=placementBounds(base);
   assert.ok(footprint[0]>=support[0]&&footprint[1]<=support[1]&&footprint[2]>=support[2]&&footprint[3]<=support[3],`${theme.id}/${item.key}: overhang`);
   const model=(await geometry(base.asset)).clone(true);model.position.set(...base.at);model.rotation.y=base.turn??0;model.scale.setScalar(base.scale??1);model.updateMatrixWorld(true);
   const ray=new THREE.Raycaster(new THREE.Vector3(item.at[0],10,item.at[2]),new THREE.Vector3(0,-1,0)),hit=ray.intersectObject(model,true)[0];
   assert.ok(hit,`${item.key}: no surface`);assert.ok(Math.abs(hit.point.y-item.at[1])<.01,`${item.key}: surface ${hit.point.y}, item ${item.at[1]}`);
  }
  for(let i=0;i<details.length;i++)for(let j=i+1;j<details.length;j++){
   const a=placementBounds(details[i]),b=placementBounds(details[j]);
   assert.ok(a[1]<=b[0]||a[0]>=b[1]||a[3]<=b[2]||a[2]>=b[3],`${details[i].key} overlaps ${details[j].key}`);
  }
 }
 assert.equal(count,18);
});

test('detail placement follows an already translated and rotated support exactly once',()=>{
 const theme=WORLD_THEMES['douglass-literacy'],base={key:'courtyard-table',asset:'quaternius-fantasy-props-workbench-drawers',at:[20,2,30] as [number,number,number],turn:Math.PI/2,scale:2};
 const before=JSON.stringify(base),details=themeExternalDetails(theme,[base]);
 assert.equal(JSON.stringify(base),before);assert.equal(details[0].at[0],20);assert.equal(details[0].at[2],30.9);assert.equal(details[0].at[1],2+1.14553*2+.003);assert.equal(details[0].support,base.key);
});
