import type {ZoneId} from '@/lib/world';
import type {WorldTheme} from '@/lib/worldThemes';
import {SETTING_SPOTS} from './settingLayout';

type Point = {x:number;z:number};
export type ThemeLayout = {
  kind:'harbor'|'cove'|'garden'|'ruin'|'study'|'street'|'island'|'assembly'|'courtyard'|'meeting';
  spots:Record<ZoneId,Point>;
  camera:[number,number,number];
};
const layout=(kind:ThemeLayout['kind'],positions:[number,number][],camera:ThemeLayout['camera']):ThemeLayout=>({
  kind,camera,spots:Object.fromEntries(['harbor','market','library'].map((zone,i)=>[zone,{x:positions[i][0],z:positions[i][1]}])) as ThemeLayout['spots'],
});

// Each work has its own spatial composition. The three evidence roles remain stable.
export const THEME_LAYOUTS:Record<string,ThemeLayout>={
  alexandria:layout('harbor',[[-12,5],[12,5],[0,-12]],[34,31,43]),
  'odyssey-ix':layout('cove',[[-12,2],[9,7],[0,-11]],[36,33,39]),
  'austen-letter':layout('garden',[[-11,7],[11,-2],[-7,-11]],[32,36,39]),
  macbeth:layout('ruin',[[-12,5],[11,2],[0,-12]],[37,30,39]),
  frankenstein:layout('study',[[-10,3],[10,3],[0,-10]],[31,36,40]),
  'christmas-carol':layout('street',[[-10,9],[10,0],[-10,-10]],[33,38,40]),
  tempest:layout('island',[[-11,6],[12,0],[1,-12]],[36,34,40]),
  declaration:layout('assembly',[[-10,2],[10,2],[0,-11]],[30,39,41]),
  'douglass-literacy':layout('courtyard',[[-11,7],[11,4],[0,-11]],[34,35,40]),
  'seneca-falls':layout('meeting',[[-10,7],[10,7],[0,-10]],[32,39,42]),
};
export function themeLayout(theme:WorldTheme):ThemeLayout{
  return THEME_LAYOUTS[theme.id]??{kind:theme.furniture==='coast'?'cove':theme.furniture==='garden'?'garden':'assembly',spots:SETTING_SPOTS,camera:[34,31,43]};
}
