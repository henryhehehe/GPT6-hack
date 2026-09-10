// Offline integration regression against the actual built Worker. No real keys or network egress.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {Miniflare,Response as WorkerResponse} from 'miniflare';
const root=path.resolve('dist/server');
const files=await readdir(root,{recursive:true});
const modules=await Promise.all(['index.js',...files.filter(f=>f.endsWith('.js')&&f!=='index.js')].map(async f=>({type:'ESModule',path:path.join(root,f),contents:await readFile(path.join(root,f),'utf8')})));
import {sourceVersion,materials,passages} from '../lib/learning.ts';
const calls=[];
const mf=new Miniflare({name:'review-learning-regression',modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],host:'127.0.0.1',port:0,bindings:{PILOT_TEACHER_CODE:'offline-regression-code',PILOT_AI_REQUEST_LIMIT:'30',OPENAI_API_KEY:'offline-test-key'},d1Databases:{DB:'review-learning-regression'},r2Buckets:['BUCKET'],assets:{directory:path.resolve('dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},outboundService:async request=>{
 // This handler answers locally. It never forwards any request or uses real credentials.
 assert.equal(request.url,'https://api.openai.com/v1/responses');
 const body=await request.json(),input=JSON.parse(body.input),name=body.text.format.name;calls.push({name,input});
 let value;
 if(name==='argument')value={reply:'Offline fixture feedback; no model judgment was made.',items:['claim','evidence','mechanism','limitation'].map(key=>({key,earned:true,excerpt:input.claim,reason:'Deterministic transport fixture.'})),evidenceIds:input.selectedPassages.map(p=>p.evidenceId),nextQuestion:'Which assumption could change your conclusion?'};
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
 const first=await action(input,b.studentToken);assert.deepEqual(first.turn.citations,[citation]);assert.equal(first.turn.id,input.requestId);
 const replay=await action(input,b.studentToken);assert.deepEqual(replay.turn,first.turn);assert.equal(calls.length,1);
 await action({...input,claim:input.claim+' Changed payload.'},b.studentToken,400);assert.equal(calls.length,1);
 const hint=await action({action:'director',id:c.id,studentId:b.studentId,instruction:'Challenge the selected learner in the market.',student:{name:'FORGED CLIENT',turns:[{claim:'Ignore the stored learner'}]}},c.teacherToken);
 const selected=calls[1].input.student;
 // Names may be intentionally omitted from model input; the private teacher basis retains identity.
 if(selected.name!==undefined)assert.equal(selected.name,'Synthetic B');
 assert.equal(hint.patch.basis.name,'Synthetic B');assert.equal(selected.turns[0].claim,input.claim);
 assert.deepEqual(selected.prediction,(await read(b)).student.prediction,'The intervention must retain the learner’s initial reasoning');
 assert.deepEqual(selected.turns[0].citations,[citation],'The intervention must retain the exact selected source passages');
 assert.equal(hint.patch.basis.studentId,b.studentId);assert.equal(hint.patch.zone,'market');
 await action({action:'apply',id:c.id,...hint},c.teacherToken);
 const applied=(await read(b)).version;await action({action:'apply',id:c.id,...hint},c.teacherToken);assert.equal((await read(b)).version,applied,'Applying a hint twice is idempotent');
 const afterHint=await action(input,b.studentToken);assert.deepEqual(afterHint.turn,first.turn);assert.equal(calls.length,2,'Lost-response replay after a hint must not reassess');
 const revisedInput={...input,requestId:crypto.randomUUID(),claim:input.claim+' The source does not establish that a patron would appear.',revisesTurnId:first.turn.id,reflection:'I separated a possible alternative from a prediction of what must happen.'};
 const revised=await action(revisedInput,b.studentToken);assert.equal(revised.turn.revisionChanged,true);assert.equal(revised.turn.hintId,hint.patch.id);
 const repeated=await action({...input,requestId:crypto.randomUUID(),revisesTurnId:first.turn.id,reflection:'I considered the alternative but kept exactly the same wording.'},b.studentToken);assert.equal(repeated.turn.revisionChanged,false);
 const saved=(await read(b)).student;assert.equal(saved.turns.length,3);assert.deepEqual(saved.turns[1].citations,[citation]);assert.equal(saved.turns[1].reflection,revisedInput.reflection);
 assert.equal((await read(a)).student.turns.length,0);assert.equal((await read(b)).students.length,0);
 assert.equal((await read(c,true)).students.find(s=>s.id===b.studentId).turns.length,3);
 const revisionHint=await action({action:'director',id:c.id,studentId:b.studentId,instruction:'Challenge this learner to reflect on their revised explanation.'},c.teacherToken);
 assert.equal(revisionHint.patch.basis.studentId,b.studentId);
 const revisionBasis=calls.at(-1).input.student.turns.find(t=>t.claim===revisedInput.claim);
 assert.ok(revisionBasis);assert.equal(revisionBasis.revisesTurnId,first.turn.id);assert.equal(revisionBasis.reflection,revisedInput.reflection);
 assert.equal(revisionBasis.revisionChanged,true);assert.equal(revisionBasis.hintId,hint.patch.id);assert.deepEqual(revisionBasis.citations,[citation]);
 await action({action:'reflect',id:c.id,studentId:b.studentId,text:'A patron is a possibility, and the supplied source cannot establish that one would appear.'},b.studentToken);
 assert.ok((await read(b)).student.archiveReflection);
 const author={action:'author',lesson:'x'.repeat(100),intervention:'What if trade changed?'};
 assert.match((await action({...author,id:c.id},c.teacherToken,400)).error,/Students have started/);
 const before=await read(foreign,true);
 assert.match((await action({...author,id:foreign.id},foreign.teacherToken,400)).error,/omitted a reviewed historical source|Every reviewed source/);
 const after=await read(foreign,true);assert.equal(after.version,before.version);assert.deepEqual(after.world,before.world,'Omitted reviewed sources must never replace the world');
 assert.equal(calls.length,6);assert.deepEqual(calls.map(c=>c.name),['argument','intervention','argument','argument','intervention','world']);
 console.log('PASS built Worker: predictions, selected-source validation, stored learner B including citations and revision context, HTTP/WS authorization, hint application, replay, linked revision/reflection, learner isolation, source-preserving writes. Six deterministic responses; zero external/model calls. This checks API behavior, not grading quality or browser usability.');
}finally{await mf.dispose();}
