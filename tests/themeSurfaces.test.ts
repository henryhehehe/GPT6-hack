import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES, WORLD_SURFACES, type SurfaceFinish} from '../lib/worldThemes';
import {addThemeArchitecture} from '../components/worlds/scene/themeArchitecture';
import {applyThemeSurfaces, surfaceTexel, SURFACE_TEXTURE_SIZE} from '../components/worlds/scene/themeSurfaces';

type Resource = THREE.BufferGeometry | THREE.Material | THREE.Texture;
function observe(resources: Iterable<Resource>) {
 const counts = new Map<Resource, number>();
 for (const resource of resources) {
  if (counts.has(resource)) continue;
  counts.set(resource, 0);
  resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource)! + 1));
 }
 return counts;
}
function meshes(root: THREE.Object3D) {
 const result: THREE.Mesh[] = [];
 root.traverse(object => {if (object instanceof THREE.Mesh) result.push(object);});
 return result;
}

test('every configured work treats native architecture, restores shared sources, and releases only owned resources once', () => {
 assert.deepEqual(Object.keys(WORLD_SURFACES).sort(), Object.keys(WORLD_THEMES).sort());
 for (const theme of Object.values(WORLD_THEMES)) {
  const scene = new THREE.Scene(), architecture = addThemeArchitecture(scene, theme);
  const originals = meshes(architecture.root).map(mesh => ({mesh, geometry: mesh.geometry, material: mesh.material}));
  const originalResources = observe(originals.flatMap(({geometry, material}) => [geometry, ...(Array.isArray(material) ? material : [material])]));
  const treatment = applyThemeSurfaces(scene, theme);
  const changed = originals.filter(({mesh, material}) => mesh.material !== material);
  assert.ok(treatment.count > 0, `${theme.id}: no treated architecture`);
  assert.equal(changed.length, treatment.count, theme.id);
  const owned = new Set<Resource>();
  for (const {mesh, geometry, material} of changed) {
   assert.notEqual(mesh.geometry, geometry);
   assert.ok(mesh.material instanceof THREE.MeshStandardMaterial);
   const replacement = mesh.material as THREE.MeshStandardMaterial;
   assert.notEqual(replacement, material);
   assert.ok(replacement.name.startsWith(`${theme.id}: `));
   owned.add(mesh.geometry); owned.add(replacement);
   for (const texture of [replacement.map, replacement.bumpMap, replacement.roughnessMap]) {
    assert.ok(texture instanceof THREE.DataTexture);
    assert.equal(texture.image.width, SURFACE_TEXTURE_SIZE); assert.equal(texture.image.height, SURFACE_TEXTURE_SIZE);
    assert.ok(texture.image.width<=256,'bounded material memory');
    assert.equal(texture.wrapS, THREE.RepeatWrapping); assert.equal(texture.wrapT, THREE.RepeatWrapping);
    owned.add(texture);
   }
   assert.equal(replacement.map!.colorSpace, THREE.SRGBColorSpace);
   assert.equal(replacement.bumpMap!.colorSpace, THREE.NoColorSpace);
   const uv = mesh.geometry.getAttribute('uv');
   assert.equal(uv.count, mesh.geometry.getAttribute('position').count);
   assert.ok(Array.from(uv.array).every(Number.isFinite), `${theme.id}: nonfinite UV`);
  }
  const disposal = observe(owned);
  treatment.dispose(); treatment.dispose();
  for (const {mesh, geometry, material} of originals) {
   assert.equal(mesh.geometry, geometry, `${theme.id}: geometry not restored`);
   assert.equal(mesh.material, material, `${theme.id}: material not restored`);
  }
  assert.ok([...disposal.values()].every(count => count === 1), `${theme.id}: owned resources not disposed exactly once`);
  assert.ok([...originalResources.values()].every(count => count === 0), `${theme.id}: source resource disposed by treatment`);
  architecture.dispose();
  assert.ok([...originalResources.values()].every(count => count === 1), `${theme.id}: source ownership changed`);
 }
});

test('material maps are deterministic and bounded across all finishes and tiled coordinates', () => {
 const finishes = new Set<SurfaceFinish>(Object.values(WORLD_SURFACES).flatMap(p => [p.ground, p.wall, p.stone, p.wood]));
 for (const finish of finishes) {
  const samples = new Set<string>();
  for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) {
   const u = x * .371, v = y * .217, value = surfaceTexel(finish, u, v);
   assert.deepEqual(value, surfaceTexel(finish, u, v));
   for (const [channel, n] of Object.entries(value)) assert.ok(Number.isFinite(n) && n >= 0 && n <= 1, `${finish}: ${channel}=${n}`);
   samples.add(JSON.stringify(value));
  }
  assert.ok(samples.size > 100, `${finish}: no meaningful spatial detail`);
 }
});

