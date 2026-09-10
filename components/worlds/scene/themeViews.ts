import type {WorldTheme} from '@/lib/worldThemes';
export type ScenicView={label:string;position:[number,number,number];target:[number,number,number]};
const view=(label:string,position:ScenicView['position'],target:ScenicView['target']):ScenicView=>({label,position,target});
/** Authored viewpoints reveal each setting's own composition; they do not move the walking avatar. */
const views:Record<string,ScenicView[]>={
 'odyssey-ix':[view('Across the cove',[29,14,35],[-3,1,5]),view('Cave & shore',[-16,11,30],[0,1,15])],
 'austen-letter':[view('Garden walk',[25,13,24],[-5,2,-6]),view('The estate',[7,14,18],[0,4,-22])],
 macbeth:[view('The threshold',[26,13,31],[0,3,-10]),view('Across the heath',[-30,17,21],[4,3,-16])],
 frankenstein:[view('Into the study',[24,14,24],[0,3,-9]),view('Books & lamplight',[-10,11,16],[0,3,-13])],
 'christmas-carol':[view('Winter street',[4,13,35],[0,2,-12]),view('The shopfronts',[-8,12,26],[17,4,0])],
 tempest:[view('Windward shore',[-32,13,27],[1,1,-5]),view('Rock shelves',[30,12,19],[-14,0,3])],
 declaration:[view('The document hall',[22,16,26],[0,2,-9]),view('Across the tables',[-15,12,17],[4,2,-7])],
 'douglass-literacy':[view('The courtyard',[-26,15,29],[2,2,-8]),view('Domestic windows',[14,12,18],[-4,3,-17])],
 'seneca-falls':[view('The central aisle',[1,14,28],[0,2,-12]),view('Across the meeting',[24,16,23],[-3,2,-7])],
};
export function themeViews(theme:WorldTheme):ScenicView[]{return views[theme.id]??[];}
