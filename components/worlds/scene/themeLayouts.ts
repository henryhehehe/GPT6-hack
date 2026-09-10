import type {ZoneId} from '@/lib/world';
import type {WorldTheme} from '@/lib/worldThemes';
import {stationPoint,type StationLayout} from './stationTransform';

type Point = {x:number;z:number};
export type ThemeLayout = StationLayout & {
  kind:'harbor'|'cove'|'garden'|'ruin'|'study'|'street'|'island'|'assembly'|'courtyard'|'meeting';
  spots:Record<ZoneId,Point>;
  camera:[number,number,number];
};
const layout=(kind:ThemeLayout['kind'],positions:[number,number][],camera:ThemeLayout['camera'],angles=[0,0,0]):ThemeLayout=>{
 const zones=['harbor','market','library'] as const;
 const result:ThemeLayout={kind,camera,floor:kind==='street'||kind==='courtyard'?.05:kind==='ruin'?.06:0,
 spots:Object.fromEntries(zones.map((zone,i)=>[zone,{x:positions[i][0],z:positions[i][1]}])) as ThemeLayout['spots'],
 turns:Object.fromEntries(zones.map((zone,i)=>[zone,angles[i]]))};
 if(['cove','garden','island'].includes(kind))result.paths=[zones.map(zone=>stationPoint(result,zone,1.3,3.8))];
 else result.paths=[];
 return result;
};

// Reading groups follow a shoreline, garden walk, room edge, street frontage or meeting aisle.
// The source roles remain stable without three isolated stages around a central hub.
export const THEME_LAYOUTS:Record<string,ThemeLayout>={
  alexandria:layout('harbor',[[-12,5],[12,5],[0,-12]],[34,31,43]),
  'odyssey-ix':layout('cove',[[-11,9],[-5,1],[3,-8]],[30,26,35],[.5,.5,.2]),
  'austen-letter':layout('garden',[[-12,8],[-2,7],[9,3]],[28,26,34],[.15,-.2,.6]),
  macbeth:layout('ruin',[[-5,-5],[0,-5],[5,-5]],[30,24,34],[.5,0,-.5]),
  frankenstein:layout('study',[[-7,-3],[-7,-7],[1,-7]],[26,25,32],[Math.PI/2,Math.PI/2,0]),
  'christmas-carol':layout('street',[[-10,9],[-10,0],[-10,-10]],[25,26,35],[Math.PI/2,Math.PI/2,Math.PI/2]),
  tempest:layout('island',[[-10,10],[-1,6],[7,1]],[30,26,35],[.6,.3,-.2]),
  declaration:layout('assembly',[[-4,-2],[0,-2],[4,-2]],[26,28,35],[.3,0,-.3]),
  'douglass-literacy':layout('courtyard',[[-11,7],[-11,-3],[2,-8]],[27,26,34],[Math.PI/2,Math.PI/2,0]),
  'seneca-falls':layout('meeting',[[0,12],[0,3],[0,-7]],[27,29,37],[0,0,0]),
};
export function themeLayout(theme:WorldTheme):ThemeLayout{
  return Object.hasOwn(THEME_LAYOUTS,theme.id)?THEME_LAYOUTS[theme.id]:layout(theme.furniture==='coast'?'cove':theme.furniture==='garden'?'garden':'assembly',[[-9,6],[0,6],[9,6]],[30,28,38]);
}
