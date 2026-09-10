import {CHARACTER_ACTIVITY_RADIUS} from './characterActivity';
import {stationPoint,distanceToSegment,type StationLayout} from './stationTransform';
import manifest from '@/assets/model-manifest.json';
import type { ZoneId } from '@/lib/world';

export type Setting = 'archive' | 'garden' | 'coast';
type Point = { x: number; z: number };
type Bounds = readonly [number, number, number, number];
export const SETTING_SPOTS: Record<ZoneId, Point> = {
  harbor: { x: -12, z: 5 }, market: { x: 12, z: 5 }, library: { x: 0, z: -12 },
};
// Only this authored registry can select model URLs; lesson text cannot add assets.
export const SETTING_ASSET_IDS = [
  'reading-table', 'scroll-rack', 'open-scroll', 'rolled-scroll', 'writing-tablet',
  'writing-desk', 'period-chair', 'quill-inkwell', 'open-letter', 'folded-letter',
  'garden-bench', 'garden-path', 'paneled-wall', 'austen-doorway', 'sash-window',
  'merchant-ship', 'coast-rocks', 'cave-module', 'sheep', 'amphora', 'storage-jar',
  'cargo-crate', 'rope-coil', 'tied-sack', 'woven-basket', 'ceramic-bowl',
] as const;
export type SettingAssetId = typeof SETTING_ASSET_IDS[number];
export const SETTING_ASSETS = Object.fromEntries(SETTING_ASSET_IDS.map(id => {
  const asset = manifest.assets.find(a => a.id === id && a.category === 'props');
  if (!asset || asset.url !== `/models/props/${id}.glb`) throw new Error(`Unregistered setting model: ${id}`);
  return [id, asset];
})) as Record<SettingAssetId, typeof manifest.assets[number]>;

export type SettingPlacement = {
  key: string; id: SettingAssetId; at: [number, number, number]; turn: number; scale: number;
  collision: 'solid' | 'none' | 'cave'; zone?: ZoneId;
};

