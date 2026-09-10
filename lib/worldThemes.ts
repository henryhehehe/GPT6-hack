import type {World} from './world';
export type WorldTheme={id:string;place:string;atmosphere:string;landscape:'shore'|'estate'|'highlands'|'town';furniture:'coast'|'garden'|'archive';sky:string;horizon:string;ground:string;stone:string;foliage:string;water:string;light:string;accent:string;building:string;roof:string;night:boolean;guides:[string,string,string];roles:[string,string,string]};
const base={sky:'#a5c9dc',horizon:'#e7ddd0',ground:'#718267',stone:'#d8c8ae',foliage:'#446c49',water:'#347d8c',light:'#ffe4bd',accent:'#c0924e',building:'#cdbfa8',roof:'#756756',night:false};
export const WORLD_THEMES:Record<string,WorldTheme>={
 'alexandria':{...base,id:'alexandria',place:'The scholarly waterfront',atmosphere:'Warm stone, busy water, a community of readers.',landscape:'shore',furniture:'archive',guides:['Dorian','Thaleia','Ione'],roles:['Harbor guide','Market guide','Archive guide']},
 'odyssey-ix':{...base,id:'odyssey-ix',place:'The Cyclops episode · Aegean shore',atmosphere:'A rocky landing, a sheltered cave, and the open sea.',landscape:'shore',furniture:'coast',sky:'#95c5d7',ground:'#b4ab86',guides:['Mara','Theo','Iris'],roles:['Shore reader','Cave observer','Voyage reader']},
 'austen-letter':{...base,id:'austen-letter',place:'Near Hunsford · a garden for reading',atmosphere:'A quiet lane, pale walls, and a letter worth reading twice.',landscape:'estate',furniture:'garden',sky:'#c6d8d5',ground:'#6d885c',guides:['Clara','Elias','Rose'],roles:['Letter reader','Evidence editor','Reading companion']},
 'macbeth':{...base,id:'macbeth',place:'A heath and a threshold',atmosphere:'Low mist, dark stone, and a decision taking shape.',landscape:'highlands',furniture:'garden',sky:'#78898d',horizon:'#bac0b7',ground:'#646a50',stone:'#aaa897',foliage:'#4c5947',building:'#797e77',roof:'#444e4c',light:'#d7e2d6',guides:['Rowan','Nell','Bram'],roles:['Theatre reader','Letter examiner','Decision guide']},
 'frankenstein':{...base,id:'frankenstein',place:'Letters and the study',atmosphere:'Cool twilight outside; books and lamplight within.',landscape:'town',furniture:'garden',sky:'#42596c',horizon:'#8698a4',ground:'#6e7678',stone:'#a8a7a0',building:'#92968e',roof:'#48545d',light:'#e3d4be',night:true,guides:['Ada','Felix','Leonie'],roles:['Correspondence reader','Research reader','Narrative examiner']},
 'christmas-carol':{...base,id:'christmas-carol',place:'A winter street · three reading rooms',atmosphere:'Pale winter daylight, brick façades, and warm windows.',landscape:'town',furniture:'garden',sky:'#a1b5bf',horizon:'#e0e2dd',ground:'#cfd5cf',stone:'#c3c6bd',foliage:'#7d8c7c',building:'#956c58',roof:'#e1e0d6',light:'#ffe3b1',guides:['Kit','Edith','Samuel'],roles:['Counting-house reader','Memory reader','Household reader']},
 'tempest':{...base,id:'tempest',place:'An island after the storm',atmosphere:'A broken cloudbank, rough rocks, and competing accounts.',landscape:'shore',furniture:'coast',sky:'#678c9d',horizon:'#b5c9ca',ground:'#939c7c',water:'#315d70',stone:'#b6bba9',light:'#dce4d2',guides:['Nora','Tomas','Lena'],roles:['Storm reader','Account examiner','Dialogue reader']},
 'declaration':{...base,id:'declaration',place:'Philadelphia · a document workshop',atmosphere:'Brick streets, writing desks, and claims made public.',landscape:'town',furniture:'garden',building:'#ad7860',roof:'#646665',ground:'#97958a',guides:['James','Lydia','Owen'],roles:['Principles reader','Grievance examiner','Document reader']},
 'douglass-literacy':{...base,id:'douglass-literacy',place:'Baltimore · a testimony reading space',atmosphere:'Ordinary streets and desks for extraordinary testimony.',landscape:'town',furniture:'garden',building:'#af8d73',roof:'#6d6d62',ground:'#8f9585',guides:['Anna','Isaac','June'],roles:['Testimony reader','Literacy reader','Context examiner']},
 'seneca-falls':{...base,id:'seneca-falls',place:'Seneca Falls · a declaration workshop',atmosphere:'A village meeting place, familiar language, new demands.',landscape:'estate',furniture:'garden',building:'#ddd4bb',roof:'#77786e',ground:'#819477',guides:['Helen','Arthur','May'],roles:['Comparison reader','Sentiments reader','Claims examiner']},
};
export function worldTheme(world:World):WorldTheme{
 const id=world.lessonPack?.curriculum?.worldId;
 if(id&&Object.hasOwn(WORLD_THEMES,id))return WORLD_THEMES[id];
 const scene=world.lessonPack?.scene??'archive';
 return {...base,id:'custom',place:world.lessonPack?.sourceTitle??world.title,atmosphere:'Read the sources, compare perspectives, and develop your explanation.',landscape:scene==='coast'?'shore':scene==='garden'?'estate':'town',furniture:scene,guides:['Source guide','Evidence guide','Reflection guide'],roles:['Reading guide','Reading guide','Reading guide']};
}

