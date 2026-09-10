import { HUMAN_SCALE } from './humanScale';
// Authored counter planks top out at .99 m before the furniture height scale.
const CRAFT_COUNTER_Y = 1 + .99 * HUMAN_SCALE.marketVertical;
/** Authored scene coordinates. Decorations never add historical source IDs. */
export const ALEXANDRIA_DETAIL_IDS = [
  'cargo-handcart', 'fishing-net-rack', 'stone-anchor', 'harbor-capstan', 'fish-tray',
  'scroll-case', 'open-papyrus', 'wax-diptych', 'seven-string-lyre', 'armillary-model',
  'courtyard-sundial', 'courtyard-well', 'rotary-quern', 'bread-board', 'pouring-jug',
  'weighted-loom', 'reed-screen', 'stone-planter', 'craft-tool-rack', 'mosaic-pavement',
  'scribe-tray', 'pigment-mortar', 'spindle-basket', 'folded-linen', 'oil-flask-stand', 'joiner-chest',
] as const;
type DetailId = typeof ALEXANDRIA_DETAIL_IDS[number];
export type DetailPlacement = {
  id: DetailId; at: [number, number, number]; scale?: number; turn?: number;
  activity?: 'harbor' | 'market';
};
export const ALEXANDRIA_DETAIL_PLACEMENTS: DetailPlacement[] = [
  { id: 'cargo-handcart', at: [-21, 1, 4.7] },
  { id: 'fishing-net-rack', at: [-25.5, 1, 10] },
  { id: 'stone-anchor', at: [-24.7, 1, 10.15], scale: .8 },
  { id: 'harbor-capstan', at: [-20, 1, 20.8] },
  { id: 'fish-tray', at: [-21, 1.72, 4.1], scale: .7, activity: 'harbor' },
  { id: 'bread-board', at: [-21, 1.72, 4.92], scale: .7, activity: 'harbor' },
  { id: 'scroll-case', at: [-7.8, 4, -9.55] },
  { id: 'open-papyrus', at: [-12, 1.71, -.3], scale: .55 },
  { id: 'wax-diptych', at: [-6, 1.71, .3], scale: .7 },
  { id: 'seven-string-lyre', at: [7.3, 4, -8] },
  { id: 'armillary-model', at: [6.5, 6.45, -9.55], scale: .8 },
  { id: 'courtyard-sundial', at: [9.5, 4, -8.4] },
  { id: 'courtyard-well', at: [27.3, 1, 5] },
  { id: 'rotary-quern', at: [14.2, 1.32, 15], scale: .7, activity: 'market' },
  { id: 'pouring-jug', at: [12, 1.32, 15], scale: .7, activity: 'market' },
  { id: 'weighted-loom', at: [25.3, 1, 10] },
  { id: 'reed-screen', at: [27.5, 1, 10] },
  { id: 'craft-tool-rack', at: [27.5, 1, 10.4] },
  { id: 'stone-planter', at: [-9.5, 4, -6.3] },
  { id: 'stone-planter', at: [9.5, 4, -6.3] },
  { id: 'mosaic-pavement', at: [-9, .91, 0], scale: 1.8 },
  { id: 'scribe-tray', at: [-6.5, 6.445, -9.55] },
  { id: 'pigment-mortar', at: [20.05, CRAFT_COUNTER_Y, 5.75], activity: 'market' },
  { id: 'spindle-basket', at: [25.3, 1, 10.48] },
  { id: 'folded-linen', at: [10.9, CRAFT_COUNTER_Y, 10.75], scale: .7, activity: 'market' },
  { id: 'oil-flask-stand', at: [15.1, CRAFT_COUNTER_Y, 5.75], scale: .8, activity: 'market' },
  { id: 'joiner-chest', at: [26.5, 1, 10.45], scale: .7 },
];

// Combined conservative footprints for the five new ground-level clusters.
// Small props live on existing blocked furniture or inside these footprints.
export const ALEXANDRIA_DETAIL_OBSTACLES = [
  { id: 'handcart', bounds: [-22.02, -19.98, 3.52, 6.83], height: .85 },
  { id: 'net-rack', bounds: [-26.87, -24.13, 9.5, 10.5], height: 1.8 },
  { id: 'capstan', bounds: [-20.91, -19.09, 19.89, 21.71], height: .9 },
  { id: 'well', bounds: [26.12, 28.65, 4.14, 5.86], height: .8 },
  { id: 'weaving', bounds: [24.25, 28.26, 9.25, 10.75], height: 1.55 },
] as const;
