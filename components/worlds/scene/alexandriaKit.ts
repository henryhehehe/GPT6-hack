import * as THREE from 'three';
import {HUMAN_SCALE,MARKET_COUNTER_Y,LIBRARY_DESK_Y} from './humanScale';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const ALEXANDRIA_ASSET_IDS = [
  'merchant-ship', 'fishing-skiff', 'market-canopy', 'amphora', 'hydria', 'krater',
  'pottery-display', 'produce-display', 'textile-display', 'cargo-crate', 'rope-coil',
  'grain-sack', 'woven-basket', 'scroll-rack', 'writing-desk', 'wooden-stool',
  'oil-lamp', 'balance-scale', 'bronze-brazier', 'courtyard-fountain', 'marble-bench',
  'date-palm', 'cypress-tree', 'harbor-warehouse', 'courtyard-house', 'workshop-house',
  'mooring-bollard', 'quay-steps',
] as const;
type AssetId = typeof ALEXANDRIA_ASSET_IDS[number];
type Placement = { id: AssetId; at: [number, number, number]; scale?: number | [number, number, number]; turn?: number };

// Large additions have matching conservative footprints in walkGeometry.ts.
// Portico furniture stays within the library's existing blocked footprint.
export const ALEXANDRIA_STATIC_PLACEMENTS: Placement[] = [
  { id: 'courtyard-fountain', at: [-9, .96, 0] },
  { id: 'marble-bench', at: [-12, .96, 0], scale:[1,HUMAN_SCALE.benchVertical,1], turn: Math.PI / 2 },
  { id: 'marble-bench', at: [-6, .96, 0], scale:[1,HUMAN_SCALE.benchVertical,1], turn: -Math.PI / 2 },
  { id: 'writing-desk', at: [-4.7, 4, -8.4], scale:[1,HUMAN_SCALE.deskVertical,1] },
  { id: 'wooden-stool', at: [-4.7, 4, -9.45], scale:[1,HUMAN_SCALE.stoolVertical,1] },
  { id: 'oil-lamp', at: [-5.4, LIBRARY_DESK_Y, -8.5] },
  { id: 'scroll-rack', at: [-6.5, 4, -9.55] },
  { id: 'scroll-rack', at: [6.5, 4, -9.55] },
  { id: 'bronze-brazier', at: [-4, 4, -6.2] },
  { id: 'bronze-brazier', at: [4, 4, -6.2] },
  { id: 'hydria', at: [-7.7, 4, -8.7], scale: .9 },
  { id: 'krater', at: [7.6, 4, -8.6], scale: .9 },
  { id: 'cypress-tree', at: [-14, 2.85, -17], scale: .8 },
  { id: 'cypress-tree', at: [14, 2.85, -17], scale: .8 },
  { id: 'cypress-tree', at: [-14, 2.85, -11], scale: .8 },
  { id: 'cypress-tree', at: [14, 2.85, -11], scale: .8 },
  { id: 'quay-steps', at: [-17, .96, 11.1] },
  // Mooring details sit along the edges, leaving the pier centerlines clear.
  ...[-12, -4, 5].flatMap(x => [16, 25].flatMap(z => [
    { id: 'mooring-bollard' as const, at: [x - 1.14, 1.28, z] as [number, number, number], scale: .7 },
    { id: 'rope-coil' as const, at: [x + 1.05, 1.28, z + .8] as [number, number, number], scale: .55 },
  ])),
];

type Fallbacks = {
  houses: THREE.Group[];
  palms: THREE.Group[];
  stalls: THREE.Group[];
  ships: THREE.Group[];
  goods: THREE.Object3D[];
  decor: THREE.Group[];
};