export type SurfaceFinish='sand'|'earth'|'chalk'|'ashlar'|'slate'|'brick'|'limewash'|'planks'|'parquet'|'frost';
export type WorkSurfaces={ground:SurfaceFinish;wall:SurfaceFinish;stone:SurfaceFinish;wood:SurfaceFinish;woodColor:string;stoneColor:string;wet:boolean};
/** Surface finishes are art direction, not claims about a surviving historical building. */
export const WORLD_SURFACES:Record<string,WorkSurfaces>={
 alexandria:{ground:'sand',wall:'ashlar',stone:'chalk',wood:'planks',woodColor:'#796044',stoneColor:'#d9c9a5',wet:false},
 'odyssey-ix':{ground:'sand',wall:'chalk',stone:'chalk',wood:'planks',woodColor:'#887150',stoneColor:'#d4c5a0',wet:false},
 'austen-letter':{ground:'earth',wall:'limewash',stone:'ashlar',wood:'parquet',woodColor:'#866949',stoneColor:'#cdbfa5',wet:false},
 macbeth:{ground:'earth',wall:'ashlar',stone:'slate',wood:'planks',woodColor:'#574d42',stoneColor:'#737c77',wet:true},
 frankenstein:{ground:'earth',wall:'limewash',stone:'slate',wood:'planks',woodColor:'#604433',stoneColor:'#899298',wet:false},
 'christmas-carol':{ground:'frost',wall:'brick',stone:'slate',wood:'planks',woodColor:'#6d5040',stoneColor:'#939c9f',wet:true},
 tempest:{ground:'sand',wall:'chalk',stone:'slate',wood:'planks',woodColor:'#6c7168',stoneColor:'#697e83',wet:true},
 declaration:{ground:'earth',wall:'limewash',stone:'ashlar',wood:'parquet',woodColor:'#946541',stoneColor:'#b6afa0',wet:false},
 'douglass-literacy':{ground:'earth',wall:'brick',stone:'brick',wood:'planks',woodColor:'#8a7253',stoneColor:'#a28066',wet:false},
 'seneca-falls':{ground:'earth',wall:'limewash',stone:'chalk',wood:'planks',woodColor:'#b19469',stoneColor:'#cfc4ac',wet:false},
};
