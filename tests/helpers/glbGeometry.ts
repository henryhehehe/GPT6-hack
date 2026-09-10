import assert from 'node:assert/strict';

/** Node has no image decoder. Validate embedded image storage, then parse the same
 * binary geometry/skin/animation data without material texture references.
 * Browser checks must separately exercise the original textured GLBs. */
export function geometryOnlyGlb(input:ArrayBuffer):ArrayBuffer{
 const bytes=Buffer.from(input),jsonLength=bytes.readUInt32LE(12);
 assert.equal(bytes.readUInt32LE(0),0x46546c67);
 assert.equal(bytes.readUInt32LE(4),2);
 assert.equal(bytes.readUInt32LE(8),bytes.length);
 const doc=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
 if(!doc.images?.length)return input;
 const binaryHeader=20+jsonLength,binaryLength=bytes.readUInt32LE(binaryHeader),binary=bytes.subarray(binaryHeader+8,binaryHeader+8+binaryLength);
 assert.equal(bytes.readUInt32LE(binaryHeader+4),0x004e4942);
 for(const image of doc.images){
  assert.equal(image.uri,undefined,'character textures must be self-contained');
  assert.ok(['image/png','image/jpeg'].includes(image.mimeType));
  const view=doc.bufferViews[image.bufferView];assert.ok(view&&view.buffer===0&&view.byteLength>32);
  assert.ok((view.byteOffset??0)+view.byteLength<=binary.length,'embedded texture is in bounds');
  const data=binary.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);
  if(image.mimeType==='image/png')assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  else assert.equal(data.subarray(0,2).toString('hex'),'ffd8');
 }
 function removeTextures(value:unknown){
  if(!value||typeof value!=='object')return;
  for(const [key,item] of Object.entries(value)){
   if(key.endsWith('Texture'))delete (value as Record<string,unknown>)[key];
   else removeTextures(item);
  }
 }
 removeTextures(doc.materials);delete doc.images;delete doc.textures;delete doc.samplers;
 const json=Buffer.from(JSON.stringify(doc)),padded=Buffer.alloc(Math.ceil(json.length/4)*4,0x20);json.copy(padded);
 const result=Buffer.alloc(20+padded.length+8+binary.length);
 result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8);result.writeUInt32LE(padded.length,12);result.writeUInt32LE(0x4e4f534a,16);padded.copy(result,20);
 result.writeUInt32LE(binary.length,20+padded.length);result.writeUInt32LE(0x004e4942,24+padded.length);binary.copy(result,28+padded.length);
 return result.buffer.slice(result.byteOffset,result.byteOffset+result.byteLength);
}
