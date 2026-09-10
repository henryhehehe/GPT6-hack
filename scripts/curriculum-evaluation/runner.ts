import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {RubricSchema,validateWorld,type World} from '../../lib/world';
import {prepareCatalogLesson} from '../../lib/curriculum';
import fixtures from '../../docs/curriculum/FORMATIVE-EXAMPLES.json';
import packets from '../../lib/curriculum/packets.json';
import {historicalFixtures} from './historical';

export type Example=typeof fixtures.examples[number];
export type Result={exampleId:string;lessonId:string;kind:string;learnerText:string;expectedFeedback:string;status:'pending'|'captured'|'invalid-result'|'interrupted';evaluation?:unknown;submission?:unknown;reviewFlags:string[];humanReview:'pending';error?:string;durationMs?:number};
export type Suite='formative'|'historical';
export type Report={runId:string;startedAt:string;finishedAt?:string;mode:'preflight'|'live';suite:Suite;status:'prepared'|'running'|'completed'|'blocked'|'interrupted';assessmentContract:'selected-citations-v1';packetVersion:string;fixtureHash:string;sourceHashes:Record<string,string>;results:Result[];error?:string;notice:string};
type Access={id:string;teacherToken:string;inviteToken:string};
type StudentAccess={id:string;studentId:string;studentToken:string};
export type LearningTools={materials:(evidence:World['evidence'][number])=>{id:'text'|'excerpt';text:string}[];sourceVersion:(evidence:World['evidence'][number])=>Promise<string>};
export type Options={baseUrl:string;live?:boolean;suite?:Suite;caseIds?:string[];teacherCode?:string;parent?:Pick<Access,'id'|'teacherToken'>;learning?:LearningTools;fetcher?:typeof fetch;save?:(report:Report)=>Promise<void>};
export const hash=(value:unknown)=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const safeBase=(value:string)=>{
 const url=new URL(value);
 if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||url.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error('Evaluation runs only against a local HTTP app origin.');
 return url.origin;
};

export function preflight(caseIds:string[]=[],examples:Example[]=fixtures.examples,packetVersion=fixtures.packetVersion){
 if(packetVersion!==packets.version)throw new Error('The examples target a different packet version. Review them before evaluating.');
 if(new Set(examples.map(e=>e.id)).size!==examples.length)throw new Error('Example IDs must be unique.');
 if(new Set(caseIds).size!==caseIds.length||caseIds.some(id=>!examples.some(e=>e.id===id)))throw new Error('Choose unique example IDs from the selected fixture suite.');
 const selected=caseIds.length?examples.filter(e=>caseIds.includes(e.id)):examples;
 if(!selected.length)throw new Error('At least one example is required.');
 const worlds=new Map<string,World>();
 for(const example of selected){
  const world=prepareCatalogLesson(example.lessonId).world!;worlds.set(example.lessonId,world);
  const evidence=world.evidence.filter(e=>example.evidenceIds.includes(e.id));
  if(evidence.length!==example.evidenceIds.length)throw new Error(`Unavailable or duplicate evidence in ${example.id}.`);
  for(const quote of example.quotedPhrases){
   const found=evidence.some(e=>e.text.includes(quote));
   if(!example.learnerText.includes(quote)||found===(example.kind==='fabricated-quotation'))throw new Error(`Unexpected quotation match in ${example.id}.`);
  }
 }
 return {selected,worlds};
}

