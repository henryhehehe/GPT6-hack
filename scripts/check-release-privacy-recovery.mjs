// Offline integration regression against the actual built Worker. No real keys or network egress.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {Miniflare,Response as WorkerResponse} from 'miniflare';
const root=path.resolve('dist/server');
const files=await readdir(root,{recursive:true});
const modules=await Promise.all(['index.js',...files.filter(f=>f.endsWith('.js')&&f!=='index.js')].map(async f=>({type:'ESModule',path:path.join(root,f),contents:await readFile(path.join(root,f),'utf8')})));
import {sourceVersion,materials,passages} from '../lib/learning.ts';
import {createDialogueDraftStore} from '../lib/dialogueDraftStore.ts';
const drafts=new Map(),storage={getItem:key=>drafts.get(key)??null,setItem:(key,value)=>drafts.set(key,value)};
const originalDraft=createDialogueDraftStore('class:B:library:false','source1',()=>storage);
originalDraft.edit('Original question');const sentQuestion=originalDraft.prepare(()=>crypto.randomUUID());
const reopenedDraft=createDialogueDraftStore('class:B:library:false','source1',()=>storage);
reopenedDraft.read();reopenedDraft.edit('New question typed after reopening');originalDraft.complete(sentQuestion);
assert.equal(reopenedDraft.read().message,'New question typed after reopening');
assert.equal(createDialogueDraftStore('class:B:library:false','source1',()=>storage).read().message,'New question typed after reopening');
console.log('PASS a late response preserves newer saved typing after the dialog is reopened.');
const calls=[];let pauseArgument=false,unblock,started;const pendingArgument=new Promise(resolve=>{started=resolve;});
const mf=new Miniflare({name:'review-learning-regression',modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],host:'127.0.0.1',port:0,bindings:{PILOT_TEACHER_CODE:'offline-regression-code',PILOT_AI_REQUEST_LIMIT:'30',OPENAI_API_KEY:'offline-test-key'},d1Databases:{DB:'review-learning-regression'},r2Buckets:['BUCKET'],assets:{directory:path.resolve('dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},outboundService:async request=>{
 // This handler answers locally. It never forwards any request or uses real credentials.
 assert.equal(request.url,'https://api.openai.com/v1/responses');
 const body=await request.json(),input=JSON.parse(body.input),name=body.text.format.name;calls.push({name,input});
 if(name==='argument'&&pauseArgument){started();await new Promise(resolve=>{unblock=resolve;});}
 let value;
 if(name==='argument')value={reply:'Offline fixture feedback; no model judgment was made.',items:['claim','evidence','mechanism','limitation'].map(key=>({key,earned:true,excerpt:input.claim,reason:'Deterministic transport fixture.'})),evidenceIds:input.selectedPassages.map(p=>p.evidenceId),nextQuestion:'Which assumption could change your conclusion?'};
 else if(name==='character_dialogue')value={reply:'Offline fixture reply.',evidenceIds:[],followUp:'What does the source say?'};
 else if(name==='intervention')value={title:'Compare another patron',text:'Offline fixture challenge.',question:'Could another patron provide support?',zone:'market'};
 else if(name==='world'){
  value=structuredClone(input.template);
  value.evidence=value.evidence.map(e=>e.kind==='source'?{id:'replacement',title:'Invented replacement',text:'A hypothetical replacement for testing omission.',kind:'teaching-prop',source:'Offline fixture',zone:e.zone}:e);
  value.nodes.forEach(n=>{n.evidenceIds=n.evidenceIds.map(id=>id==='strabo'?'replacement':id);});
 }else throw new Error(`Unexpected outbound operation: ${name}`);
 return new WorkerResponse(JSON.stringify({id:`offline_response_${calls.length}`,status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]}),{headers:{'Content-Type':'application/json'}});
}});
try{
 await mf.ready;const db=await mf.getD1Database('DB');
 for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile(path.join('drizzle',file),'utf8')).replace(/--[^\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
 const post=async(endpoint,body,token,cookie,status=200)=>{
  const response=await mf.dispatchFetch(`http://localhost${endpoint}`,{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
  const data=await response.json();assert.equal(response.status,status,JSON.stringify(data));return {data,headers:response.headers};
 };
 const freshPage=await mf.dispatchFetch('http://localhost/try');assert.equal(freshPage.status,200);
 const freshHtml=await freshPage.text();
 assert.ok(freshHtml.includes('Save starting prediction'),'Fresh trial renders the prediction form');
 assert.ok(freshHtml.includes('Defend your idea'),'Fresh trial has an idle submission form before classroom creation');
 assert.ok(!freshHtml.includes('Please wait…'),'Fresh trial must not wait for a classroom it has not created');
 console.log('PASS fresh trial renders an idle learning form before classroom creation.');
 const login=await post('/api/teacher-access',{code:'offline-regression-code'}),cookie=login.headers.get('set-cookie').split(';')[0];
 const classroom=async()=> (await post('/api/classroom',{action:'create'},undefined,cookie)).data;
 const c=await classroom(),foreign=await classroom();
 const action=async(body,token,status=200)=>(await post('/api/classroom',body,token,undefined,status)).data;
 const a=await action({action:'join',id:c.id,name:'Synthetic A'},c.inviteToken),b=await action({action:'join',id:c.id,name:'Synthetic B'},c.inviteToken);
 const read=async(access,teacher=false)=>{
  const response=await mf.dispatchFetch(`http://localhost/api/classroom?id=${access.id}&studentId=${access.studentId}`,{headers:{Authorization:`Bearer ${teacher?access.teacherToken:access.studentToken}`}});
  assert.equal(response.status,200);return response.json();
 };
 const world=(await read(b)).world;
 const evidence=world.evidence.find(e=>e.id==='funding'),material=materials(evidence)[0];
 const citation={evidenceId:evidence.id,material:material.id,sourceVersion:await sourceVersion(evidence),...passages(material.text)[0],relevance:'This explicitly conditional assumption permits another source of support.'};
 const input={action:'argue',id:c.id,studentId:b.studentId,npc:'library',scenario:false,requestId:crypto.randomUUID(),claim:'Trade-linked support could decline, but a replacement patron might keep scholars supported.',citations:[citation]};
 assert.match((await action(input,b.studentToken,400)).error,/prediction/);
 for(const learner of [a,b])await action({action:'predict',id:c.id,studentId:learner.studentId,text:learner===a?'Trade is the only source of support.':'A replacement patron could provide support.'},learner.studentToken);
 assert.match((await action(input,b.studentToken,400)).error,/journal/);
 await action({action:'collect',id:c.id,studentId:b.studentId,evidenceId:evidence.id},b.studentToken);
 for(const citations of [[{...citation,quote:'Invented quotation'}],[{...citation,sourceVersion:'0'.repeat(64)}],[citation,citation]])await action({...input,citations},b.studentToken,400);
 for(const studentId of [undefined,foreign.studentId])await action({action:'director',id:c.id,studentId,instruction:'Challenge the selected learner.'},c.teacherToken,400);
 await action({action:'director',id:c.id,studentId:b.studentId,instruction:'Challenge the selected learner.'},b.studentToken,400);
 for(const [studentId,token] of [[undefined,c.teacherToken],[foreign.studentId,c.teacherToken],[b.studentId,b.studentToken]]){
  const response=await mf.dispatchFetch('http://localhost/api/director',{headers:{Origin:'http://localhost',Upgrade:'websocket'}});
  assert.equal(response.status,101);const socket=response.webSocket;assert.ok(socket);socket.accept();
  try{await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Director rejection timed out')),3000);
   socket.addEventListener('message',event=>{clearTimeout(timer);try{const result=JSON.parse(String(event.data));assert.equal(result.type,'error');assert.doesNotMatch(result.error,/Astra|configured|steering connection/);resolve();}catch(error){reject(error);}},{once:true});
   socket.send(JSON.stringify({type:'start',id:c.id,token,studentId,instruction:'Challenge the selected learner.'}));
  });}finally{socket.close();}
 }
 assert.equal(calls.length,0,'Invalid learner/evidence requests must be rejected before upstream work');

 await action(input,b.studentToken);
 const instruction='Private teacher note: Synthetic B needs individual support; ask the class a general question.';
 const hint=await action({action:'director',id:c.id,studentId:b.studentId,instruction},c.teacherToken);
 await action({action:'apply',id:c.id,...hint},c.teacherToken);
 const otherLearner=(await read(a)).state.hint;
 assert.equal(otherLearner.request,undefined);assert.equal(otherLearner.basis,undefined);assert.equal(otherLearner.title,hint.patch.title);const teacherHint=(await read(c,true)).state.hint;assert.equal(teacherHint.request,instruction);assert.equal(teacherHint.basis.name,'Synthetic B');
 console.log('PASS learner hint omits private request/basis; teacher retains original context.');
 pauseArgument=true;
 const assessing=action({...input,requestId:crypto.randomUUID(),claim:input.claim+' A new detail should be considered.'},b.studentToken);
 await pendingArgument;
 await action({action:'visit',id:c.id,studentId:b.studentId,zone:'harbor'},b.studentToken);
 unblock();const saved=await assessing;assert.ok(saved.turn.id);assert.equal(calls.at(-1).input.hint.request,undefined);assert.equal(calls.at(-1).input.hint.basis,undefined);
 assert.equal((await read(b)).student.turns.length,2);assert.equal((await read(b)).student.zone,'harbor');
 await action({action:'talk',id:c.id,studentId:b.studentId,npc:'harbor',scenario:false,message:'What does the source show?',requestId:crypto.randomUUID()},b.studentToken);
 assert.equal(calls.at(-1).input.hint.request,undefined);assert.equal(calls.at(-1).input.hint.basis,undefined);
 console.log('PASS navigation during assessment preserves feedback and current location; argument/dialogue model context excludes private teacher fields. Zero real model calls.');
 const beforeRecovery=await read(c,true),beforeStudent=(await read(b)).student,callCount=calls.length;
 const scenePatch={...hint.patch,id:crypto.randomUUID(),scene:{appearance:{timeOfDay:'night',weather:'hazy',water:'calm',viewpoint:'library'}}};
 await action({action:'apply',id:c.id,patch:scenePatch,baseVersion:beforeRecovery.version},c.teacherToken);
 const sceneSnapshot=await read(c,true);assert.ok(sceneSnapshot.state.sceneUndo);
 const studentSnapshot=await read(a);assert.equal(studentSnapshot.state.sceneUndo,undefined);assert.ok(!JSON.stringify(studentSnapshot.state).includes('Private teacher note'));
 const restore={action:'scene-recover',id:c.id,operation:'reset-atmosphere',requestId:crypto.randomUUID(),baseVersion:sceneSnapshot.version};
 await action(restore,b.studentToken,400);await action({...restore,baseVersion:restore.baseVersion-1},c.teacherToken,400);
 await action(restore,c.teacherToken);await action(restore,c.teacherToken);
 const resetSnapshot=await read(c,true);assert.equal(resetSnapshot.world.sceneAppearance,undefined);assert.equal(resetSnapshot.version,sceneSnapshot.version+1);
 await action({action:'scene-recover',id:c.id,operation:'undo',requestId:crypto.randomUUID(),baseVersion:resetSnapshot.version},c.teacherToken);
 assert.deepEqual((await read(c,true)).world,sceneSnapshot.world);assert.deepEqual((await read(b)).student,beforeStudent);assert.equal(calls.length,callCount);
 console.log('PASS built Worker scene recovery authorization, stale rejection, replay, private checkpoint, reset/undo and student preservation; no additional AI calls.');
}finally{await mf.dispose();}