export function settingPlacements(setting: Setting): SettingPlacement[] {
  const placements: SettingPlacement[] = [];
  function add(id: SettingAssetId, x: number, floor: number, z: number, options: Partial<Pick<SettingPlacement, 'turn' | 'scale' | 'collision' | 'zone'>> = {}) {
    const scale = options.scale ?? 1;
    placements.push({ key: `${id}-${placements.length}`, id, at: [x, floor - SETTING_ASSETS[id].bounds.min[1] * scale, z], turn: 0, scale, collision: 'solid', ...options });
  }
  for (const [zone, p] of Object.entries(SETTING_SPOTS) as [ZoneId, Point][]) {
    const place = (id: SettingAssetId, x: number, z: number, options: Partial<Pick<SettingPlacement, 'turn' | 'scale' | 'collision'>> = {}, floor = .22) => add(id, p.x + x, floor, p.z + z, { zone, ...options });
    if (setting === 'archive') {
      place('reading-table', 0, -1.1);
      place('scroll-rack', -1.7, -2.0, { turn: .12 });
      place('scroll-rack', 1.7, -2.0, { turn: -.12 });
      place('open-scroll', -.30, -1.1, { scale: .78, collision: 'none' }, 1.123);
      place('writing-tablet', .40, -1.08, { scale: .72, turn: -.15, collision: 'none' }, 1.123);
      place('rolled-scroll', 1.7, -2.0, { collision: 'none' }, 1.60);
      place('woven-basket', -.25, -2.08);
    } else if (setting === 'garden') {
      place('writing-desk', 0, -1.25);
      place('period-chair', 0, -.65, { turn: Math.PI });
      place('open-letter', -.18, -1.23, { turn: -.18, collision: 'none' }, 1.055);
      place('folded-letter', .30, -1.25, { turn: .1, collision: 'none' }, 1.055);
      place('quill-inkwell', .35, -1.43, { collision: 'none' }, 1.055);
      place('garden-bench', -2.15, -1.1, { turn: Math.PI / 2 });
      place('garden-bench', 2.15, -1.1, { turn: -Math.PI / 2 });
      place('paneled-wall', -1.21, -2.82);
      place('paneled-wall', 1.21, -2.82);
      // Paving is walkable floor, not an invisible wall.
      place('garden-path', 0, 5.4, { collision: 'none' }, 0);
    } else {
      place('reading-table', -.15, -1.25);
      place('open-scroll', -.15, -1.25, { collision: 'none' }, 1.123);
      place('cargo-crate', -1.85, -1.65, { turn: .15 });
      place('rope-coil', -1.85, -1.65, { scale: .8, collision: 'none' }, 1.05);
      place('tied-sack', -1.85, -.50, { turn: -.3 });
      place('woven-basket', 1.8, -1.65);
      place('amphora', 1.85, -2.4);
      place('storage-jar', .75, -2.25);
      place('ceramic-bowl', -.95, -2.45, { scale: .8 });
    }
  }
  if (setting === 'coast') {
    // Hull bottoms sit below the water plane (-2.55); deck and rigging remain above it.
    add('merchant-ship', -31, -3.10, 5, { turn: -.5, scale: 1.5, collision: 'none' });
    add('merchant-ship', 29, -2.95, 16, { turn: .7, scale: 1.1, collision: 'none' });
    add('cave-module', 0, 0, 18, { collision: 'cave' });
    add('sheep', -3.4, 0, 17.5, { turn: .9 });
    add('sheep', 3.5, 0, 18.5, { turn: -.6 });
    add('sheep', 4.5, 0, 16.9, { turn: -1.2, scale: .8 });
    for (let i = 0; i < 12; i++) {
      const angle = i / 12 * Math.PI * 2 + .12;
      add('coast-rocks', Math.cos(angle) * 24.5, 0, Math.sin(angle) * 24.5, { turn: angle, scale: .9 + i % 3 * .25 });
    }
  }
  return placements;
}

/** Exact transformed inventory AABB; used for blockers and model-sized fallbacks. */
export function placementBounds(p: SettingPlacement): Bounds {
  const { min, max } = SETTING_ASSETS[p.id].bounds, c = Math.cos(p.turn), s = Math.sin(p.turn);
  const corners = [min[0], max[0]].flatMap(x => [min[2], max[2]].map(z => ({ x: p.at[0] + (x * c + z * s) * p.scale, z: p.at[2] + (-x * s + z * c) * p.scale })));
  return [Math.min(...corners.map(p => p.x)), Math.max(...corners.map(p => p.x)), Math.min(...corners.map(p => p.z)), Math.max(...corners.map(p => p.z))];
}

export function settingObstacles(placements: SettingPlacement[], legacyScenery = true): Bounds[] {
  const obstacles: Bounds[] = [];
  for (const p of placements) {
    if (p.collision === 'solid') obstacles.push(placementBounds(p));
    if (p.collision === 'cave') {
      // This authored, unrotated cave keeps a 1.7 m corridor. Side volumes include
      // the sloping roof at eye height and entrance stones; both ends stay open.
      const [x0, x1, z0, z1] = placementBounds(p);
      obstacles.push([x0, p.at[0] - .85, z0, z1], [p.at[0] + .85, x1, z0, z1]);
    }
  }
  if (legacyScenery) for (const p of Object.values(SETTING_SPOTS)) {
    for (const x of [-3, 3]) for (const z of [-2.5, 2.5]) obstacles.push([p.x + x - .23, p.x + x + .23, p.z + z - .23, p.z + z + .23]);
    obstacles.push([p.x + 1, p.x + 1.6, p.z + .2, p.z + .8]);
  }
  // The visible tree trunks around the island also stop the walking camera.
  for (let i = 0; legacyScenery && i < 22; i++) {
    const a = i / 22 * Math.PI * 2, x = Math.cos(a) * 23, z = Math.sin(a) * 23;
    obstacles.push([x - .22, x + .22, z - .22, z + .22]);
  }
  return obstacles;
}

