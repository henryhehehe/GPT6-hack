import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Box3, Vector3, Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

for (const name of ['library', 'lighthouse']) {
  const bytes = await readFile(new URL(`../public/models/${name}.glb`, import.meta.url));
  assert(bytes.byteLength < 5_000_000, `${name} exceeds the 5 MB asset budget`);
  const { scene } = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const size = new Box3().setFromObject(scene, true).getSize(new Vector3());
  assert(size.toArray().every(Number.isFinite), 'Bounds must be finite');
  assert(size.y > 8 && size.y < 17, 'Expected upright architecture in glTF Y-up coordinates');
  let triangles = 0, meshes = 0;
  scene.traverse(object => {
    if (object instanceof Mesh) { meshes++; triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3; }
  });
  assert(triangles < 150_000, 'Triangle budget exceeded');
  assert(meshes < 40, 'Static geometry should be consolidated by material');
  if (name === 'library') {
    for (const key of ['ArchiveDoorLeft', 'ArchiveDoorRight']) {
      const door = scene.getObjectByName(key);
      assert(door, `Missing animated node: ${key}`);
      const closed = new Box3().setFromObject(door, true).getSize(new Vector3());
      door.rotation.y += Math.PI * .44;
      const open = new Box3().setFromObject(door, true).getSize(new Vector3());
      assert(open.z > closed.z, 'Door must swing around its vertical axis');
    }
  }
  console.log(JSON.stringify({ name, bytes: bytes.byteLength, meshes, triangles, size: size.toArray().map(n => +n.toFixed(2)) }));
}