export function checkEvaluation(value:unknown,example:Example){
 const feedback=RubricSchema.extend({score:z.number().int().min(0).max(4),responseId:z.string().min(1),latencyMs:z.number().finite().nonnegative(),unlocked:z.boolean()}).parse(value);
 if(new Set(feedback.items.map(i=>i.key)).size!==4)throw new Error('Repeated rubric criteria in response.');
 if(feedback.items.some(i=>i.earned&&(!i.excerpt.trim()||!example.learnerText.includes(i.excerpt))))throw new Error('Credited wording does not occur in the learner answer.');
 if(feedback.evidenceIds.some(id=>!example.evidenceIds.includes(id)))throw new Error('Response credits evidence unavailable to this student.');
 if(feedback.score!==feedback.items.filter(i=>i.earned).length)throw new Error('Inconsistent assessment score.');
 const flags:string[]=[];
 if(['fabricated-quotation','context-misattribution'].includes(example.kind)&&feedback.items.some(i=>i.key==='claim'&&i.earned))flags.push('Claim credit for an answer containing invented or misattributed wording; review whether its conclusion depends on that wording.');
 if(example.kind==='fabricated-quotation'&&feedback.items.some(i=>i.key==='evidence'&&i.earned))flags.push('Evidence credit for an answer containing an intentionally fabricated quotation; review its justification.');
 if(example.kind==='context-misattribution'&&feedback.items.some(i=>i.key==='evidence'&&i.earned))flags.push('Evidence credit for an answer attributing a modern note to the original source; review its justification.');
 if(example.kind==='out-of-range'&&feedback.items.some(i=>i.earned))flags.push('Credit awarded to an out-of-range question; inspect the rationale.');
 return flags;
}

function verifyPacket(value:unknown,expected:World){
 const actual=validateWorld(value);
 if(hash(actual)!==hash(expected))throw new Error('The running app packet differs from the reviewed local packet. No assessment was sent.');
}

