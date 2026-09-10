/** Pure navigation geometry in the scene's Three.js X/Z coordinates. */
export type WalkPoint = { x: number; z: number };

export const WALK_SPAWNS = {
  harbor: { x: -14, z: 8 },
  market: { x: 8, z: 8 },
  library: { x: 0, z: -2 },
} as const satisfies Record<string, WalkPoint>;

// The shoreline and three joined piers form one polygon. Chamfered northeast
// corners stay inside the rendered island's curved edges. Piers require the
// short shore connectors rendered by WorldScene (the old meshes had a gap).
const shoreline: readonly WalkPoint[] = [
  [-28, -22], [25, -22], [30, -17], [30, 14], [24, 18],
  [8, 18], [8, 12], [6.5, 12], [6.5, 29.5], [3.5, 29.5],
  [3.5, 12], [-2.5, 12], [-2.5, 29.5], [-5.5, 29.5],
  [-5.5, 12], [-10.5, 12], [-10.5, 29.5], [-13.5, 29.5],
  [-13.5, 23], [-28, 23],
].map(([x, z]) => ({ x, z }));

type Bounds = readonly [minX: number, maxX: number, minZ: number, maxZ: number];
// Conservative footprints cover both the authored GLBs and fallback meshes.
const buildings: readonly Bounds[] = [
  [-13.5, 13.5, -20.1, -3.9], // Library: do not walk through its closed geometry.
  [-25.2, -16.8, -17.2, -8.8],
  [17.8, 26.2, -19.2, -8.8],
  [19.3, 26.7, -6.2, .2],
  [-26.2, -19.8, -6.7, .7],
  [-26.9, -21.1, 13.1, 18.9], // Authored lighthouse footprint.
  [-18.55, -14.85, 6.45, 11.95], // Harbor cargo stacks.
  ...Array.from({ length: 5 }, (_, i): Bounds => {
    const x = 13 + (i % 2) * 8, z = 5 + Math.floor(i / 2) * 5;
    return [x - 2.5, x + 2.5, z - 1.4, z + 1.4];
  }),
];

function finite(point: WalkPoint) {
  return Number.isFinite(point.x) && Number.isFinite(point.z);
}

function edgeDistanceSquared(p: WalkPoint, a: WalkPoint, b: WalkPoint) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz)));
  return (p.x - a.x - t * dx) ** 2 + (p.z - a.z - t * dz) ** 2;
}

export function isWalkable(point: WalkPoint, radius = .28): boolean {
  if (!finite(point) || !Number.isFinite(radius) || radius < 0) return false;
  let inside = false;
  for (let i = 0, j = shoreline.length - 1; i < shoreline.length; j = i++) {
    const a = shoreline[i], b = shoreline[j];
    if ((a.z > point.z) !== (b.z > point.z) && point.x < (b.x - a.x) * (point.z - a.z) / (b.z - a.z) + a.x) inside = !inside;
    if (edgeDistanceSquared(point, a, b) < radius ** 2) return false;
  }
  if (!inside) return false;
  return buildings.every(([minX, maxX, minZ, maxZ]) => {
    const dx = Math.max(minX - point.x, 0, point.x - maxX);
    const dz = Math.max(minZ - point.z, 0, point.z - maxZ);
    return dx * dx + dz * dz > radius ** 2;
  });
}

export function groundHeight(point: WalkPoint): number {
  // Smooth the six stair treads into a ramp, keeping the camera comfortable.
  if (Math.abs(point.x) <= 5.5 && point.z <= -.5 && point.z >= -3) {
    return .95 + (-.5 - point.z) / 2.5 * 1.9;
  }
  if (Math.abs(point.x) <= 14.5 && point.z <= -3 && point.z >= -21) return 2.85;
  if (point.z >= 12 && point.z <= 29.5 && [-12, -4, 5].some(x => Math.abs(point.x - x) <= 1.5)) return 1.28;
  return .95;
}

/** Resolve short steps independently, sliding along walls without tunneling. */
export function moveWalker(point: WalkPoint, delta: WalkPoint): WalkPoint {
  let result = { ...point };
  if (!isWalkable(point) || !finite(delta)) return result;
  const distance = Math.hypot(delta.x, delta.z);
  if (!distance) return result;
  // Reject unusable input instead of letting an accidental enormous delta hang
  // the render loop. Real movement is frame-clamped by the controller.
  if (distance > 1000) return result;
  const steps = Math.ceil(distance / .12);
  const dx = delta.x / steps, dz = delta.z / steps;
  const canStep = (candidate: WalkPoint) => isWalkable(candidate) && Math.abs(groundHeight(candidate) - groundHeight(result)) <= .4;
  for (let i = 0; i < steps; i++) {
    const both = { x: result.x + dx, z: result.z + dz };
    if (canStep(both)) { result = both; continue; }
    const alongX = { x: result.x + dx, z: result.z };
    if (canStep(alongX)) result = alongX;
    const alongZ = { x: result.x, z: result.z + dz };
    if (canStep(alongZ)) result = alongZ;
  }
  return result;
}
