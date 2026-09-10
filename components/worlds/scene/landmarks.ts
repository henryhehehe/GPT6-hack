import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Load authored geometry without blocking the playable procedural fallback. */
export function loadLandmarks(
  parent: THREE.Object3D,
  libraryFallback: THREE.Object3D,
  lighthouseFallback: THREE.Object3D,
  onFailure: () => void,
) {
  let disposed = false;
  const roots: THREE.Object3D[] = [];
  const doors: { object: THREE.Object3D; angle: number; direction: number }[] = [];
  const loader = new GLTFLoader();

  async function load(url: string, position: [number, number, number], fallback: THREE.Object3D) {
    try {
      const { scene } = await loader.loadAsync(url);
      if (disposed) { disposeModel(scene); return; }
      scene.position.set(...position);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
        if (object.name === 'ArchiveDoorLeft' || object.name === 'ArchiveDoorRight') {
          doors.push({ object, angle: object.rotation.y, direction: object.name.endsWith('Left') ? -1 : 1 });
        }
      });
      parent.add(scene);
      roots.push(scene);
      fallback.visible = false;
    } catch {
      if (!disposed) onFailure();
    }
  }

  void load('/models/library.glb?v=1', [0, 2.9, -13], libraryFallback);
  void load('/models/lighthouse.glb?v=1', [-24, 1, 16], lighthouseFallback);

  return {
    update(unlocked: boolean, dt: number, reducedMotion: boolean) {
      for (const { object, angle, direction } of doors) {
        const target = angle + (unlocked ? direction * Math.PI * .44 : 0);
        object.rotation.y = reducedMotion ? target : THREE.MathUtils.damp(object.rotation.y, target, 4, dt);
      }
    },
    dispose() {
      disposed = true;
      for (const root of roots) { parent.remove(root); disposeModel(root); }
    },
  };
}

function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  geometries.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
  textures.forEach(value => value.dispose());
}
