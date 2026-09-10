import * as THREE from 'three';

type Coordinates = [number, number, number];
type Orbit = { target: THREE.Vector3; update(): unknown; enableDamping: boolean };

const DURATION = 1.1;

/** A render-loop driven camera move. update returns whether it applied a pose. */
export function createCameraMotion(camera: THREE.PerspectiveCamera, orbit: Orbit) {
  const fromPosition = new THREE.Vector3();
  const fromTarget = new THREE.Vector3();
  const toPosition = new THREE.Vector3();
  const toTarget = new THREE.Vector3();
  let moving = false;
  let elapsed = 0;
  let previousDamping = orbit.enableDamping;

  function cancel() {
    if (!moving) return;
    moving = false;
    orbit.enableDamping = previousDamping;
  }

  function apply(progress: number) {
    // Smoothstep gives zero velocity at either end without frame-rate dependence.
    const eased = progress * progress * (3 - 2 * progress);
    camera.position.lerpVectors(fromPosition, toPosition, eased);
    orbit.target.lerpVectors(fromTarget, toTarget, eased);
    orbit.update();
    // Keep the requested pose exact, even if controls apply their own limits.
    camera.position.lerpVectors(fromPosition, toPosition, eased);
    orbit.target.lerpVectors(fromTarget, toTarget, eased);
    camera.lookAt(orbit.target);
    if (progress === 1) cancel();
  }

  return {
    go(position: Coordinates, target: Coordinates, reduced: boolean) {
      if (![...position, ...target].every(Number.isFinite)) return;
      if (!camera.position.toArray().every(Number.isFinite) || !orbit.target.toArray().every(Number.isFinite)) return;
      fromPosition.copy(camera.position);
      fromTarget.copy(orbit.target);
      toPosition.fromArray(position);
      toTarget.fromArray(target);
      elapsed = 0;
      if (!moving) {
        previousDamping = orbit.enableDamping;
        orbit.enableDamping = false;
        // Drain pending orbit inertia before moving, then restore the starting pose.
        orbit.update();
      }
      moving = true;
      apply(reduced ? 1 : 0);
    },
    update(dt: number, reduced: boolean): boolean {
      if (!moving) return false;
      if (reduced) {
        apply(1);
        return true;
      }
      if (!Number.isFinite(dt) || dt <= 0) return false;
      elapsed = Math.min(DURATION, elapsed + Math.min(dt, .1));
      // Accommodate roundoff when eleven 100ms steps reach 1.1 seconds.
      apply(elapsed >= DURATION - 1e-12 ? 1 : elapsed / DURATION);
      return true;
    },
    cancel,
    get active() { return moving; },
  };
}