test('GLB-style hierarchies outside architecture retain geometry, PBR maps and materials', () => {
 const scene = new THREE.Scene(), theme = WORLD_THEMES.frankenstein;
 const architecture = addThemeArchitecture(scene, theme);
 const loaded = new THREE.Group(); loaded.name = 'Loaded GLB scene'; scene.add(loaded);
 const geometry = new THREE.BoxGeometry(8, 4, 2), texture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
 const material = new THREE.MeshStandardMaterial({color: theme.building, map: texture, roughness: .31, metalness: .4});
 const single = new THREE.Mesh(geometry, material), multi = new THREE.Mesh(geometry, [material, material]);
 loaded.add(single, multi);
 const multiMaterial = multi.material, sourceDisposal = observe([geometry, material, texture]);
 const treatment = applyThemeSurfaces(scene, theme);
 assert.equal(single.geometry, geometry); assert.equal(single.material, material);
 assert.equal(multi.geometry, geometry); assert.equal(multi.material, multiMaterial);
 assert.equal(material.map, texture); assert.equal(material.roughness, .31); assert.equal(material.metalness, .4);
 treatment.dispose();
 assert.ok([...sourceDisposal.values()].every(count => count === 0));
 architecture.dispose(); geometry.dispose(); material.dispose(); texture.dispose();
});

test('surface UV scale follows world meters, including translated, rotated and nested scaled architecture', () => {
 const scene = new THREE.Scene(), root = new THREE.Group(), parent = new THREE.Group();
 root.name = 'Architecture: test'; root.position.set(17, 3, -11); root.rotation.y = Math.PI / 2;
 parent.scale.set(2, 3, 1.5); root.add(parent); scene.add(root);
 const material = new THREE.MeshStandardMaterial({color: WORLD_THEMES.macbeth.building});
 const original = new THREE.BoxGeometry(1, 1, 1), mesh = new THREE.Mesh(original, material);
 mesh.scale.set(8, 4, 2); parent.add(mesh);
 const treatment = applyThemeSurfaces(scene, WORLD_THEMES.macbeth);
 assert.equal(treatment.count, 1);
 const positions = mesh.geometry.getAttribute('position'), uv = mesh.geometry.getAttribute('uv');
 // Each box face has four vertices. Axis-aligned world rotation means the UV distance
 // of an edge must equal its physical length / 4, including all ancestor transforms.
 for (let face = 0; face < 6; face++) for (const edge of [[0, 1], [0, 2]]) {
  const a = face * 4 + edge[0], b = face * 4 + edge[1];
  const pa = new THREE.Vector3().fromBufferAttribute(positions, a).applyMatrix4(mesh.matrixWorld);
  const pb = new THREE.Vector3().fromBufferAttribute(positions, b).applyMatrix4(mesh.matrixWorld);
  const textureDistance = Math.hypot(uv.getX(a) - uv.getX(b), uv.getY(a) - uv.getY(b));
  assert.ok(Math.abs(textureDistance - pa.distanceTo(pb) / 4) < 1e-5);
 }
 treatment.dispose(); original.dispose(); material.dispose();
});

test('glowing windows, tiny book spines, narrow trunks and unsupported material arrays keep their original finish', () => {
 const scene = new THREE.Scene(), root = new THREE.Group(); root.name = 'Architecture: exclusions'; scene.add(root);
 const theme = WORLD_THEMES.frankenstein;
 const plain = new THREE.MeshStandardMaterial({color: theme.roof});
 const glow = new THREE.MeshStandardMaterial({color: theme.building, emissive: '#ffd090', emissiveIntensity: .5});
 const geometry = new THREE.BoxGeometry(1, 1, 1);
 const window = new THREE.Mesh(geometry, glow); window.scale.set(2, 3, .2);
 const book = new THREE.Mesh(geometry, plain); book.scale.set(.32, .65, .6);
 const trunk = new THREE.Mesh(geometry, plain); trunk.scale.set(.35, 6, .35);
 const multiple = new THREE.Mesh(geometry, [plain, glow]); multiple.scale.set(5, 5, 5);
 root.add(window, book, trunk, multiple);
 const savedMaterials = root.children.map(o => (o as THREE.Mesh).material);
 const treatment = applyThemeSurfaces(scene, theme);
 assert.equal(treatment.count, 0);
 root.children.forEach((o, i) => {
  assert.equal((o as THREE.Mesh).material, savedMaterials[i]);
  assert.equal((o as THREE.Mesh).geometry, geometry);
 });
 treatment.dispose(); geometry.dispose(); plain.dispose(); glow.dispose();
});

test('Christmas street chimney shafts receive brick rather than the snow finish intended for roof surfaces', () => {
 const scene = new THREE.Scene(), theme = WORLD_THEMES['christmas-carol'];
 const architecture = addThemeArchitecture(scene, theme);
 const chimneys = meshes(architecture.root).filter(mesh =>
  mesh.position.y === 11 && Math.abs(mesh.position.x) === 23 && mesh.scale.y === 2);
 assert.equal(chimneys.length, 10, 'fixture must cover both complete rows of street chimneys');
 const treatment = applyThemeSurfaces(scene, theme);
 for (const mesh of chimneys) {
  assert.ok(mesh.material instanceof THREE.MeshStandardMaterial);
  assert.match((mesh.material as THREE.MeshStandardMaterial).name, /\/ brick$/);
 }
 treatment.dispose(); architecture.dispose();
});
