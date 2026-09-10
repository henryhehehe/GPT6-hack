import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groundHeight, isWalkable, moveWalker, WALK_SPAWNS, type WalkPoint } from '../components/worlds/scene/walkGeometry';

function near(actual: WalkPoint, expected: WalkPoint) {
  assert.ok(Math.hypot(actual.x - expected.x, actual.z - expected.z) < .001, `${JSON.stringify(actual)} did not reach ${JSON.stringify(expected)}`);
}
function route(start: WalkPoint, waypoints: WalkPoint[]) {
  let current = start;
  for (const next of waypoints) {
    current = moveWalker(current, { x: next.x - current.x, z: next.z - current.z });
    near(current, next);
    assert.ok(isWalkable(current));
  }
  return current;
}

test('every zone has a safe spawn and pedestrian routes connect all three', () => {
  Object.values(WALK_SPAWNS).forEach(point => assert.ok(isWalkable(point)));
  route(WALK_SPAWNS.harbor, [WALK_SPAWNS.market, { x: 8, z: 0 }, { x: 0, z: 0 }, WALK_SPAWNS.library]);
});

test('each pier is reachable from shore with no water crossing', () => {
  for (const x of [-12, -4, 5]) {
    const end = route(WALK_SPAWNS.harbor, [{ x, z: 8 }, { x, z: 28 }]);
    assert.equal(groundHeight(end), 1.28);
  }
});

test('radius keeps the walker off shoreline and pier edges', () => {
  assert.equal(isWalkable({ x: -27.9, z: 0 }), false);
  assert.equal(isWalkable({ x: -27.6, z: 0 }), true);
  assert.equal(isWalkable({ x: -2.6, z: 25 }), false);
  assert.equal(isWalkable({ x: -2.9, z: 25 }), true);
  assert.equal(isWalkable({ x: -2.9, z: 25 }, .5), false);
  assert.equal(isWalkable({ x: 0, z: 20 }), false);
  const stopped = moveWalker({ x: -4, z: 28 }, { x: 0, z: 20 });
  assert.ok(stopped.z <= 29.22 && stopped.z > 29);
});

test('large movements cannot tunnel through houses, stalls, library, or cargo', () => {
  const cases: [WalkPoint, WalkPoint, (p: WalkPoint) => boolean][] = [
    [{ x: 23, z: 2 }, { x: 0, z: -35 }, p => p.z > .2],
    [{ x: 8, z: 5 }, { x: 22, z: 0 }, p => p.x < 10.5],
    [{ x: 0, z: 0 }, { x: 0, z: -40 }, p => p.z > -3.9],
    [{ x: -14, z: 8 }, { x: -12, z: 0 }, p => p.x > -14.85],
  ];
  for (const [start, delta, stopped] of cases) {
    const result = moveWalker(start, delta);
    assert.ok(isWalkable(result)); assert.ok(stopped(result));
  }
});

test('diagonal movement slides along a blocked wall', () => {
  const result = moveWalker({ x: 18.8, z: -4 }, { x: 2, z: 2 });
  assert.ok(result.x < 19.02);
  assert.ok(result.z > -2.01);
  assert.ok(isWalkable(result));
});

test('stairs connect street and terrace but the terrace sides cannot be climbed or dropped', () => {
  const landing = route({ x: 0, z: 0 }, [{ x: 0, z: -3.4 }]);
  assert.equal(groundHeight(landing), 2.85);
  route(landing, [{ x: 0, z: 0 }]);
  assert.equal(groundHeight({ x: 0, z: -.5 }), .95);
  assert.ok(Math.abs(groundHeight({ x: 0, z: -3 }) - 2.85) < 1e-9);
  assert.ok(moveWalker({ x: 10, z: 0 }, { x: 0, z: -4 }).z > -3);
  assert.ok(moveWalker({ x: 10, z: -3.4 }, { x: 0, z: 4 }).z < -3);
});

test('invalid input does not corrupt walker state', () => {
  const start = WALK_SPAWNS.market;
  near(moveWalker(start, { x: NaN, z: 0 }), start);
  near(moveWalker(start, { x: Infinity, z: 0 }), start);
  near(moveWalker(start, { x: 1e20, z: 0 }), start);
  near(moveWalker(start, { x: 0, z: 0 }), start);
  assert.equal(isWalkable({ x: NaN, z: 1 }), false);
  assert.equal(isWalkable(start, -.1), false);
});
