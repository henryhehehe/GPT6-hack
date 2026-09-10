import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCameraMotion } from '../components/worlds/scene/cameraMotion';

function fixture(damping = true) {
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 4, 12);
  const orbit = { target: new THREE.Vector3(), enableDamping: damping, update() {} };
  return { camera, orbit, motion: createCameraMotion(camera, orbit) };
}

test('camera transitions are time based and finish at the exact destination', () => {
  const slow = fixture(); const fast = fixture();
  for (const f of [slow, fast]) f.motion.go([10, 8, 20], [2, 3, 4], false);
  assert.equal(slow.orbit.enableDamping, false);
  for (let i = 0; i < 5; i++) slow.motion.update(.1, false);
  for (let i = 0; i < 10; i++) fast.motion.update(.05, false);
  assert.ok(slow.camera.position.distanceTo(fast.camera.position) < 1e-12);
  assert.ok(slow.orbit.target.distanceTo(fast.orbit.target) < 1e-12);
  assert.ok(slow.camera.position.x > 0 && slow.camera.position.x < 10);
  for (let i = 0; i < 6; i++) assert.equal(slow.motion.update(.1, false), true);
  assert.deepEqual(slow.camera.position.toArray(), [10, 8, 20]);
  assert.deepEqual(slow.orbit.target.toArray(), [2, 3, 4]);
  assert.equal(slow.motion.active, false);
  assert.equal(slow.orbit.enableDamping, true);
  assert.equal(slow.motion.update(.1, false), false);
});

test('cancel preserves the current pose and restores either original damping setting', () => {
  for (const damping of [true, false]) {
    const { camera, orbit, motion } = fixture(damping);
    motion.go([10, 8, 20], [2, 3, 4], false);
    motion.update(.1, false);
    const position = camera.position.clone(); const target = orbit.target.clone();
    motion.cancel(); motion.cancel();
    assert.equal(motion.active, false);
    assert.equal(orbit.enableDamping, damping);
    assert.equal(motion.update(.1, false), false);
    assert.ok(camera.position.equals(position));
    assert.ok(orbit.target.equals(target));
  }
});

test('reduced motion snaps both at the start and when enabled midflight', () => {
  for (const immediately of [true, false]) {
    const { camera, orbit, motion } = fixture();
    motion.go([10, 8, 20], [2, 3, 4], immediately);
    if (!immediately) {
      motion.update(.1, false);
      assert.equal(motion.update(Number.NaN, true), true);
    }
    assert.deepEqual(camera.position.toArray(), [10, 8, 20]);
    assert.deepEqual(orbit.target.toArray(), [2, 3, 4]);
    assert.equal(motion.active, false);
    assert.equal(orbit.enableDamping, true);
  }
});

test('retargeting starts at the current pose and retains the original damping value', () => {
  const { camera, orbit, motion } = fixture();
  motion.go([10, 8, 20], [2, 3, 4], false);
  for (let i = 0; i < 4; i++) motion.update(.1, false);
  const position = camera.position.clone(); const target = orbit.target.clone();
  motion.go([-10, 9, 10], [-2, 2, 1], false);
  assert.ok(camera.position.equals(position));
  assert.ok(orbit.target.equals(target));
  for (let i = 0; i < 11; i++) motion.update(.1, false);
  assert.deepEqual(camera.position.toArray(), [-10, 9, 10]);
  assert.deepEqual(orbit.target.toArray(), [-2, 2, 1]);
  assert.equal(orbit.enableDamping, true);
});

test('invalid inputs do not poison or interrupt a move and long frames are clamped', () => {
  const { camera, orbit, motion } = fixture();
  motion.go([Number.NaN, 1, 1], [0, 0, 0], false);
  assert.equal(motion.active, false);
  assert.equal(orbit.enableDamping, true);
  motion.go([10, 8, 20], [2, 3, 4], false);
  for (const dt of [NaN, Infinity, -Infinity, -1, 0]) {
    assert.equal(motion.update(dt, false), false);
    assert.deepEqual(camera.position.toArray(), [0, 4, 12]);
  }
  motion.go([1, 2, 3], [Infinity, 0, 0], false);
  motion.update(100, false);
  const reference = fixture();
  reference.motion.go([10, 8, 20], [2, 3, 4], false);
  reference.motion.update(.1, false);
  assert.ok(camera.position.equals(reference.camera.position));
  assert.equal(motion.active, true);
  assert.ok([...camera.position.toArray(), ...orbit.target.toArray(), ...camera.quaternion.toArray()].every(Number.isFinite));
});

test('starting a move drains existing orbit inertia without displacing its starting pose', () => {
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 4, 12);
  let pendingInertia = true;
  const orbit = {
    target: new THREE.Vector3(), enableDamping: true,
    update() {
      if (pendingInertia) {
        camera.position.x += 2;
        this.target.x += 1;
        if (!this.enableDamping) pendingInertia = false;
      }
    },
  };
  const motion = createCameraMotion(camera, orbit);
  motion.go([10, 8, 20], [2, 3, 4], false);
  assert.equal(pendingInertia, false);
  assert.deepEqual(camera.position.toArray(), [0, 4, 12]);
  assert.deepEqual(orbit.target.toArray(), [0, 0, 0]);
  motion.cancel();
  orbit.update();
  assert.deepEqual(camera.position.toArray(), [0, 4, 12]);
});
