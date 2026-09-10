import { z } from 'zod';
import type { Citation } from './learning';
import type { DirectorBasis } from './directorContext';
import alexandriaSource from './curriculum/alexandria.json';
import sourceNotes from './curriculum/sourceNotes.json';

export const Zone = z.enum(['harbor', 'market', 'library']);
export type ZoneId = z.infer<typeof Zone>;
export const EvidenceSchema = z.object({ id:z.string().max(60), title:z.string().max(90), text:z.string().max(700), kind:z.enum(['source','assumption','teaching-prop']), source:z.string().max(500), zone:Zone,
 context:z.object({text:z.string().max(6000),locator:z.string().max(200),sourceVersion:z.string().regex(/^[a-f0-9]{64}$/),start:z.number().int().nonnegative(),end:z.number().int().positive(),editorialNote:z.string().max(500).optional(),readingNote:z.string().max(700).optional(),references:z.array(z.object({title:z.string().max(160),url:z.string().url().regex(/^https:\/\//)})).max(3).optional()}).optional() });
export const CurriculumSchema=z.object({worldId:z.string().max(60),lessonId:z.string().max(80),version:z.string().max(80),mode:z.enum(['close-reading','source-investigation','counterfactual']),teacherChallenge:z.string().max(350),revisionTask:z.string().max(350),sourceNote:z.string().max(500),teachingNotes:z.array(z.string().max(500)).max(8).optional()});
export const LessonPackSchema=z.object({subject:z.enum(['history','literature','general']),scene:z.enum(['coast','garden','archive']),sourceTitle:z.string().min(1).max(160),readingRange:z.string().max(200),characters:z.array(z.object({zone:Zone,name:z.string().min(1).max(40),role:z.string().max(70),perspective:z.string().max(400),starters:z.array(z.string().max(180)).length(2)})).length(3),activities:z.array(z.object({zone:Zone,instruction:z.string().min(1).max(350)})).length(3),curriculum:CurriculumSchema.optional()});
export const WorldSchema = z.object({
  title:z.string().min(3).max(80), subtitle:z.string().max(160), objective:z.string().max(300), intervention:z.string().max(200),
  nodes:z.array(z.object({ id:Zone, title:z.string().max(80), baseline:z.string().max(200), consequence:z.string().max(240), mechanism:z.string().max(350), evidenceIds:z.array(z.string()).min(1).max(3), activity:z.number().min(0).max(1) })).length(3),
  evidence:z.array(EvidenceSchema).min(3).max(6),
  lessonPack:LessonPackSchema.optional(),
  settingImage:z.object({draftId:z.string().uuid(),caption:z.string().max(250),model:z.string().max(80),responseId:z.string().max(150)}).optional(),
});
export type World = z.infer<typeof WorldSchema>;
export function scenarioAllowed(world:World){return !world.lessonPack?.curriculum||world.lessonPack.curriculum.mode==='counterfactual';}
export type Evidence = z.infer<typeof EvidenceSchema>;
export const RubricSchema = z.object({
  reply:z.string().max(650), items:z.array(z.object({key:z.enum(['claim','evidence','mechanism','limitation']),earned:z.boolean(),excerpt:z.string().max(400),reason:z.string().max(250)})).length(4),
  evidenceIds:z.array(z.string()).max(6), nextQuestion:z.string().max(250),
});
export type Evaluation=z.infer<typeof RubricSchema> & {score:number;unlocked:boolean;responseId:string;latencyMs:number};
export type Turn={id?:string;submission?:string;citations?:Citation[];revisesTurnId?:string;reflection?:string;revisionChanged?:boolean;hintId?:string;claim:string;npc:ZoneId;result:Evaluation;at:string;worldVersion:number;scenario:boolean};
export const DialogueSchema=z.object({reply:z.string().min(1).max(900),evidenceIds:z.array(z.string().max(60)).max(3),followUp:z.string().max(200)});
export type DialogueTurn={id:string;message:string;npc:ZoneId;result:z.infer<typeof DialogueSchema>;at:string;worldVersion:number;scenario:boolean;responseId:string;latencyMs:number};
export type StudentState={name:string;evidence:string[];turns:Turn[];zone:ZoneId;unlocked:boolean;dialogue?:DialogueTurn[];prediction?:{text:string;at:string;worldVersion:number};archiveReflection?:{text:string;at:string;worldVersion:number}};
export type Intervention={id:string;title:string;text:string;question:string;zone:ZoneId;responseId:string;latencyMs:number;request:string;kind:'teaching-prop';basis?:DirectorBasis};
export type ClassroomState={scenario:boolean;hint:Intervention|null;run:{responseId:string;latencyMs:number}|null};
export const HintSchema=z.object({title:z.string().max(80),text:z.string().max(650),question:z.string().max(250),zone:Zone});
export const lesson = `Alexandria: knowledge and the systems that sustain it.

Context: Strabo's Geography (17.1.8) describes Alexandria's Museum as part of the royal palaces, with a shared dining hall and a community of scholars. The Mouseion is a scholarly institution, distinct from a book collection or an illustrated Library building. Strabo describes royal and then Roman appointment of its priest. This is a source for institutional arrangements, not a precise library budget or a destruction narrative. Alexandria was a Mediterranean port; our scene is a stylized teaching reconstruction rather than a map or archaeological reconstruction.

For this exercise, assume the institution receives some funding from revenue connected to harbor trade. Assume a prolonged disruption reduces ships arriving and reduces merchants' income. Assume reduced institutional funding makes it harder to obtain writing materials and support scholars. These links are explicit scenario assumptions, not demonstrated laws or a prediction of what actually happened in ancient Alexandria.

Hypothetical harbor ledger: before disruption, 12 ships arrive in a teaching week; after disruption, 4. These invented numbers illustrate a direction of change only. They are not ancient records.

Alternative explanation: a patron might replace lost trade-linked funding. Trade disruption alone is therefore insufficient to prove the library must close. A good argument should distinguish the physical building from the people, materials, and institutions that keep knowledge alive, and identify the assumptions it depends on.

Learning objective: use evidence to explain a causal mechanism and acknowledge a competing explanation. Students may support or challenge the hypothesis.`;
export const initialWorld:World={
 title:'The city that kept knowledge alive', subtitle:'Alexandria · a historical thought experiment', objective:'Could a library survive without the trade that supports its city?',intervention:'What if harbor trade collapsed?',
 nodes:[
  {id:'harbor',title:'The Great Harbor',baseline:'Ships connect the city to the Mediterranean.',consequence:'Fewer ships reach the harbor.',mechanism:'In this scenario, disruption reduces arriving ships. The scale is illustrative.',evidenceIds:['ledger'],activity:0.22},
  {id:'market',title:'The waterfront market',baseline:'Merchants trade goods from arriving ships.',consequence:'Stalls empty and trade income falls.',mechanism:'Fewer arrivals reduce goods available to merchants, under the exercise assumptions.',evidenceIds:['ledger','funding'],activity:0.35},
  {id:'library',title:'The house of knowledge',baseline:'Scholars gather, write, and exchange ideas.',consequence:'Scholar support comes under pressure.',mechanism:'If support depends on trade-linked revenue and no patron replaces it, fewer resources reach scholars.',evidenceIds:['strabo','funding'],activity:0.3},
 ],
 evidence:[
  {...alexandriaSource,kind:'source',zone:'library',context:{...alexandriaSource.context,...sourceNotes.alexandria}},
  {id:'ledger',title:'The harbor ledger',text:'Before: 12 ships. After disruption: 4. These invented counts help compare the scenario. Fewer arrivals could mean fewer goods and lower merchant income.',kind:'teaching-prop',source:'Invented for this exercise. Not an ancient record.',zone:'harbor'},
  {id:'funding',title:'Who pays for knowledge?',text:'Assume part of scholar support comes from trade-linked revenue. Losing it could reduce support. A new patron could replace that income, so closure is not inevitable.',kind:'assumption',source:'Explicit teaching assumption, with an alternative explanation.',zone:'market'},
 ]
};
export function validateWorld(value:unknown):World{
 const w=WorldSchema.parse(value);
 if(new Set(w.nodes.map(n=>n.id)).size!==3)throw new Error('Each place must occur exactly once');
 const ids=new Set(w.evidence.map(e=>e.id));if(ids.size!==w.evidence.length)throw new Error('Evidence IDs must be unique');
 if(w.nodes.some(n=>n.evidenceIds.some(id=>!ids.has(id))))throw new Error('The world references missing evidence');
 if(w.evidence.some(e=>e.context&&(e.context.start>=e.context.end||e.context.end>e.context.text.length||e.context.text.slice(e.context.start,e.context.end)!==e.text)))throw new Error('The source excerpt does not match its reading context');
 return w;
}
/** Model-authored scenario changes must retain the complete saved historical evidence. */
export function preserveHistoricalSources(value:unknown,template:World=initialWorld):World{
 const world=validateWorld(value),sources=template.evidence.filter(e=>e.kind==='source');
 for(const evidence of world.evidence.filter(e=>e.kind==='source')){
  if(!sources.some(source=>source.id===evidence.id&&source.text===evidence.text&&source.source===evidence.source))throw new Error('Generated historical evidence did not match the verified source. Try again.');
 }
 if(sources.some(source=>!world.evidence.some(e=>e.kind==='source'&&e.id===source.id)))throw new Error('The generated world omitted a reviewed historical source. Try again.');
 return validateWorld({...world,evidence:world.evidence.map(e=>e.kind==='source'?structuredClone(sources.find(source=>source.id===e.id)!):e)});
}
export function gradeArgument(value:unknown,claim:string,available:string[],world:World){
 const r=RubricSchema.parse(value);
 if(new Set(r.items.map(i=>i.key)).size!==4)throw new Error('Rubric dimensions must be unique');
 if(r.evidenceIds.some(id=>!available.includes(id)||!world.evidence.some(e=>e.id===id)))throw new Error('Unsupported evidence reference');
 const text=claim.toLowerCase().replace(/\s+/g,' ').trim();
 r.items=r.items.map(i=>({...i,earned:i.earned&&i.excerpt.trim().length>0&&text.includes(i.excerpt.toLowerCase().replace(/\s+/g,' ').trim())}));
 const e=r.items.find(i=>i.key==='evidence')!;if(!r.evidenceIds.length)e.earned=false;
 const score=r.items.filter(i=>i.earned).length;
 return {...r,score,unlocked:score===4&&e.earned};
}
export const zoneNames:Record<ZoneId,string>={harbor:'Harbor',market:'Market',library:'Library'};
export const npcNames:Record<ZoneId,string>={harbor:'Dorian, the merchant',market:'Thaleia, the market trader',library:'Ione, the archivist'};
