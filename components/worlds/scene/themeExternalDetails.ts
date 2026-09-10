import type {ExternalPlacement} from './externalLayout';
import type {WorldTheme} from '@/lib/worldThemes';
import type {ZoneId} from '@/lib/world';

// Measured usable surfaces, before placement scale; rims/canopies are excluded.
const TOPS:Record<string,number>={
 'quaternius-fantasy-props-table-large':.62826,
 'quaternius-fantasy-props-cabinet':1.09861,
 'quaternius-fantasy-props-workbench-drawers':1.14553,
 'quaternius-fantasy-props-workbench':.876,
 'quaternius-fantasy-props-crate-wooden':.704,
 'polyhaven-wooden_table_02':1.55057,
};
type Detail={name:string;x:number;z?:number;scale?:number;turn?:number;key?:string};
type Display={support:string;zone:ZoneId;items:Detail[]};
const DISPLAYS:Record<string,Display[]>={
 'odyssey-ix':[{support:'coastal-workbench',zone:'harbor',items:[{name:'rope-2',x:.4,scale:.6}]}],
 'austen-letter':[{support:'garden-tea-table',zone:'market',items:[{name:'mug',key:'second-mug',x:.54,z:.4,turn:Math.PI}]}],
 macbeth:[{support:'ruin-crate',zone:'harbor',items:[{name:'candlestick',x:0,scale:.8}]}],
 frankenstein:[{support:'study-cabinet',zone:'library',items:[{name:'book-stack-1',x:-.45},{name:'book-5',x:.08},{name:'bookstand',x:.5}]}],
 'christmas-carol':[{support:'counting-house-cabinet',zone:'harbor',items:[{name:'mug',x:-.45},{name:'book-5',x:.08},{name:'candlestick',x:.5}]}],
 declaration:[
  {support:'assembly-table-left',zone:'library',items:[{name:'book-stack-1',x:-.45},{name:'book-5',x:.08},{name:'candlestick',x:.5}]},
  {support:'assembly-table-right',zone:'library',items:[{name:'book-stack-1',x:.45},{name:'book-5',x:-.08,turn:Math.PI},{name:'bookstand',x:-.5}]},
 ],
 'douglass-literacy':[{support:'courtyard-table',zone:'library',items:[{name:'book-5',x:-.4},{name:'book-stack-1',x:.15},{name:'candlestick',x:.65}]}],
 'seneca-falls':[{support:'meeting-desk',zone:'library',items:[{name:'book-5',x:-.45},{name:'book-stack-1',x:0},{name:'bookstand',x:.5}]}],
};

/** Compose reading objects relative to furniture after its theme translation. */
export function themeExternalDetails(theme:WorldTheme,placements:ExternalPlacement[]):ExternalPlacement[]{
 const result:ExternalPlacement[]=[];
 for(const display of DISPLAYS[theme.id]??[]){
  const base=placements.find(p=>p.key===display.support);
  if(!base||TOPS[base.asset]===undefined)throw new Error(`Missing reviewed reading support: ${theme.id}/${display.support}`);
  const scale=base.scale??1,turn=base.turn??0,c=Math.cos(turn),s=Math.sin(turn);
  for(const item of display.items){
   const z=item.z??0;
   result.push({key:`${base.key}-${item.key??item.name}`,asset:`quaternius-fantasy-props-${item.name}`,
    at:[base.at[0]+(item.x*c+z*s)*scale,base.at[1]+TOPS[base.asset]*scale+.003,base.at[2]+(-item.x*s+z*c)*scale],
    turn:turn+(item.turn??0),scale:item.scale??1,support:base.key,zone:display.zone,solid:false});
  }
 }
 return result;
}

/** A supporting display is a larger source target when its objects agree on a station. */
export function linkSupportStations(placements:ExternalPlacement[]):ExternalPlacement[]{
 const zones=new Map<string,Set<ZoneId>>();
 for(const p of placements)if(p.support&&p.zone){const values=zones.get(p.support)??new Set<ZoneId>();values.add(p.zone);zones.set(p.support,values);}
 return placements.map(p=>{const values=zones.get(p.key);return !p.zone&&values?.size===1?{...p,zone:[...values][0]}:p;});
}
