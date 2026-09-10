import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SETTING_ASSETS, type SettingPlacement, type SettingAssetId } from './settingLayout';

type Load = (url: string) => Promise<{ scene: THREE.Group }>;

/** Load only the selected setting. Repeated objects share geometry and materials. */
export function loadSettingAssets(parent: THREE.Object3D, placements: SettingPlacement[], load?: Load) {
  const loader = new GLTFLoader();
  const fetchModel = load ?? (url => loader.loadAsync(url));
  const root = new THREE.Group(); root.name = 'AuthoredSettingModels'; parent.add(root);
  const sources = new Set<THREE.Group>();
  const fallbackMaterial = new THREE.MeshStandardMaterial({ color: '#b49d7b', roughness: .9 });
  const fallbacks = new Map<string, THREE.Group>();
  const status = new Map<SettingAssetId, 'loading' | 'ready' | 'failed'>();
  let disposed = false;
  const sourceObjects = new Set<SettingAssetId>(['open-scroll', 'rolled-scroll', 'writing-tablet', 'open-letter', 'folded-letter']);

  function disposeGeometry(group: THREE.Object3D) {
    group.traverse(o => { if (o instanceof THREE.Mesh) o.geometry.dispose(); });
  }
  function disposeSource(source: THREE.Group) {
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    source.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return;
      geometries.add(o.geometry);
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
    });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
  }
  function transform(group: THREE.Group, p: SettingPlacement) {
    group.position.set(...p.at); group.rotation.y = p.turn; group.scale.setScalar(p.scale);
    // A blank model is a station entry point; the selected lesson owns its evidence.
    // Never embed quotations or infer a different source from the shared GLB.
    if (p.zone && sourceObjects.has(p.id)) group.userData.sourceStation = p.zone;
  }
  for (const p of placements) {
    const fallback = new THREE.Group(); fallback.name = `fallback:${p.key}`;
    const { min, max } = SETTING_ASSETS[p.id].bounds;
    const box = (x: number, y: number, z: number, w: number, h: number, d: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fallbackMaterial);
      mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; fallback.add(mesh);
    };
    if (p.collision === 'cave') {
      const z = (min[2] + max[2]) / 2;
      box((min[0] - .85) / 2, 1, z, -.85 - min[0], 2, max[2] - min[2]);
      box((max[0] + .85) / 2, 1, z, max[0] - .85, 2, max[2] - min[2]);
      box(0, 2.15, z, max[0] - min[0], .3, max[2] - min[2]);
    } else if (p.id === 'merchant-ship') {
      box(0, .45, 0, 1.5, .7, 5);
      box(0, 2.35, 0, .10, 3.5, .10);
      box(0, 2.8, -.1, 2.6, 1.9, .025);
    } else {
      box((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2,
        max[0] - min[0], Math.max(.01, max[1] - min[1]), max[2] - min[2]);
    }
    transform(fallback, p); root.add(fallback); fallbacks.set(p.key, fallback);
  }
  const ids = [...new Set(placements.map(p => p.id))];
  ids.forEach(id => status.set(id, 'loading'));
  let next = 0;
  async function worker() {
    while (!disposed && next < ids.length) {
      const id = ids[next++];
      let source: THREE.Group | undefined;
      try {
        const asset = SETTING_ASSETS[id];
        source = (await fetchModel(`${asset.url}?v=${asset.sha256.slice(0, 12)}`)).scene;
        if (disposed) { disposeSource(source); return; }
        let meshes = 0;
        source.traverse(o => { if (o instanceof THREE.Mesh) { meshes++; o.castShadow = true; o.receiveShadow = true; } });
        if (!meshes) throw new Error(`Empty setting model: ${id}`);
        // Prepare every clone before replacing any of this asset's visible fallbacks.
        const replacements = placements.filter(p => p.id === id).map(p => {
          const object = new THREE.Group(); object.name = p.key;
          object.userData.interpretiveScenery = true;
          object.add(source!.clone(true)); transform(object, p);
          return { p, object };
        });
        sources.add(source);
        for (const { p, object } of replacements) {
          root.add(object);
          const fallback = fallbacks.get(p.key)!;
          root.remove(fallback); disposeGeometry(fallback); fallbacks.delete(p.key);
        }
        status.set(id, 'ready');
      } catch (error) {
        if (source) { sources.delete(source); disposeSource(source); }
        status.set(id, 'failed');
        if (!disposed) console.warn(`Setting model ${id} unavailable; retaining its fallback.`, error);
      }
    }
  }
  const ready = Promise.all(Array.from({ length: Math.min(4, ids.length) }, () => worker())).then(() => status);
  return {
    root, ready, status,
    dispose() {
      if (disposed) return;
      disposed = true; parent.remove(root); root.clear();
      sources.forEach(disposeSource); sources.clear();
      fallbacks.forEach(disposeGeometry); fallbacks.clear(); fallbackMaterial.dispose();
    },
  };
}
