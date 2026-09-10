import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {prepareCatalogLesson} from '../lib/curriculum';
import {preflight,runEvaluation,checkEvaluation,type LearningTools,type Report} from '../scripts/curriculum-evaluation/runner';
import {reportHtml} from '../scripts/curriculum-evaluation/report';

const learning:LearningTools={materials:e=>[{id:'text',text:e.text}],sourceVersion:async()=> 'a'.repeat(64)};
const parent={id:randomUUID(),teacherToken:'private-parent-token'};
const emptyEvaluation=()=>({reply:'Consider the assigned evidence.',items:['claim','evidence','mechanism','limitation'].map(key=>({key,earned:false,excerpt:'',reason:'Review needed.'})),evidenceIds:[] as string[],nextQuestion:'Which detail supports your argument?',score:0,unlocked:false,responseId:'resp_fixture',latencyMs:10});

function fakeApp(options:{mismatch?:boolean;timeout?:boolean;legacy?:boolean}={}){
 const worlds=new Map<string,unknown>(),drafts=new Map<string,unknown>();
 const students=new Map<string,{evidence:string[];turns:unknown[];prediction?:string}>();
 const submissions:Record<string,unknown>[]=[];
 const fetcher:typeof fetch=async(input,init)=>{
  const url=new URL(String(input)),body=init?.body?JSON.parse(String(init.body)):undefined;
  assert.equal(init?.redirect,'error');
  let data:unknown;
  if(url.pathname==='/api/lesson-builder'){
   if(body.action==='catalog'){
    const draft=prepareCatalogLesson(body.lessonId);drafts.set(body.draftId,draft.world);
    data=options.mismatch?{...draft,world:{...draft.world,objective:'A changed objective'}}:draft;
   }else{const id=randomUUID();worlds.set(id,drafts.get(body.draftId));data={id,teacherToken:'child-teacher-secret',inviteToken:'invite-secret'};}
  }else if(!body){data={world:worlds.get(url.searchParams.get('id')!),student:students.get(url.searchParams.get('studentId')!)};
  }else if(body.action==='join'){
   const studentId=randomUUID();students.set(studentId,{evidence:[],turns:[]});data={id:body.id,studentId,studentToken:'student-secret'};
  }else if(body.action==='predict'){students.get(body.studentId)!.prediction=body.text;data={ok:true};
  }else if(body.action==='collect'){students.get(body.studentId)!.evidence.push(body.evidenceId);data={ok:true};
  }else if(body.action==='argue'){
   submissions.push(body);assert.ok(students.get(body.studentId)!.prediction);
   assert.deepEqual(body.citations.map((c:{evidenceId:string})=>c.evidenceId),students.get(body.studentId)!.evidence);
   assert.ok(!('expectedFeedback' in body));
   if(options.timeout)throw new Error('Simulated connection loss after request');
   data={ok:true,evaluation:emptyEvaluation(),...(options.legacy?{}:{turn:{id:body.requestId,citations:body.citations}})};
  }else throw new Error('Unexpected test request');
  return Response.json(data);
 };
 return {fetcher,submissions,students,worlds};
}

test('preflight is offline, validates requested IDs, and leaves every semantic judgment pending',async()=>{
 let calls=0;const report=await runEvaluation({baseUrl:'http://localhost:5173',fetcher:async()=>{calls++;throw Error('No requests permitted');}});
 assert.equal(report.results.length,12);assert.equal(calls,0);assert.equal(report.status,'prepared');
 assert.ok(report.results.every(r=>r.humanReview==='pending'&&r.status==='pending'));
 assert.throws(()=>preflight(['not-a-case']));assert.throws(()=>preflight(['alexandria-01-supported','alexandria-01-supported']));
 await assert.rejects(()=>runEvaluation({baseUrl:'https://example.org'}),/local HTTP/);
});

