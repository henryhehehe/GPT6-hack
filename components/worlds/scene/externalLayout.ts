import index from '@/lib/externalAssetIndex.json';
import type { ZoneId } from '@/lib/world';

export type ExternalSetting = 'alexandria' | 'coast' | 'garden' | 'archive';
export type ExternalPlacement = {
  key: string; asset: string; at: [number, number, number]; turn?: number;
  scale?: number; support?: string; trunkRadius?: number; zone?: ZoneId; activity?: 'harbor' | 'market'; solid?: boolean;
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
  if(p.trunkRadius){const r=p.trunkRadius*(p.scale??1);return [p.at[0]-r,p.at[0]+r,p.at[2]-r,p.at[2]+r];}
  const [width,,depth] = asset.dimensions.map(n=>n*(p.scale??1));
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
  // Complete, bounded activity areas use the remaining eligible props. They sit
  // outside pavilion footprints and leave the central plaza and radial paths clear.
  const add=(key:string,asset:string,x:number,z:number,zone:ZoneId,y=0,solid=true,turn=0,scale=1,support?:string)=>
    result.push({key,asset,at:[x,y,z],zone,solid,turn,scale,support});
  if(setting==='archive') {
    add('reading-table',prop('table-large'),-7,-12,'library');
    add('reading-bookstand',prop('bookstand'),-7.65,-12.05,'library',.631,false,0,1,'reading-table');
    add('reading-book',prop('book-5'),-7.05,-12.05,'library',.631,false,0,1,'reading-table');
    add('reading-book-stack',prop('book-stack-1'),-6.45,-12.05,'library',.631,false,0,1,'reading-table');
    add('reading-candlestick',prop('candlestick'),-7.65,-11.77,'library',.631,false,0,1,'reading-table');
    add('reading-cabinet',prop('cabinet'),-7,-15,'library');
    add('reading-bookcase',prop('bookcase-2'),-5,-15,'library');
    add('reading-arch-shelf',prop('shelf-arch'),-9,-15,'library');
    add('reading-low-shelf',prop('shelf-simple'),-9,-13.5,'library');
    add('archive-comparison-desk',prop('workbench-drawers'),7,-12,'library');
    add('archive-comparison-scroll',prop('scroll-1'),6.7,-12,'library',1.149,false,0,1,'archive-comparison-desk');
    add('archive-comparison-chair',prop('chair-1'),7,-10.7,'library',0,true,Math.PI);
  }
  if(setting==='garden') {
    // Half scale gives this scan a 0.775 m tabletop and a 1.1 m width.
    add('garden-tea-table',ph('wooden_table_02'),6.5,12,'market',0,true,0,.5);
    add('garden-tea-mug',prop('mug'),6.77,11.85,'market',.778,false,0,1,'garden-tea-table');
    add('garden-tea-plate',prop('table-plate'),6.25,12.02,'market',.778,false,0,1,'garden-tea-table');
    add('garden-tea-chair',prop('chair-1'),6.5,13.15,'market',0,true,Math.PI);
    add('garden-reading-bench',prop('bench'),4.8,12.2,'market',0,true,Math.PI/2,1.3);
    add('garden-display-stall',prop('stall-empty'),18,4,'market');
    add('garden-display-cart',prop('stall-cart-empty'),18,8,'market');
    add('garden-empty-produce-box',prop('farmcrate-empty'),16,6.2,'market');
    add('garden-cooking-pot',prop('pot-1'),16.5,8,'market');
  }
  if(setting==='coast') {
    add('coastal-workbench',prop('workbench'),-18,5,'harbor');
    add('coastal-work-scroll',prop('scroll-2'),-18.45,5,'harbor',.879,false,0,1,'coastal-workbench');
    add('coastal-work-stool',prop('stool'),-18,6.25,'harbor');
    add('coastal-tall-barrel',prop('barrel'),-18,2,'harbor');
    add('coastal-wood-crate',prop('crate-wooden'),-19.4,2,'harbor');
    add('coastal-rope-coil',prop('rope-1'),-19.4,2,'harbor',.707,false,0,.65,'coastal-wood-crate');
    add('coastal-spare-rope',prop('rope-3'),-20,5,'harbor');
    add('coastal-small-barrel',kenney('barrel'),-16.5,2,'harbor');
    add('coastal-small-crate',kenney('crate'),-16.5,3.2,'harbor');
    result.push({key:'offshore-rocks-a',asset:kenney('rocks-a'),at:[16,-2.65,-28]},
      {key:'offshore-sand-bank',asset:kenney('rocks-sand-a'),at:[-28,-2.7,21]});
    // Replace the 22 procedural coast trees. Supplement the old trunk blockers
    // with a conservative low-trunk footprint, leaving the canopy walkable.
    for(let i=0;i<22;i++) {
      const a=i/22*Math.PI*2;
      result.push({key:`coastal-palm-${i}`,asset:kenney(i%2?'palm-detailed-bend':'palm-detailed-straight'),
        at:[Math.cos(a)*23,0,Math.sin(a)*23],turn:a,solid:true,trunkRadius:1.5});
    }
  }
  return result;
}
