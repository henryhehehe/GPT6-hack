import {z} from 'zod';
import {WorldSchema,EvidenceSchema,LessonPackSchema,validateWorld,type World} from './world';
export const PassageSchema=z.object({id:z.string().max(60),text:z.string().min(20).max(700),locator:z.string().min(1).max(160)});
export type Passage=z.infer<typeof PassageSchema>;
export const ExtractionSchema=z.object({passages:z.array(PassageSchema).min(3).max(12)});
export const GeneratedLessonSchema=WorldSchema.omit({settingImage:true,museumObjectIds:true}).extend({lessonPack:LessonPackSchema.omit({curriculum:true})});
export function lessonGenerationSchema(passages:Passage[]){const ids=z.enum(passages.map(p=>p.id) as [string,...string[]]);return GeneratedLessonSchema.extend({intervention:z.string().min(5).max(120),objective:z.string().min(5).max(180),evidence:z.array(EvidenceSchema.omit({text:true,source:true,context:true}).extend({id:ids,kind:z.literal('source')})).min(3).max(Math.min(6,passages.length)),nodes:z.array(WorldSchema.shape.nodes.element.extend({evidenceIds:z.array(ids).min(1).max(3)})).length(3)});}
export function textPassages(text:string):Passage[]{
 if(text.trim().length<200||text.length>60000)throw new Error('Provide between 200 and 60,000 characters of source text.');
 const paragraphs=[...text.matchAll(/\S[\s\S]*?(?=\n\s*\n|$)/g)];
 if(paragraphs.length>=3&&paragraphs.every(p=>p[0].length>=20&&p[0].length<=700))return paragraphs.map((p,i)=>({id:`passage-${i+1}`,text:p[0],locator:`Paragraph ${i+1} · characters ${p.index!+1}–${p.index!+p[0].length} in supplied excerpt`}));
 const passages:Passage[]=[];let offset=0;const target=Math.min(650,Math.ceil(text.length/3));
 while(offset<text.length){
  let end=Math.min(offset+target,text.length);
  if(text.length-end<30)end=text.length;
  else {const sentence=text.lastIndexOf('. ',end),space=text.lastIndexOf(' ',end);if(sentence>offset+target/2)end=sentence+1;else if(space>offset+target/2)end=space;}
  const excerpt=text.slice(offset,end);
  if(excerpt.trim().length>=20)passages.push({id:`passage-${passages.length+1}`,text:excerpt,locator:`Characters ${offset+1}–${end} in supplied excerpt`});
  else if(excerpt.trim()){const prior=passages.at(-1);if(!prior||prior.text.length+excerpt.length>700)throw new Error('Provide three readable passages with complete sentences.');prior.text+=excerpt;prior.locator=prior.locator.replace(/–\d+/,`–${end}`);}
  offset=end;
 }
 if(passages.length<3)throw new Error('Provide at least three useful short passages for the three learning stations.');
 return passages;
}
export function publicPdfUrl(value:string){const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||(url.port&&url.port!=='443')||!url.pathname.toLowerCase().endsWith('.pdf')||!url.hostname.includes('.')||/^[\d.]+$/.test(url.hostname)||url.hostname.includes(':')||/(^|\.)(localhost|local|internal|test)$/.test(url.hostname))throw new Error('Use a direct public HTTPS PDF link, or upload the file instead.');return url.href;}
export function groundLesson(value:unknown,passages:Passage[],sourceTitle:string,readingRange:string):World{
 const generated=lessonGenerationSchema(passages).parse(value);
 const evidence=generated.evidence.map(e=>{const p=passages.find(p=>p.id===e.id);if(!p)throw new Error('Astra referenced a passage outside the supplied material. Retry generation.');return {...e,text:p.text,source:`${sourceTitle} · ${p.locator}`,kind:'source' as const};});
 const world=validateWorld({...generated,evidence});
 if(world.nodes.some(n=>!world.evidence.some(e=>e.zone===n.id&&n.evidenceIds.includes(e.id))))throw new Error('Each place needs a local source card linked to its activity.');
 world.lessonPack!.sourceTitle=sourceTitle;world.lessonPack!.readingRange=readingRange;
 if(new Set(world.lessonPack!.characters.map(c=>c.zone)).size!==3||new Set(world.lessonPack!.activities.map(a=>a.zone)).size!==3)throw new Error('Each place needs its own character and activity.');
 return world;
}
export type BuilderAccess={id:string;teacherToken?:string;inviteToken?:string;studentId:string;studentToken:string};
export type LessonDraft={id:string;title:string;range:string;objective:string;format:'text'|'pdf';imageStatus?:'generating'|'ready'|'failed';imageError?:string;sourceUrl:string|null;hasUpload:boolean;passages:Passage[];world:World|null;run:{responseId:string;latencyMs:number}|null};
