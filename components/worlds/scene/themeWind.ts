import type {WorldTheme} from '@/lib/worldThemes';

export type ThemeWind={strength:number;directionX:number;directionZ:number;phase:number};
const strengths:Record<string,number>={alexandria:.42,'odyssey-ix':.6,'austen-letter':.28,macbeth:.76,frankenstein:.07,'christmas-carol':.4,tempest:1,declaration:.1,'douglass-literacy':.24,'seneca-falls':.08};
/** Art-directed weather, not a reconstruction of weather on a historical date. */
export function themeWind(theme:Pick<WorldTheme,'id'>):ThemeWind{
 let seed=91;for(const c of theme.id)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
 const angle=(seed%6283)/1000;
 return {strength:Object.hasOwn(strengths,theme.id)?strengths[theme.id]:.25,directionX:Math.cos(angle),directionZ:Math.sin(angle),phase:((seed>>>8)%6283)/1000};
}
/** Shared slow gust envelopes keep foliage, grass and airborne particles in the same weather. */
export function windGust(wind:ThemeWind,time:number){
 const t=Number.isFinite(time)?time:0;
 return wind.strength*(.62+.23*Math.sin(t*.43+wind.phase)+.15*Math.sin(t*.79+wind.phase*1.7));
}
/** Bounded lateral displacement avoids accumulated drift and is stable when seeking the scene clock. */
export function windDisplacement(wind:ThemeWind,time:number){
 const t=Number.isFinite(time)?time:0;
 return wind.strength*(Math.sin(t*.43+wind.phase)*.8+Math.sin(t*.79+wind.phase*1.7)*.25);
}
