import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadSettingAssets } from '../components/worlds/scene/settingAssets';
import { pickSceneSelection } from '../components/worlds/scene/scenePicking';
import { SETTING_ASSETS, SETTING_ASSET_IDS, SETTING_SPOTS, createSettingNavigation, settingPlacements, type Setting, type SettingAssetId } from '../components/worlds/scene/settingLayout';

const settings: Setting[] = ['archive', 'garden', 'coast'];
const parsed = new Map<SettingAssetId, Promise<THREE.Group>>();
function model(id: SettingAssetId) {
  let pending = parsed.get(id);
  if (!pending) {
    pending = readFile(new URL(`../public${SETTING_ASSETS[id].url}`, import.meta.url)).then(async bytes => {
      assert.equal(createHash('sha256').update(bytes).digest('hex'), SETTING_ASSETS[id].sha256, `${id} manifest matches file`);
      return (await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')).scene;
    });
    parsed.set(id, pending);
  }
  return pending;
}

test('all 24 registered setting GLBs parse and match their placement bounds', async () => {
  for (const id of SETTING_ASSET_IDS) {
    const root = await model(id), box = new THREE.Box3().setFromObject(root, true), expected = SETTING_ASSETS[id].bounds;
    assert.ok(root.getObjectByName(`${id}__Anchor_Inspect`), `${id} inspect anchor retained`);
    box.min.toArray().forEach((v, i) => assert.ok(Math.abs(v - expected.min[i]) < .002, `${id} min ${i}: ${v}`));
    box.max.toArray().forEach((v, i) => assert.ok(Math.abs(v - expected.max[i]) < .002, `${id} max ${i}: ${v}`));
  }
});

for (const setting of settings) test(`${setting}: safe arrivals, reachable stations and bounded movement`, () => {
  const placements = settingPlacements(setting), nav = createSettingNavigation(placements);
  assert.ok(nav.isWalkable({ x: 1, z: 8 }), 'shared controller starting point');
  for (const spawn of Object.values(nav.spawns)) assert.ok(nav.isWalkable(spawn), 'safe spawn');
  // Flood the actual walkable floor from the central plaza, including all furniture.
  const queue = [{ x: 0, z: 0 }], seen = new Set(['0,0']);
  for (let i = 0; i < queue.length; i++) for (const [dx, dz] of [[.25, 0], [-.25, 0], [0, .25], [0, -.25]]) {
    const p = { x: queue[i].x + dx, z: queue[i].z + dz }, key = `${p.x},${p.z}`;
    if (!seen.has(key) && nav.isWalkable(p)) { seen.add(key); queue.push(p); }
  }
  for (const p of [...Object.values(SETTING_SPOTS), ...Object.values(nav.spawns)]) assert.ok(seen.has(`${p.x},${p.z}`), 'station and arrival connected to plaza');
  assert.equal(nav.isWalkable({ x: NaN, z: 0 }), false);
  assert.deepEqual(nav.moveWalker({ x: 0, z: 0 }, { x: Infinity, z: 0 }), { x: 0, z: 0 });
  assert.deepEqual(nav.moveWalker({ x: 0, z: 0 }, { x: 1e12, z: 0 }), { x: 0, z: 0 });
  const edge = nav.moveWalker({ x: 0, z: 0 }, { x: 100, z: 0 });
  assert.ok(nav.isWalkable(edge) && Math.hypot(edge.x, edge.z) < 25, 'cannot tunnel beyond island');
  const p = SETTING_SPOTS.library;
  const stopped = nav.moveWalker({ x: p.x, z: p.z + 1 }, { x: 0, z: -4 });
  assert.ok(stopped.z > p.z - .8, 'cannot tunnel through table/chair');
  assert.equal(nav.groundHeight(p), .22, 'station platform elevation');
  const ids = [...new Set(placements.map(p => p.id))];
  assert.ok(ids.reduce((sum, id) => sum + SETTING_ASSETS[id].bytes, 0) < 2_100_000, 'only required assets, under 2.1 MB');
});

test('coast cave has two reachable open ends and geometry clears walking-camera height', async () => {
  const placements = settingPlacements('coast'), nav = createSettingNavigation(placements), cave = (await model('cave-module')).clone(true);
  cave.position.set(0, 0, 18); cave.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  for (const x of [-.5, 0, .5]) {
    assert.ok(nav.isWalkable({ x, z: 15.5 }) && nav.isWalkable({ x, z: 20.5 }));
    const end = nav.moveWalker({ x, z: 15.5 }, { x: 0, z: 5 });
    assert.ok(Math.abs(end.z - 20.5) < 1e-8, 'walk through both cave ends');
    ray.set(new THREE.Vector3(x, 1.65, 15.5), new THREE.Vector3(0, 0, 1)); ray.far = 5;
    assert.equal(ray.intersectObject(cave, true).length, 0, 'head-height route is visually open');
  }
  assert.equal(nav.isWalkable({ x: 1.2, z: 18 }), false, 'rock wall is solid');
});

test('successful loads replace all matching fallbacks, share resources and dispose once', async () => {
  const parent = new THREE.Group(), placements = settingPlacements('archive');
  const calls: string[] = [], resources = new Set<THREE.BufferGeometry>(), disposeCounts = new Map<THREE.BufferGeometry, number>();
  const pack = loadSettingAssets(parent, placements, async url => {
    calls.push(url);
    const id = url.split('/').pop()!.split('.glb')[0] as SettingAssetId;
    const scene = (await model(id)).clone(true);
    scene.traverse(o => { if (o instanceof THREE.Mesh) {
      resources.add(o.geometry);
      o.geometry.addEventListener('dispose', () => disposeCounts.set(o.geometry, (disposeCounts.get(o.geometry) ?? 0) + 1));
    } });
    return { scene };
  });
  const inspectScrolls = () => {
    pack.root.updateMatrixWorld(true);
    for (const p of placements.filter(p => p.id === 'open-scroll')) {
      const ray = new THREE.Raycaster(new THREE.Vector3(p.at[0], 5, p.at[2]), new THREE.Vector3(0, -1, 0));
      assert.deepEqual(pickSceneSelection(ray, pack.root), { action: 'evidence', zone: p.zone }, 'scroll opens its own station');
    }
  };
  inspectScrolls();
  await pack.ready;
  inspectScrolls();
  assert.equal(calls.length, 6, 'one request per distinct asset');
  assert.ok([...pack.status.values()].every(s => s === 'ready'));
  assert.equal(pack.root.children.length, placements.length);
  assert.ok(pack.root.children.every(o => !o.name.startsWith('fallback:')));
  const tables = pack.root.children.filter(o => o.name.startsWith('reading-table-'));
  const geometries = tables.map(root => { let geometry: THREE.BufferGeometry | undefined; root.traverse(o => { if (o instanceof THREE.Mesh) geometry = o.geometry; }); return geometry; });
  assert.equal(geometries[0], geometries[1], 'repeated objects reuse geometry');
  pack.dispose(); pack.dispose();
  assert.equal(parent.children.length, 0);
  for (const geometry of resources) assert.equal(disposeCounts.get(geometry), 1, 'dispose each shared geometry once');
});

test('one missing asset retains only its fallback without breaking neighboring assets', async () => {
  const placements = settingPlacements('garden').filter(p => ['writing-desk', 'open-letter'].includes(p.id));
  const pack = loadSettingAssets(new THREE.Group(), placements, async url => {
    if (url.includes('writing-desk')) throw new Error('Expected missing asset fixture');
    return { scene: (await model('open-letter')).clone(true) };
  });
  await pack.ready;
  assert.equal(pack.status.get('writing-desk'), 'failed');
  assert.equal(pack.status.get('open-letter'), 'ready');
  assert.equal(pack.root.children.filter(o => o.name.startsWith('fallback:')).length, 3);
  pack.dispose();
});

test('late loads after teardown release resources and never reattach objects', async () => {
  let resolve!: (result: { scene: THREE.Group }) => void;
  const parent = new THREE.Group(), scene = new THREE.Group(), geometry = new THREE.BoxGeometry(), material = new THREE.MeshStandardMaterial();
  scene.add(new THREE.Mesh(geometry, material));
  let geometryDisposals = 0, materialDisposals = 0;
  geometry.addEventListener('dispose', () => geometryDisposals++); material.addEventListener('dispose', () => materialDisposals++);
  const pack = loadSettingAssets(parent, settingPlacements('archive').slice(0, 1), () => new Promise(r => { resolve = r; }));
  pack.dispose(); resolve({ scene }); await pack.ready;
  assert.equal(parent.children.length, 0); assert.equal(geometryDisposals, 1); assert.equal(materialDisposals, 1);
});