export async function runEvaluation(options:Options):Promise<Report>{
 const suite=options.suite??'formative';
 if(!['formative','historical'].includes(suite))throw new Error('Unknown evaluation suite.');
 const fixture=suite==='historical'?historicalFixtures():fixtures;
 const base=safeBase(options.baseUrl),{selected,worlds}=preflight(options.caseIds,fixture.examples,fixture.packetVersion);
 const report:Report={runId:randomUUID(),startedAt:new Date().toISOString(),mode:options.live?'live':'preflight',suite,status:'prepared',assessmentContract:'selected-citations-v1',packetVersion:packets.version,fixtureHash:hash(fixture),sourceHashes:Object.fromEntries([...worlds].map(([id,world])=>[id,hash(world)])),results:selected.map(e=>({exampleId:e.id,lessonId:e.lessonId,kind:e.kind,learnerText:e.learnerText,expectedFeedback:e.expectedFeedback,status:'pending',reviewFlags:[],humanReview:'pending'})),notice:'Synthetic examples only. Captured means a response was recorded, not that its interpretation or grading is correct. Human review is required; no learning gains or model reliability are established.'};
 const secrets=[options.teacherCode,options.parent?.teacherToken].filter((x):x is string=>!!x);
 const redact=(text:string)=>secrets.reduce((s,secret)=>s.split(secret).join('[redacted]'),text);
 const save=async()=>options.save?.(JSON.parse(redact(JSON.stringify(report))));
 await save();
 if(!options.live)return report;
 let cookie='';
 const fetcher=options.fetcher??fetch;
 const request=async(path:string,body?:unknown,token?:string)=>{
  const response=await fetcher(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(90000)});
  const text=await response.text();
  let data;try{data=JSON.parse(text);}catch{throw new Error(`App returned non-JSON (${response.status}) at ${path.split('?')[0]}.`);}
  if(!response.ok)throw new Error(`App rejected request (${response.status}): ${String(data.error??'unknown error').slice(0,1000)}`);
  const setCookie=response.headers.get('set-cookie');if(setCookie){cookie=setCookie.split(';')[0];secrets.push(cookie,cookie.slice(cookie.indexOf('=')+1));}
  for(const key of ['teacherToken','inviteToken','studentToken'])if(typeof data[key]==='string')secrets.push(data[key]);
  return data;
 };
 let active:Result|undefined;
 try{
  const learning=options.learning;
  if(!learning)throw new Error('The integrated selected-citation helpers are unavailable. Integrate lib/learning.ts before live evaluation; no classroom or model request was sent.');
  let parent=options.parent;
  if(!parent){
   if(options.teacherCode)await request('/api/teacher-access',{code:options.teacherCode});
   const access=await request('/api/teacher-access');
   if(!access.authorized)throw new Error('Teacher access is not configured for this evaluation. Supply CURRICULUM_EVAL_TEACHER_CODE or an existing evaluation classroom ID and teacher token.');
   parent=await request('/api/classroom',{action:'create'});
  }
  if(!parent?.id||!parent.teacherToken)throw new Error('Evaluation parent credentials are incomplete.');
  report.status='running';await save();
  const classrooms=new Map<string,Access>();
  for(const example of selected){
   active=report.results.find(r=>r.exampleId===example.id)!;
   let access=classrooms.get(example.lessonId);
   const expected=worlds.get(example.lessonId)!;
   if(!access){
    const draftId=randomUUID(),path=`/api/lesson-builder?id=${encodeURIComponent(parent.id)}`;
    const draft=await request(path,{action:'catalog',draftId,lessonId:example.lessonId},parent.teacherToken);
    verifyPacket(draft.world,expected);
    access=await request(path,{action:'launch',draftId,reviewed:true},parent.teacherToken) as Access;
    if(!access.id||!access.inviteToken||access.id===parent.id)throw new Error('Evaluation must launch a separate classroom.');
    classrooms.set(example.lessonId,access);
   }
   const student=await request('/api/classroom',{action:'join',id:access.id,name:`Evaluation ${report.results.indexOf(active)+1}`},access.inviteToken) as StudentAccess;
   if(!student.studentId||!student.studentToken||student.id!==access.id)throw new Error('Evaluation student credentials are incomplete.');
   const state=await request(`/api/classroom?id=${encodeURIComponent(access.id)}&studentId=${encodeURIComponent(student.studentId)}`,undefined,student.studentToken);
   verifyPacket(state.world,expected);
   if(!state.student||state.student.turns.length||state.student.evidence.length)throw new Error('Evaluation student must start without prior work.');
   const prediction='I will examine the assigned source before deciding.';
   await request('/api/classroom',{action:'predict',id:access.id,studentId:student.studentId,text:prediction},student.studentToken);
   for(const evidenceId of example.evidenceIds)await request('/api/classroom',{action:'collect',id:access.id,studentId:student.studentId,evidenceId},student.studentToken);
   const citations=await Promise.all(example.evidenceIds.map(async evidenceId=>{
    const evidence=expected.evidence.find(e=>e.id===evidenceId)!;
    const material=learning.materials(evidence).find(m=>m.id==='text');
    if(!material?.text)throw new Error('The selected source material is unavailable.');
    return {evidenceId,material:material.id,sourceVersion:await learning.sourceVersion(evidence),start:0,end:material.text.length,quote:material.text,relevance:'This is the supplied passage I am using for this answer.'};
   }));
   const submission={requestId:randomUUID(),claim:example.learnerText,npc:'library',scenario:example.lessonId==='alexandria-01',citations,reflection:''};
   active.submission={prediction,...submission};
   // No automatic retries: a timeout may follow a saved, charged assessment.
   const started=Date.now();active.status='interrupted';await save();
   const reply=await request('/api/classroom',{action:'argue',id:access.id,studentId:student.studentId,...submission},student.studentToken);
   active.durationMs=Date.now()-started;active.evaluation=reply.evaluation;
   if(reply.turn?.id!==submission.requestId||!Array.isArray(reply.turn?.citations)||hash(reply.turn.citations)!==hash(citations)){
    active.status='invalid-result';
    throw new Error('Server did not confirm the selected-citation submission contract.');
   }
   try{
    active.reviewFlags=checkEvaluation(reply.evaluation,example);active.status='captured';
   }
   catch(error){active.status='invalid-result';active.error=error instanceof Error?error.message:'Invalid result';}
   await save();active=undefined;
  }
  report.status='completed';
 }catch(error){
  report.error=redact(error instanceof Error?error.message:'Evaluation interrupted');
  report.status=active?.status==='interrupted'?'interrupted':'blocked';
  if(active)active.error=report.error;
 }finally{report.finishedAt=new Date().toISOString();await save();}
 return JSON.parse(redact(JSON.stringify(report)));
}
