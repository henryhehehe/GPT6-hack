import * as THREE from 'three';
import type { ZoneId } from '@/lib/world';

export type SceneSelection = { action: 'talk' | 'evidence'; zone: ZoneId };
function isZone(value: unknown): value is ZoneId {
  return value === 'harbor' || value === 'market' || value === 'library';
}

/** Resolve the nearest visible surface, so walls and furniture occlude interactions. */
export function pickSceneSelection(ray: THREE.Raycaster, scene: THREE.Object3D): SceneSelection | null {
  const hit = ray.intersectObject(scene, true).find(({ object }) => {
    for (let parent: THREE.Object3D | null = object; parent; parent = parent.parent) if (!parent.visible) return false;
    return true;
  });
  for (let object: THREE.Object3D | null = hit?.object ?? null; object; object = object.parent) {
    const { npc, sourceStation, externalZone, zone } = object.userData;
    if (isZone(npc)) return { action: 'talk', zone: npc };
    for (const value of [sourceStation, externalZone, zone]) if (isZone(value)) return { action: 'evidence', zone: value };
  }
  return null;
}
