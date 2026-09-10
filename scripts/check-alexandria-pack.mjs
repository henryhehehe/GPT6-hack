/** Run with: node --import tsx scripts/check-alexandria-pack.mjs */
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Box3, BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ALEXANDRIA_ASSET_IDS, loadAlexandriaKit } from '../components/worlds/scene/alexandriaKit.ts';
import { isWalkable, WALK_SPAWNS } from '../components/worlds/scene/walkGeometry.ts';

const base = new URL('../public/models/alexandria/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', base), 'utf8'));
const parse = async name => {
  const bytes = await readFile(new URL(name, base));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  return { bytes, gltf };
};
const rows = [];
assert.deepEqual(manifest.assets.map(a => a.id), [...ALEXANDRIA_ASSET_IDS]);
for (const asset of manifest.assets) {
  const { bytes, gltf } = await parse(asset.file);
  assert(gltf.scene.getObjectByName(asset.id), `Missing exported root: ${asset.id}`);
  assert(bytes.length < 5_000_000, `${asset.id}: exceeds per-model download budget`);
  const bounds = new Box3().setFromObject(gltf.scene, true), size = bounds.getSize(new Vector3());
  assert(size.toArray().every(v => Number.isFinite(v) && v > .01));
  const [min, max] = asset.blenderBounds;
  const expected = [max[0] - min[0], max[2] - min[2], max[1] - min[1]];
  size.toArray().forEach((v, i) => assert(Math.abs(v - expected[i]) < .001, `${asset.id}: coordinate conversion`));
  let triangles = 0, meshes = 0;
  gltf.scene.traverse(o => {
    if (!(o instanceof Mesh)) return;
    meshes++; triangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
    for (const value of o.geometry.attributes.position.array) assert(Number.isFinite(value), 'Non-finite vertex');
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) assert(m.isMeshStandardMaterial, 'Expected native PBR material');
  });
  assert(meshes <= 10, `${asset.id}: consolidate static material batches`);
  assert(triangles < 60_000, `${asset.id}: unexpected triangle cost`);
  rows.push({ id: asset.id, bytes: bytes.length, triangles, meshPrimitives: meshes, size: size.toArray().map(v => +v.toFixed(3)) });
}
const { bytes, gltf } = await parse('alexandria-kit.glb');
const landmarkBytes = (await readFile(new URL('../public/models/library.glb', import.meta.url))).length +
  (await readFile(new URL('../public/models/lighthouse.glb', import.meta.url))).length;