test('missing integration and teacher access stop before classroom creation or assessment',async()=>{
 let calls=0;
 const noHelpers=await runEvaluation({baseUrl:'http://localhost:5173',live:true,fetcher:async()=>{calls++;throw Error('Unexpected');}});
 assert.equal(noHelpers.status,'blocked');assert.equal(calls,0);
 const denied=await runEvaluation({baseUrl:'http://localhost:5173',live:true,learning,fetcher:async(_url,init)=>{calls++;assert.equal(init?.method,'GET');return Response.json({authorized:false});}});
 assert.equal(denied.status,'blocked');assert.equal(calls,1);
});

test('live orchestration isolates all examples and records responses without declaring semantic success',async()=>{
 const app=fakeApp(),snapshots:Report[]=[];
 const report=await runEvaluation({baseUrl:'http://localhost:5173',live:true,parent,learning,fetcher:app.fetcher,save:async report=>{snapshots.push(structuredClone(report));}});
 assert.equal(report.status,'completed');assert.equal(app.students.size,12);assert.equal(app.worlds.size,3);
 assert.equal(app.submissions.length,12);assert.ok(report.results.every(r=>r.status==='captured'&&r.humanReview==='pending'));
 assert.equal(new Set(app.submissions.map(s=>s.requestId)).size,12);
 assert.ok(snapshots.some(r=>r.results.some(result=>result.status==='captured')&&r.status==='running'));
 const serialized=JSON.stringify(snapshots);for(const secret of [parent.teacherToken,'student-secret','invite-secret','child-teacher-secret'])assert.ok(!serialized.includes(secret));
});

test('a changed server packet cannot reach student creation or model assessment',async()=>{
 const app=fakeApp({mismatch:true});
 const report=await runEvaluation({baseUrl:'http://localhost:5173',live:true,parent,learning,fetcher:app.fetcher});
 assert.equal(report.status,'blocked');assert.match(report.error!,/differs/);assert.equal(app.students.size,0);assert.equal(app.submissions.length,0);
});

test('lost responses stop the run without retrying the potentially charged submission',async()=>{
 const app=fakeApp({timeout:true});
 const report=await runEvaluation({baseUrl:'http://localhost:5173',live:true,parent,learning,fetcher:app.fetcher});
 assert.equal(report.status,'interrupted');assert.equal(app.submissions.length,1);
 assert.equal(report.results[0].status,'interrupted');assert.ok(report.results[0].submission);
 assert.ok(report.results.slice(1).every(r=>r.status==='pending'));
});

test('a legacy response cannot count as a confirmed selected-passage assessment',async()=>{
 const app=fakeApp({legacy:true});
 const report=await runEvaluation({baseUrl:'http://localhost:5173',live:true,parent,learning,caseIds:['austen-letter-01-supported'],fetcher:app.fetcher});
 assert.equal(report.results[0].status,'invalid-result');assert.match(report.results[0].error!,/submission contract/);
});

test('rubric validation rejects unavailable evidence and false credited quotations; risk flags remain qualitative',()=>{
 const example=preflight(['austen-letter-01-fabricated-quotation']).selected[0];
 const result=emptyEvaluation();result.evidenceIds.push('unavailable');assert.throws(()=>checkEvaluation(result,example),/unavailable/);
 result.evidenceIds=[];result.items[0]={key:'claim',earned:true,excerpt:'Not in the answer',reason:'Bad credit'};result.score=1;
 assert.throws(()=>checkEvaluation(result,example),/Credited wording/);
 result.items[0]={key:'claim',earned:false,excerpt:'',reason:''};result.items[1]={key:'evidence',earned:true,excerpt:example.learnerText,reason:'Needs human review'};
 assert.equal(checkEvaluation(result,example).length,1);
});

test('saved errors redact credentials and HTML reports cannot execute returned markup',async()=>{
 const report=await runEvaluation({baseUrl:'http://localhost:5173',live:true,parent,learning,fetcher:async()=>Response.json({error:`Rejected ${parent.teacherToken}`},{status:403})});
 assert.ok(!JSON.stringify(report).includes(parent.teacherToken));
 report.results[0].expectedFeedback='<img src=x onerror=alert(1)>';
 const html=reportHtml(report);assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<script'));
});
