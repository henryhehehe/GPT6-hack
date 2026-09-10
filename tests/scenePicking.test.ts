import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { pickSceneSelection } from '../components/worlds/scene/scenePicking';

function fixture() {
  const scene = new THREE.Group();
  const ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 5), new THREE.Vector3(0, 0, -1));
  function object(z: number, data: Record<string, unknown> = {}) {
    const group = new THREE.Group(); group.userData = data;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, .2), new THREE.MeshBasicMaterial());
    group.add(mesh); group.position.z = z; scene.add(group); scene.updateMatrixWorld(true);
    return group;
  }
  return { scene, ray, object };
}

test('nested model meshes open the assigned station, while characters retain conversation actions', () => {
  for (const [data, action, zone] of [
    [{ sourceStation: 'library' }, 'evidence', 'library'],
    [{ externalZone: 'market' }, 'evidence', 'market'],
    [{ zone: 'harbor' }, 'evidence', 'harbor'],
    [{ npc: 'library' }, 'talk', 'library'],
  ] as const) {
    const { scene, ray, object } = fixture(); object(0, data);
    assert.deepEqual(pickSceneSelection(ray, scene), { action, zone });
  }
});

test('solid scenery blocks evidence behind it; an invisible roof does not', () => {
  const { scene, ray, object } = fixture();
  object(0, { sourceStation: 'library' });
  const wall = object(2);
  assert.equal(pickSceneSelection(ray, scene), null);
  wall.visible = false;
  assert.deepEqual(pickSceneSelection(ray, scene), { action: 'evidence', zone: 'library' });
});

test('closest visible target wins and invalid zone metadata cannot select evidence', () => {
  const { scene, ray, object } = fixture();
  object(0, { npc: 'harbor' });
  const letter = object(2, { sourceStation: 'market' });
  assert.deepEqual(pickSceneSelection(ray, scene), { action: 'evidence', zone: 'market' });
  letter.userData.sourceStation = 'unregistered-source';
  assert.equal(pickSceneSelection(ray, scene), null);
});