/** One bundled request; shared meshes and instanced static scenery. No remote assets. */
export function loadAlexandriaKit(parent: THREE.Object3D, fallback: Fallbacks) {
  let disposed = false, ready = false;
  let source: THREE.Group | undefined;
  const additions = new THREE.Group(); additions.name = 'AlexandriaOriginalScenery';
  const cargo: THREE.Object3D[] = [], merchandise: THREE.Object3D[] = [];
  const replacements: { target: THREE.Group; model: THREE.Object3D; hidden: THREE.Object3D[] }[] = [];
  const instanceMeshes: THREE.InstancedMesh[] = [];

  const loaded = new GLTFLoader().loadAsync('/models/alexandria/alexandria-kit.glb?v=2').then(gltf => {
    source = gltf.scene;
    if (disposed) { disposeSource(source); return; }
    const templates = new Map<AssetId, THREE.Object3D>();
    for (const id of ALEXANDRIA_ASSET_IDS) {
      const template = source.getObjectByName(id);
      if (!template) throw new Error(`Missing Alexandria asset: ${id}`);
      templates.set(id, template);
    }
    source.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true; object.receiveShadow = true;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        // Single-surface cloth and folded leaflets are deliberately two-sided.
        if (/linen|teal|green|leaflight/.test(material.name)) material.side = THREE.DoubleSide;
      }
    });
    const make = (id: AssetId) => templates.get(id)!.clone(true);
    const place = (p: Placement) => {
      const wrapper = new THREE.Group(); wrapper.add(make(p.id)); wrapper.position.set(...p.at);
      wrapper.rotation.y = p.turn ?? 0;
      if (typeof p.scale === 'number') wrapper.scale.setScalar(p.scale);
      else if (p.scale) wrapper.scale.set(...p.scale);
      return wrapper;
    };
    const replace = (target: THREE.Group, id: AssetId, scale?: [number, number, number]) => {
      const model = new THREE.Group(); model.add(make(id));
      if (scale) model.scale.set(...scale);
      const hidden = [...target.children];
      replacements.push({ target, model, hidden });
    };
    fallback.ships.forEach((ship, i) => replace(ship, i === 4 ? 'fishing-skiff' : 'merchant-ship'));
    fallback.houses.forEach((house, i) => replace(house,
      (['harbor-warehouse', 'courtyard-house', 'workshop-house', 'workshop-house'] as const)[i],
      i === 3 ? [.85, 1, 1.15] : undefined));
    fallback.palms.forEach(palm => replace(palm, 'date-palm'));
    fallback.stalls.forEach((stall, i) => {
      replace(stall, 'market-canopy', [1,HUMAN_SCALE.marketVertical,1]);
      const display = place({ id: (['pottery-display', 'produce-display', 'textile-display'] as const)[i % 3], at: [stall.position.x, MARKET_COUNTER_Y, stall.position.z] });
      merchandise.push(display); additions.add(display);
      if (i < 2) additions.add(place({ id: 'balance-scale', at: [stall.position.x + 1.75, MARKET_COUNTER_Y, stall.position.z + .5], scale: .65 }));
      additions.add(place({ id: 'woven-basket', at: [stall.position.x - 1.7, 1.32, stall.position.z], scale: .7 }));
    });
    for (let i = 0; i < 14; i++) {
      const stacked = i >= 12, slot = stacked ? (i - 12) * 3 : i;
      const id = (['cargo-crate', 'amphora', 'grain-sack'] as const)[i % 3];
      const model = place({ id, at: [-18 + slot % 3 * 1.3, stacked ? 2.01 : 1, 7 + Math.floor(slot / 3) * 1.1], scale: id === 'amphora' ? .78 : 1 });
      cargo.push(model); additions.add(model);
    }
    // One draw call per mesh/material across all copies of each static prop.
    const batches = new Map<THREE.BufferGeometry, { mesh: THREE.Mesh; matrices: THREE.Matrix4[] }>();
    for (const placement of ALEXANDRIA_STATIC_PLACEMENTS) {
      const object = place(placement); object.updateMatrixWorld(true);
      object.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        const batch = batches.get(child.geometry) ?? { mesh: child, matrices: [] as THREE.Matrix4[] };
        batch.matrices.push(child.matrixWorld.clone()); batches.set(child.geometry, batch);
      });
    }
    for (const { mesh, matrices } of batches.values()) {
      const instance = new THREE.InstancedMesh(mesh.geometry, mesh.material, matrices.length);
      instance.name = mesh.name; instance.castShadow = true; instance.receiveShadow = true;
      matrices.forEach((matrix, i) => instance.setMatrixAt(i, matrix));
      instance.instanceMatrix.needsUpdate = true; instance.computeBoundingSphere();
      instanceMeshes.push(instance); additions.add(instance);
    }
    // Commit only after the complete pack was validated and prepared.
    for (const { target, model, hidden } of replacements) {
      hidden.forEach(child => { child.visible = false; }); target.add(model);
    }
    fallback.goods.forEach(good => { good.visible = false; });
    fallback.decor.forEach(group => { group.visible = false; });
    parent.add(additions); ready = true;
  }).catch(error => {
    // Decorative failures must never interrupt a lesson or remove its fallbacks.
    if (source) disposeSource(source);
    instanceMeshes.forEach(mesh => mesh.dispose());
    if (!disposed) console.warn('Alexandria scenery unavailable; using the original scene.', error);
  });

  return {
    loaded,
    get ready() { return ready; },
    getPlantTemplate() { return ready ? source?.getObjectByName('date-palm') : undefined; },
    update(blend: number, harborActivity: number, marketActivity: number) {
      if (!ready) return;
      const apply = (objects: THREE.Object3D[], activity: number) => objects.forEach((object, i) => {
        object.visible = i / objects.length < 1 - blend * (1 - THREE.MathUtils.clamp(activity, 0, 1));
      });
      apply(cargo, harborActivity); apply(merchandise, marketActivity);
    },
    dispose() {
      disposed = true; parent.remove(additions);
      for (const { target, model, hidden } of replacements) {
        target.remove(model); hidden.forEach(child => { child.visible = true; });
      }
      fallback.decor.forEach(group => { group.visible = true; });
      instanceMeshes.forEach(mesh => mesh.dispose());
      if (ready && source) disposeSource(source);
    },
  };
}

function disposeSource(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
  root.traverse(object => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);
      (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
    }
  });
  geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
}
