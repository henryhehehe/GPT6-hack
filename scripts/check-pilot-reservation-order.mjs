// Offline integration regression against the actual built Worker. No real keys or network egress.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {Miniflare,Response as WorkerResponse} from 'miniflare';
const root=path.resolve('dist/server');
const files=await readdir(root,{recursive:true});
const modules=await Promise.all(['index.js',...files.filter(f=>f.endsWith('.js')&&f!=='index.js')].map(async f=>({type:'ESModule',path:path.join(root,f),contents:await readFile(path.join(root,f),'utf8')})));
let intercepted=0;
const mf=new Miniflare({name:'pilot-reservation-regression',modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],host:'127.0.0.1',port:0,bindings:{PILOT_TEACHER_CODE:'offline-regression-code',PILOT_AI_REQUEST_LIMIT:'30',OPENAI_API_KEY:'offline-test-key'},d1Databases:{DB:'pilot-reservation-regression'},r2Buckets:['BUCKET'],assets:{directory:path.resolve('dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},outboundService:async()=>{
 intercepted++;return new WorkerResponse(JSON.stringify({error:{message:'Offline regression: outbound request intercepted'}}),{status:503,headers:{'Content-Type':'application/json'}});
}});
try{
 await mf.ready;const db=await mf.getD1Database('DB');
 for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile(path.join('drizzle',file),'utf8')).replace(/--[^\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
 const post=async(endpoint,body,token,cookie)=>{
  const response=await mf.dispatchFetch(`http://localhost${endpoint}`,{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
  return {status:response.status,data:await response.json(),headers:response.headers};
 };
 const used=async id=>(await db.prepare('SELECT used FROM pilot_usage WHERE id=?').bind(id).first())?.used??0;
 const login=await post('/api/teacher-access',{code:'offline-regression-code'});assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie').split(';')[0];
 const created=await post('/api/classroom',{action:'create'},undefined,cookie);assert.equal(created.status,200);const c=created.data;
 for(const [token,name] of [['invalid-invitation','A'],[c.inviteToken,''],[c.inviteToken,'x'.repeat(36)]]){
  const invalid=await post('/api/classroom',{action:'join',id:c.id,name},token);assert.equal(invalid.status,400);assert.equal(await used(`joins:${c.id}`),0,'Invalid joins must not consume class capacity');
 }
 const joined=await post('/api/classroom',{action:'join',id:c.id,name:'Synthetic learner'},c.inviteToken);assert.equal(joined.status,200);assert.equal(await used(`joins:${c.id}`),1);const student=joined.data;
 const author={action:'author',id:c.id,lesson:'x'.repeat(100),intervention:'What if trade changed?'};
 for(const input of [{...author,lesson:'short'},{...author,intervention:''}]){
  assert.equal((await post('/api/classroom',input,c.teacherToken)).status,400);assert.equal(await used(`ai:class:${c.id}`),0,'Invalid author input must not consume AI allowance');
 }
 assert.equal((await post('/api/classroom',{action:'predict',id:c.id,studentId:student.studentId,text:'An alternative patron might help.'},student.studentToken)).status,200);
 const blocked=await post('/api/classroom',author,c.teacherToken);assert.equal(blocked.status,400);assert.match(blocked.data.error,/Students have started/);assert.equal(await used(`ai:class:${c.id}`),0,'Progress-locked generation must not consume AI allowance');
 const draftId=crypto.randomUUID(),builder=`/api/lesson-builder?id=${c.id}`;
 assert.equal((await post(builder,{action:'catalog',draftId,lessonId:'austen-letter-01'},c.teacherToken)).status,200);
 const launch=await post(builder,{action:'launch',draftId,reviewed:true},c.teacherToken);assert.equal(launch.status,200);const lesson=launch.data;
 assert.equal((await post('/api/classroom',{...author,id:lesson.id},lesson.teacherToken)).status,400);assert.equal(await used(`ai:class:${lesson.id}`),0,'Reviewed lessons cannot consume AI allowance via forbidden reauthoring');
 const director={action:'director',id:c.id,studentId:student.studentId,instruction:'Help this learner consider another explanation.'};
 const invalid=await post('/api/classroom',{...director,instruction:'x'},c.teacherToken);assert.equal(invalid.status,400);assert.equal(await used(`ai:class:${c.id}`),0,'Invalid director input must not consume AI allowance');
 assert.equal(await used('ai:pilot-v1'),0);assert.equal(intercepted,0,'Rejected requests must never reach the model transport');
 // Genuine upstream attempts still reserve both counters, even when that upstream fails.
 for(let i=1;i<=6;i++){
  const attempt=await post('/api/classroom',director,c.teacherToken);assert.equal(attempt.status,400);assert.match(attempt.data.error,/Astra request failed/);assert.equal(await used(`ai:class:${c.id}`),i);assert.equal(await used('ai:pilot-v1'),i);assert.equal(intercepted,i);
 }
 const capped=await post('/api/classroom',director,c.teacherToken);assert.equal(capped.status,400);assert.match(capped.data.error,/six pilot AI requests/);assert.equal(await used(`ai:class:${c.id}`),6);assert.equal(await used('ai:pilot-v1'),6);assert.equal(intercepted,6);
 console.log('PASS actual Worker: rejected invitations, invalid inputs, progress locks and reviewed lessons preserve capacity; genuine attempts remain capped at six. All outbound requests intercepted locally.');
}finally{await mf.dispose();}
