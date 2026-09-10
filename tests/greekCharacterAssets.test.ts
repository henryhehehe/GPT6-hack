import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import manifest from '../assets/model-manifest.json';
import {geometryOnlyGlb} from './helpers/glbGeometry';

test('detailed Greek cast stays within its download allocation with portable materials and normalized skin weights',async()=>{
 let total=0;
 for(const id of ['dorian','thaleia','ione']){
  const bytes=await readFile(new URL(`../public/models/characters/${id}.glb`,import.meta.url));total+=bytes.length;
  const entry=manifest.assets.find(a=>a.id===id)!;
  assert.equal(entry.bytes,bytes.length);assert.equal(entry.sha256,createHash('sha256').update(bytes).digest('hex'));
  assert.match(entry.creator,/Quaternius/);assert.match(entry.provenance,/not a historical portrait/);
  geometryOnlyGlb(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
  const jsonLength=bytes.readUInt32LE(12),doc=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
  assert.deepEqual(doc.animations.map((a:{name:string})=>a.name).sort(),['Greeting','Idle','Talk']);
  assert.ok(doc.images.length>0&&doc.images.every((i:{uri?:string})=>!i.uri));
  assert.ok(doc.materials.some((m:{normalTexture?:unknown})=>m.normalTexture));
  for(const mesh of doc.meshes)for(const primitive of mesh.primitives){
   const weights=doc.accessors[primitive.attributes.WEIGHTS_0];
   assert.equal(weights.componentType,5121);assert.equal(weights.normalized,true);assert.equal(weights.type,'VEC4');
   const view=doc.bufferViews[weights.bufferView],start=28+jsonLength+(view.byteOffset??0)+(weights.byteOffset??0);
   for(let i=0;i<weights.count;i++){
    const at=start+i*(view.byteStride??4);
    assert.equal(bytes[at]+bytes[at+1]+bytes[at+2]+bytes[at+3],255,`${id}: complete normalized weights at ${i}`);
   }
  }
 }
 // Expanded deliberately for the requested higher-detail draped clothing.
 assert.ok(total<6_000_000,'the three detailed companions stay below the 6 MB cast budget');
});