assert(bytes.length + landmarkBytes < 15_000_000, 'Whole-scene initial models exceed 15 MB');
for (const id of ALEXANDRIA_ASSET_IDS) assert(gltf.scene.getObjectByName(id), `Bundle missing ${id}`);
for (const name of ['CargoAnchor', 'Waterline', 'DisplayAnchor', 'ScrollAnchor', 'DocumentAnchor']) {
  assert(gltf.scene.getObjectByName(name), `Missing interaction anchor ${name}`);
}
const fallback = () => {
  const groups = n => Array.from({ length: n }, () => {
    const group = new Group(); group.add(new Mesh(new BoxGeometry(), new MeshStandardMaterial())); return group;
  });
  const stalls = groups(5);
  stalls.forEach((g, i) => g.position.set(13 + i % 2 * 8, 1, 5 + Math.floor(i / 2) * 5));
  return { houses: groups(4), palms: groups(6), stalls, ships: groups(6), goods: groups(39), decor: groups(1) };
};
const tick = () => new Promise(resolve => setImmediate(resolve));
const originalLoad = GLTFLoader.prototype.loadAsync;
let drawCalls = 0, placedTriangles = 0;
try {
  // Actual exported GLB, through the production integration path without a GPU.
  GLTFLoader.prototype.loadAsync = async url => { assert.match(url, /^\/models\/alexandria\//); return gltf; };
  const parent = new Group(), placeholders = fallback();
  Object.values(placeholders).flat().forEach(o => parent.add(o));
  const kit = loadAlexandriaKit(parent, placeholders); await tick();
  assert(kit.ready, 'Complete pack should replace fallback');
  assert(placeholders.goods.every(o => !o.visible));
  assert(placeholders.decor.every(o => !o.visible));
  for (const group of [...placeholders.houses, ...placeholders.palms, ...placeholders.stalls, ...placeholders.ships]) {
    assert.equal(group.children.length, 2); assert.equal(group.children[0].visible, false);
    assert(new Box3().setFromObject(group.children[1], true).getSize(new Vector3()).length() > .1);
  }
  const scenery = parent.getObjectByName('AlexandriaOriginalScenery'); assert(scenery);
  const cargo = scenery.children.filter(o => o.children[0] && ['cargo-crate','amphora','grain-sack'].includes(o.children[0].name));
  const stock = scenery.children.filter(o => o.children[0]?.name.endsWith('-display'));
  assert.equal(cargo.length, 14); assert.equal(stock.length, 5);
  kit.update(1, 0, 1); assert(cargo.every(o => !o.visible)); assert(stock.every(o => o.visible));
  kit.update(1, 1, 0); assert(cargo.every(o => o.visible)); assert(stock.every(o => !o.visible));
  kit.update(0, 0, 0); assert([...cargo, ...stock].every(o => o.visible));
  parent.updateMatrixWorld(true);
  parent.traverseVisible(o => {
    if (!(o instanceof Mesh)) return;
    drawCalls += Array.isArray(o.material) ? o.material.length : 1;
    placedTriangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1);
  });
  assert(scenery.children.some(o => o.isInstancedMesh && o.count > 1), 'Repeated static props should share draws');
  kit.dispose(); assert(!parent.getObjectByName('AlexandriaOriginalScenery'));
  assert(placeholders.ships.every(o => o.children.length === 1 && o.children[0].visible));

  // Late completions cannot attach resources after the viewer is unmounted.
  const late = (await parse('alexandria-kit.glb')).gltf;
  let resolve; GLTFLoader.prototype.loadAsync = () => new Promise(r => { resolve = r; });
  const closedParent = new Group(), closedFallback = fallback();
  let disposedGeometries = 0;
  late.scene.traverse(o => { if (o instanceof Mesh) o.geometry.addEventListener('dispose', () => disposedGeometries++); });
  const closed = loadAlexandriaKit(closedParent, closedFallback); closed.dispose(); resolve(late); await tick();
  assert.equal(closedParent.children.length, 0); assert(disposedGeometries > 0); assert(!closed.ready);

  // An incomplete pack is rejected atomically; no disappearing placeholders.
  const missing = (await parse('alexandria-kit.glb')).gltf;
  missing.scene.getObjectByName('amphora').removeFromParent();
  GLTFLoader.prototype.loadAsync = async () => missing;
  const originalWarn = console.warn; console.warn = () => {};
  try {
    const brokenParent = new Group(), brokenFallback = fallback();
    const broken = loadAlexandriaKit(brokenParent, brokenFallback); await tick();
    assert(!broken.ready); assert.equal(brokenParent.children.length, 0);
    assert(brokenFallback.goods.every(o => o.visible)); broken.dispose();
    assert(brokenFallback.decor.every(o => o.visible));
  } finally { console.warn = originalWarn; }
} finally { GLTFLoader.prototype.loadAsync = originalLoad; }

for (const point of Object.values(WALK_SPAWNS)) assert(isWalkable(point));
for (const point of [{ x: -9, z: 0 }, { x: -12, z: 0 }, { x: -6, z: 0 }, { x: -5.14, z: 25 }]) assert(!isWalkable(point));
for (const x of [-12,-4,5]) for (let z = 13; z < 29; z += .2) assert(isWalkable({ x, z }), 'Pier centerline must stay clear');

const report = {
  assets: rows, bundleBytes: bytes.length, initialSceneModelBytes: bytes.length + landmarkBytes,
  uniqueTriangles: rows.reduce((n,a) => n+a.triangles,0), meshPrimitives: rows.reduce((n,a) => n+a.meshPrimitives,0),
  placedKitDrawCalls: drawCalls, placedKitTriangles: placedTriangles,
  checks: ['28 individual GLBs and bundle loaded', 'Y-up and exact vertex bounds', 'Finite vertices and PBR materials', 'Download and geometry budgets', 'Interaction anchor preservation', 'Production loader and instancing', 'Independent harbor/market activity', 'Disposal after late load', 'Atomic fallback on incomplete bundle', 'Clear spawns and pier centerlines'],
  limitation: 'CPU-side integration and geometry checks; no browser GPU frame-rate measurement.',
};
await writeFile(new URL('../assets/blender/alexandria-validation.json', import.meta.url), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ assets:rows.length, bundleBytes:report.bundleBytes, initialSceneModelBytes:report.initialSceneModelBytes, uniqueTriangles:report.uniqueTriangles, placedKitDrawCalls:drawCalls, placedKitTriangles:placedTriangles, checks:report.checks },null,2));