export function createSettingNavigation(placements: SettingPlacement[], extraObstacles: readonly Bounds[] = [], layout?: StationLayout) {
  const spots = layout?.spots ?? SETTING_SPOTS;
  const obstacles = [...settingObstacles(placements, !layout), ...extraObstacles];
  if(layout)for(const zone of Object.keys(spots) as ZoneId[]){const p=stationPoint(layout,zone,1.3,.5);const clearance=.3+CHARACTER_ACTIVITY_RADIUS;obstacles.push([p.x-clearance,p.x+clearance,p.z-clearance,p.z+clearance]);}
  const paving = placements.filter(p => p.id === 'garden-path').map(placementBounds);
  const finite = (p: Point) => Number.isFinite(p.x) && Number.isFinite(p.z);
  function isWalkable(p: Point, radius = .28) {
    if (!finite(p) || !Number.isFinite(radius) || radius < 0 || Math.hypot(p.x, p.z) > 25 - radius) return false;
    return obstacles.every(([x0, x1, z0, z1]) => Math.hypot(Math.max(x0 - p.x, 0, p.x - x1), Math.max(z0 - p.z, 0, p.z - z1)) > radius);
  }
  function groundHeight(p: Point) {
    if(layout?.floor!==undefined){
      for(const route of layout.paths??[])for(let i=1;i<route.length;i++)if(distanceToSegment(p,route[i-1],route[i])<=.9)return .05;
      return layout.floor;
    }
    if (Object.values(spots).some(s => layout ? Math.abs(p.x-s.x)<=4 && Math.abs(p.z-s.z)<=3.5 : Math.hypot(p.x - s.x, p.z - s.z) <= 4)) return .22;
    if (paving.some(([x0, x1, z0, z1]) => p.x >= x0 && p.x <= x1 && p.z >= z0 && p.z <= z1)) return .09;
    if (!layout && Math.hypot(p.x, p.z) <= 5.5) return .095;
    for (const s of Object.values(spots)) {
      const length = Math.hypot(s.x, s.z), along = (p.x * s.x + p.z * s.z) / length, across = Math.abs(p.x * s.z - p.z * s.x) / length;
      if (along >= 0 && along <= length && across <= (layout ? .9 : 1)) return layout ? .05 : .07;
    }
    return 0;
  }
  function moveWalker(p: Point, d: Point): Point {
    let result = { ...p };
    if (!isWalkable(p) || !finite(d)) return result;
    const distance = Math.hypot(d.x, d.z);
    if (!distance || distance > 1000) return result;
    const steps = Math.ceil(distance / .10), dx = d.x / steps, dz = d.z / steps;
    for (let i = 0; i < steps; i++) {
      const both = { x: result.x + dx, z: result.z + dz };
      if (isWalkable(both)) { result = both; continue; }
      const x = { x: result.x + dx, z: result.z }; if (isWalkable(x)) result = x;
      const z = { x: result.x, z: result.z + dz }; if (isWalkable(z)) result = z;
    }
    return result;
  }
  return { groundHeight, moveWalker, isWalkable, approach: layout?Object.fromEntries(Object.keys(spots).map(zone=>[zone,stationPoint(layout,zone as ZoneId,1.3,2)])) as Record<ZoneId,Point>:spots,
    facing:layout?Object.fromEntries(Object.keys(spots).map(zone=>[zone,layout.turns?.[zone as ZoneId]??0])) as Record<ZoneId,number>:undefined,
    spawns: layout ? Object.fromEntries(Object.keys(spots).map(id=>[id,stationPoint(layout,id as ZoneId,1.3,3.8)])) as Record<ZoneId,Point> : { harbor: { x: -12, z: 9 }, market: { x: 12, z: 9 }, library: { x: 0, z: -7 } } };
}
