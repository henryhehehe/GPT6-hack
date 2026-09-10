// Validate exported assets with the same GLTFLoader used by the application.
import { readFile, writeFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Box3, Vector3, Mesh, AnimationMixer, LoopOnce } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const repo = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('assets/model-manifest.json', repo), 'utf8'));
const rows = [];
assert.equal(new Set(manifest.assets.map(a => a.id)).size, manifest.assets.length, 'Duplicate asset IDs');
for (const asset of manifest.assets) {
  assert((await stat(new URL(asset.source, repo))).size > 100, `${asset.id}: editable source missing`);
  const bytes = await readFile(new URL(`public${asset.url}`, repo));
  assert.equal(bytes.length, asset.bytes, `${asset.id}: stale byte count`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `${asset.id}: stale checksum`);
  const maxBytes = asset.category === 'characters' ? 2_000_000 : 5_000_000;
  assert(bytes.length < maxBytes, `${asset.id}: payload budget`);
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString('utf8'));
  assert(!json.buffers.some(b => b.uri), `${asset.id}: external buffer`);
  assert(!(json.images ?? []).some(b => b.uri), `${asset.id}: external image`);
  assert(!(json.cameras?.length), `${asset.id}: exported studio camera`);
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length), '');
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(scene, true);
  const size = bounds.getSize(new Vector3());
  assert([...bounds.min, ...bounds.max].every(Number.isFinite), `${asset.id}: invalid bounds`);
  assert(bounds.min.y >= -.03 && bounds.min.y <= .10, `${asset.id}: ground origin ${bounds.min.y}`);
  for (let i = 0; i < 3; i++) {
    assert(Math.abs(bounds.min.getComponent(i) - asset.bounds.min[i]) < .006, `${asset.id}: minimum bound mismatch`);
    assert(Math.abs(bounds.max.getComponent(i) - asset.bounds.max[i]) < .006, `${asset.id}: maximum bound mismatch`);
  }
  for (const name of Object.values(asset.anchors)) assert(scene.getObjectByName(name), `${asset.id}: missing ${name}`);
  if (asset.id === 'austen-doorway') {
    const hinge = scene.getObjectByName('austen-doorway__DoorHinge');
    assert(hinge, 'Austen door hinge is missing');
    const closed = new Box3().setFromObject(hinge, true).getSize(new Vector3());
    hinge.rotation.y = Math.PI * .45; scene.updateMatrixWorld(true);
    const open = new Box3().setFromObject(hinge, true).getSize(new Vector3());
    assert(open.z > closed.z + .5, 'Austen door must swing around a vertical hinge');
    hinge.rotation.y = 0; scene.updateMatrixWorld(true);
  }
  let triangles = 0, primitives = 0, skinned = 0;
  const materials = new Set();
  scene.traverse(object => {
    if (!(object instanceof Mesh)) return;
    primitives++;
    triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
    assert(object.geometry.attributes.color, `${asset.id}: missing vertex palette`);
    const colors = object.geometry.attributes.color;
    let variation = false;
    for (let i = 0; i < Math.min(colors.count, 1000); i++) {
      assert(Number.isFinite(colors.getX(i)), `${asset.id}: invalid color`);
      if (Math.abs(colors.getX(i) - colors.getY(i)) > .01) variation = true;
    }
    assert(variation, `${asset.id}: unexpectedly monochrome palette`);
    for (const mat of Array.isArray(object.material) ? object.material : [object.material]) materials.add(mat.uuid);
    if (object.isSkinnedMesh) {
      skinned++;
      assert(object.skeleton.bones.length >= 10, `${asset.id}: incomplete rig`);
      const w = object.geometry.attributes.skinWeight;
      for (let i = 0; i < w.count; i++) assert(Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1) < .001, `${asset.id}: skin weights`);
    }
  });
  assert(materials.size <= 3, `${asset.id}: material budget`);
  assert(primitives <= 3, `${asset.id}: primitive budget`);
  const maxTriangles = asset.pack === 'background-citizens' ? 3_000 : asset.category === 'characters' ? 15_000 : 8_000;
  assert(triangles <= maxTriangles, `${asset.id}: ${triangles} triangles exceeds ${maxTriangles}`);
  assert.deepEqual(gltf.animations.map(c => c.name).sort(), [...asset.clips].sort(), `${asset.id}: clip contract`);
  if (asset.clips.length) {
    assert(skinned, `${asset.id}: clips without skinned mesh`);
    for (const clip of gltf.animations) {
      assert(clip.tracks.some(track => {
        const width = track.getValueSize();
        return track.values.some((value, index) => index >= width && Math.abs(value-track.values[index%width]) > .0001);
      }), `${asset.id}: ${clip.name} contains no motion`);
      const mixer = new AnimationMixer(scene);
      const action = mixer.clipAction(clip).setLoop(LoopOnce, 1); action.clampWhenFinished = true; action.play();
      for (const t of [0, clip.duration * .25, clip.duration * .5, clip.duration]) {
        mixer.setTime(t); scene.updateMatrixWorld(true);
        const animated = new Box3().setFromObject(scene, true);
        assert([...animated.min,...animated.max].every(Number.isFinite), `${asset.id}: invalid animation bounds`);
        assert(animated.getSize(new Vector3()).length() < 5, `${asset.id}: exploded rig`);
      }
      mixer.stopAllAction(); mixer.uncacheRoot(scene);
    }
  }
  rows.push({ id: asset.id, bytes: bytes.length, triangles, primitives, materials: materials.size, size: size.toArray().map(n => +n.toFixed(3)), clips: asset.clips });
}
const totalBytes = rows.reduce((sum, r) => sum+r.bytes, 0);
const landmarks = await Promise.all(['library','lighthouse'].map(async id => (await readFile(new URL(`public/models/${id}.glb`, repo))).length));
// Wardrobes are mutually exclusive: the loader requests only three readers per world.
// Keep the existing scene budget; conservatively include ALL props, background citizens,
// both landmarks and the three largest reader GLBs, even though no scene loads all props.
const readerAssets=manifest.assets.filter(a=>a.category==='characters'&&a.pack!=='background-citizens');
const largestCastBytes=readerAssets.map(a=>a.bytes).sort((a,b)=>b-a).slice(0,3).reduce((a,b)=>a+b,0);
const sharedBytes=manifest.assets.filter(a=>!readerAssets.includes(a)).reduce((sum,a)=>sum+a.bytes,0);
const conservativeSceneBytes=sharedBytes+largestCastBytes+landmarks.reduce((a,b)=>a+b,0);
assert(conservativeSceneBytes < 15_000_000, 'Concurrent authored scene payload including landmarks exceeds 15 MB');
console.table(rows.map(({size,clips,...r})=>({...r,size:size.join(' × '),clips:clips.join(', ')})));
console.log(JSON.stringify({assets: rows.length, totalBytes, conservativeSceneBytes, withLandmarksBytes: totalBytes+landmarks.reduce((a,b)=>a+b,0)}));
if (process.argv.includes('--write')) await writeFile(new URL('assets/model-metrics.json',repo),JSON.stringify({assets:rows,totalBytes,conservativeSceneBytes,withLandmarksBytes:totalBytes+landmarks.reduce((a,b)=>a+b,0)},null,2)+'\n');
