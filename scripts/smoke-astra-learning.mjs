import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import WebSocket from 'ws';

// Uses six paid Astra reservations in one isolated local classroom. Never changes quotas.
if(!process.argv.includes('--live'))throw new Error('Pass --live to run the six-reservation Astra check.');
const base=new URL(process.env.APP_URL||'http://localhost:5173');
if(!['localhost','127.0.0.1','[::1]'].includes(base.hostname))throw new Error('This smoke creates synthetic learner work and runs only on a local server.');
const report={checkedAt:new Date().toISOString(),checks:[]};
const visitor=`astra-learning-${crypto.randomUUID()}`;
async function api(body,token){
 const response=await fetch(new URL('/api/classroom',base),{method:'POST',headers:{'Content-Type':'application/json','CF-Connecting-IP':visitor,...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(80000)});
 const data=await response.json();if(!response.ok)throw new Error(data.error||`Request failed: ${response.status}`);return data;
}
const access=await api({action:'try'});
await mkdir('artifacts/private',{recursive:true});await writeFile('artifacts/private/astra-learning-access.json',JSON.stringify(access),{mode:0o600});
const act=(action,body={},teacher=false)=>api({action,id:access.id,studentId:access.studentId,...body},teacher?access.teacherToken:access.studentToken);
async function read(){const response=await fetch(new URL(`/api/classroom?id=${access.id}&studentId=${access.studentId}`,base),{headers:{Authorization:`Bearer ${access.studentToken}`}});assert.equal(response.status,200);return response.json();}
const record=(name,data)=>{report.checks.push({name,...data});console.log(JSON.stringify({name,...data}));};
try{
 for(const evidenceId of ['strabo','ledger','funding'])await act('collect',{evidenceId});
 const claim='The library will definitely close because fewer ships must mean there is no money for any scholars.';
 const assessment=await act('argue',{claim,npc:'library',scenario:true,requestId:crypto.randomUUID()});
 record('argument',{responseId:assessment.evaluation.responseId,latencyMs:assessment.evaluation.latencyMs,score:assessment.evaluation.score});
 const dialogue=await act('talk',{npc:'library',scenario:true,requestId:crypto.randomUUID(),message:'Help me rethink my latest saved answer. What is the weakest inference I made? Ask one question without writing my answer.'});
 assert.ok(dialogue.turn.result.reply.length>0);record('learner-aware dialogue',{responseId:dialogue.turn.responseId,latencyMs:dialogue.turn.latencyMs,reply:dialogue.turn.result.reply});
 const note={objectId:'cma-142026',observation:'I see a human profile on one side of the coin.',interpretation:'This proves every scholar in Alexandria was paid directly by the ruler.',question:'Can a coin actually tell us how scholars were funded?'};
 const saved=await act('museum-note',{note,baseRevision:0});
 const critique=await act('museum-feedback',{objectId:note.objectId,baseRevision:saved.note.revision});
 assert.equal(critique.note.feedback.noteRevision,saved.note.revision);
 const replay=await act('museum-feedback',{objectId:note.objectId,baseRevision:saved.note.revision});assert.equal(replay.note.feedback.responseId,critique.note.feedback.responseId);
 record('museum vision and cached replay',{...critique.note.feedback});
 const before=await read();
 const preview=await act('director',{sceneEdit:true,instruction:'Bring ships back to full activity. Keep the market quiet and scholar support low. Explain the assumptions, not as historical facts. Ask students whether trade recovery alone guarantees scholar support.'},true);
 assert.equal(preview.patch.scene.nodes.length,3);assert.equal((await read()).version,before.version);
 record('standard scene preview',{responseId:preview.patch.responseId,latencyMs:preview.patch.latencyMs,scene:preview.patch.scene});
 await act('apply',preview,true);const applied=await read();assert.equal(applied.state.scenario,true);assert.deepEqual(applied.world.evidence,before.world.evidence);assert.deepEqual(applied.student,before.student);
 await act('apply',preview,true);assert.equal((await read()).version,applied.version);
 const steered=await new Promise((resolve,reject)=>{
  const url=new URL('/api/director',base);url.protocol=base.protocol==='https:'?'wss:':'ws:';
  const socket=new WebSocket(url);let sent=false,accepted=false;
  const timer=setTimeout(()=>{socket.close();reject(new Error('Live scene steering timed out'));},80000);
  const stop=error=>{clearTimeout(timer);socket.close();if(error)reject(error);};
  socket.on('open',()=>socket.send(JSON.stringify({type:'start',id:access.id,token:access.teacherToken,studentId:access.studentId,sceneEdit:true,instruction:'Make all three districts busy again and ask a useful reasoning question.'})));
  socket.on('message',raw=>{try{const event=JSON.parse(String(raw));if(event.type==='ready'&&!sent){sent=true;socket.send(JSON.stringify({type:'steer',input:'Correction: keep harbor and market at activity 0.1, but set library activity to 0.9 because a hypothetical patron replaces lost support. Include the words replacement patron in the question.'}));}if(event.type==='steered')accepted=true;if(event.type==='error')stop(new Error(event.error));if(event.type==='result'){assert.equal(accepted,true);assert.equal(event.steered,true);assert.match(event.result.patch.question,/replacement patron/i);stop();resolve(event.result);}}catch(error){stop(error);}});
  socket.on('error',stop);
 });
 await act('apply',steered,true);const final=await read();assert.deepEqual(final.student,before.student);assert.deepEqual(final.world.evidence,before.world.evidence);
 record('steered scene applied; sources and learner work preserved',{responseId:steered.patch.responseId,latencyMs:steered.patch.latencyMs,scene:steered.patch.scene});
 report.passed=true;
}catch(error){report.passed=false;report.error=error.message;throw error;}
finally{await writeFile('artifacts/astra-learning-live.json',JSON.stringify(report,null,2));}
