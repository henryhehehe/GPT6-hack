import type {ExternalPlacement} from './externalLayout';
import type {WorldTheme} from '@/lib/worldThemes';

// Measured usable top surfaces of the normalized GLBs, before placement scale.
const TOPS:Record<string,number>={
 'quaternius-fantasy-props-table-large':.62826,
 'quaternius-fantasy-props-cabinet':1.09861,
 'quaternius-fantasy-props-workbench-drawers':1.14553,
};

/** Add small reading objects to existing furniture after theme translation. */
export function themeExternalDetails(theme:WorldTheme,placements:ExternalPlacement[]):ExternalPlacement[]{
 const supports:Record<string,string[]>={
  frankenstein:['study-cabinet'],
  'christmas-carol':['counting-house-cabinet'],
  declaration:['assembly-table-left','assembly-table-right'],
  'douglass-literacy':['courtyard-table'],
  'seneca-falls':['meeting-desk'],
 };
 const result:ExternalPlacement[]=[];
 for(const key of supports[theme.id]??[]){
  const base=placements.find(p=>p.key===key);
  if(!base||TOPS[base.asset]===undefined)throw new Error(`Missing reviewed reading support: ${theme.id}/${key}`);
  const scale=base.scale??1,turn=base.turn??0,c=Math.cos(turn),s=Math.sin(turn);
  for(const [name,x,z] of [['book-stack-1',-.45,0],['book-5',.08,0],['candlestick',.5,0]] as const){
   result.push({key:`${key}-${name}`,asset:`quaternius-fantasy-props-${name}`,
    at:[base.at[0]+(x*c+z*s)*scale,base.at[1]+TOPS[base.asset]*scale+.003,base.at[2]+(-x*s+z*c)*scale],
    turn,scale:1,support:key,zone:theme.id==='christmas-carol'?'harbor':'library',solid:false});
  }
 }
 return result;
}
