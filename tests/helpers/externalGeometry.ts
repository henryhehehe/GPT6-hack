import {readFileSync} from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import index from '../../lib/externalAssetIndex.json';

/** Load retained GLB geometry in Node; browser image/material decoding is excluded. */
export async function externalGeometry(url:string){
 const asset=index.find(a=>url===`${a.url}?v=${a.sha256.slice(0,12)}`);
 if(!asset)throw new Error(`Unknown external model URL: ${url}`);
 const bytes=readFileSync(new URL(`../../public${asset.url}`,import.meta.url));
 const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 delete doc.images;delete doc.textures;delete doc.materials;
 for(const mesh of doc.meshes??[])for(const primitive of mesh.primitives)delete primitive.material;
 const json=Buffer.from(JSON.stringify(doc)),padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
 const bin=bytes.subarray(20+bytes.readUInt32LE(12)),header=Buffer.alloc(20);
 header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+padded.length+bin.length,8);header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
 const stripped=Buffer.concat([header,padded,bin]);
 return new GLTFLoader().parseAsync(stripped.buffer.slice(stripped.byteOffset,stripped.byteOffset+stripped.byteLength),'');
}
