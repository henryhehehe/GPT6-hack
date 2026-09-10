import {WORLD_THEMES} from './worldThemes';
import {externalPlacements,type ExternalPlacement,type ExternalSetting} from '@/components/worlds/scene/externalLayout';
import {themedExternalPlacements} from '@/components/worlds/scene/themedSetting';

export type CatalogScene={id:string;label:string;kind:'world'|'template';base:ExternalSetting;lessonId?:string};
const titles:Record<string,string>={alexandria:'Alexandria','odyssey-ix':'The Odyssey','austen-letter':'Pride and Prejudice',macbeth:'Macbeth',frankenstein:'Frankenstein','christmas-carol':'A Christmas Carol',tempest:'The Tempest',declaration:'Declaration of Independence','douglass-literacy':'Douglass: literacy','seneca-falls':'Seneca Falls'};
export const catalogScenes:CatalogScene[]=[
 ...Object.values(WORLD_THEMES).map(theme=>({id:theme.id,label:titles[theme.id]??theme.place,kind:'world' as const,base:theme.id==='alexandria'?'alexandria' as const:theme.furniture,lessonId:`${theme.id}-01`})),
 ...(['coast','garden','archive'] as const).map(base=>({id:base,label:`${base[0].toUpperCase()+base.slice(1)} template`,kind:'template' as const,base})),
];
export const catalogSettings=catalogScenes.map(s=>s.id);
export type CatalogPlacement=ExternalPlacement&{setting:string};
export function scenePlacements(scene:CatalogScene):ExternalPlacement[]{
 return scene.kind==='template'||scene.id==='alexandria'?externalPlacements(scene.base):themedExternalPlacements(WORLD_THEMES[scene.id]);
}
export const catalogPlacements:CatalogPlacement[]=catalogScenes.flatMap(scene=>scenePlacements(scene).map(p=>({...p,setting:scene.id})));
export const catalogWorldPlacements=catalogPlacements.filter(p=>catalogScenes.some(s=>s.id===p.setting&&s.kind==='world'));
export const sceneLabel=(id:string)=>catalogScenes.find(s=>s.id===id)?.label??id;
export const sceneSource=(id:string)=>catalogScenes.find(s=>s.id===id)?.kind==='world'&&id!=='alexandria'?'themedSetting.ts / themeExternalDetails.ts':'externalLayout.ts';
