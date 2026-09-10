import index from '@/lib/externalAssetIndex.json';
import type { ZoneId } from '@/lib/world';

export type ExternalSetting = 'alexandria' | 'coast' | 'garden' | 'archive';
export type ExternalPlacement = {
  key: string; asset: string; at: [number, number, number]; turn?: number;
  zone?: ZoneId; activity?: 'harbor' | 'market'; solid?: boolean;
};
export type ExternalBounds = readonly [number, number, number, number];
const prop = (name: string) => `quaternius-fantasy-props-${name}`;
const kenney = (name: string) => `kenney-pirate-kit-${name}`;
const ph = (name: string) => `polyhaven-${name}`;
const assets = new Map(index.map(a => [a.id, a]));

/** Conservative rotated footprint; static published models are centered and grounded. */
export function placementBounds(p: ExternalPlacement): ExternalBounds {
  const asset = assets.get(p.asset);
  if (!asset) throw new Error(`Unregistered external asset: ${p.asset}`);
  const [width,,depth] = asset.dimensions;
  const c = Math.abs(Math.cos(p.turn ?? 0)), s = Math.abs(Math.sin(p.turn ?? 0));
  const x = (width*c+depth*s)/2, z = (width*s+depth*c)/2;
  return [p.at[0]-x,p.at[0]+x,p.at[2]-z,p.at[2]+z];
}

/** Keep original landmarks/cast; these objects sit on existing blocked furniture or quay edges. */
export const ALEXANDRIA_EXTERNAL: ExternalPlacement[] = [
  { key:'archive-scroll',asset:prop('scroll-1'),at:[-4.65,5.1,-8.45],zone:'library',turn:.12 },
  { key:'archive-pouch',asset:prop('pouch-large'),at:[-4.15,5.1,-8.55],zone:'library' },
  { key:'market-vessel',asset:prop('vase-2'),at:[14.65,2.01,5.55],zone:'market' },
  { key:'market-vessel-tall',asset:prop('vase-4'),at:[22.65,2.01,5.55],zone:'market' },
  { key:'market-bag',asset:prop('bag'),at:[14.65,1.32,4.35],activity:'market' },
  { key:'quay-rope',asset:prop('rope-2'),at:[-5.05,1.28,20],zone:'harbor' },
  { key:'quay-paddle',asset:kenney('tool-paddle'),at:[-10.9,1.28,21.9],turn:Math.PI/2,zone:'harbor' },
];

export const GENERATED_STATIONS: Record<ZoneId,{x:number;z:number}> = {
  harbor:{x:-12,z:5},market:{x:12,z:5},library:{x:0,z:-12},
};

/** Supplemental dressing around the authored setting furniture and evidence stations. */
export function externalPlacements(setting: ExternalSetting): ExternalPlacement[] {
  if (setting === 'alexandria') return ALEXANDRIA_EXTERNAL;
  const result: ExternalPlacement[] = [];
  for (const [zone, spot] of Object.entries(GENERATED_STATIONS) as [ZoneId,{x:number;z:number}][]) {
    const add = (name:string,asset:string,x:number,y:number,z:number,solid=false,turn=0) =>
      result.push({key:`${zone}-${name}`,asset,at:[spot.x+x,y,spot.z+z],zone,solid,turn});
    if (setting === 'archive') {
      add('candle',prop('candle-1'),.63,1.125,-1.45);
      add('vessel',prop(zone==='library'?'vase-4':'vase-2'),2.3,.22,-1.1,true);
    } else if (setting === 'garden') {
      // The usable inset desktop is .849 above its origin (the .955 bound includes its gallery).
      add('candle',prop('candle-1'),-.48,1.055,-1.5);
      add('planter',ph('planter_pot_clay'),2.15,.22,-2.2,true);
      add('basket',ph('wicker_basket_02'),-2.15,.22,-2.2,true);
    } else {
      add('vessel',prop(zone==='market'?'vase-4':'vase-2'),2.65,.22,.9,true);
      add('pouch',prop('pouch-large'),-.65,1.125,-1.4);
      add('bucket',prop('bucket-wooden-1'),2.05,.22,-.3,true);
    }
  }
  if (setting === 'coast') result.push(
    // Offshore additions keep the authored cave, sheep and shoreline route clear.
    {key:'shore-rock-scan',asset:ph('coast_rocks_01'),at:[-32,-2.7,-14],turn:.4},
    {key:'shore-rocks-b',asset:kenney('rocks-b'),at:[30,-2.65,-13],turn:.8},
    {key:'shore-rocks-c',asset:kenney('rocks-c'),at:[-12,-2.65,-31]},
    {key:'shore-rowboat',asset:kenney('boat-row-small'),at:[-23,-2.75,24],turn:.6},
    {key:'shore-rowboat-large',asset:kenney('boat-row-large'),at:[24,-2.75,25],turn:-.4},
  );
  if (setting === 'garden') result.push(
    {key:'garden-produce',asset:prop('farmcrate-apple'),at:[16,0,5],solid:true,zone:'market'},
  );
  return result;
}
