import assert from 'node:assert/strict';
const base=process.env.APP_URL??'http://127.0.0.1:5178';
const code=process.env.PILOT_TEST_TEACHER_CODE??'local-pilot-test';
async function post(path,body,headers={}){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});return {r,d:await r.json()};}
async function read(c,token=c.studentToken){const r=await fetch(`${base}/api/classroom?id=${c.id}&studentId=${c.studentId}`,{headers:{Authorization:`Bearer ${token}`}});return {r,d:await r.json()};}
for(const path of ['/','/try','/studio'])assert.equal((await fetch(base+path)).status,200);
assert.notEqual((await post('/api/classroom',{action:'create'})).r.status,200);
assert.notEqual((await post('/api/classroom',{action:'try'},{Origin:'https://untrusted.example'})).r.status,200);
assert.notEqual((await post('/api/teacher-access',{code:'wrong'})).r.status,200);
const login=await post('/api/teacher-access',{code});assert.equal(login.r.status,200);
const cookie=login.r.headers.get('set-cookie').split(';')[0];
const {d:teacher,r:created}=await post('/api/classroom',{action:'create'},{Cookie:cookie});assert.equal(created.status,200);assert.ok(teacher.teacherToken);
const {d:trial,r:tr}=await post('/api/classroom',{action:'try'});assert.equal(tr.status,200);assert.equal(trial.teacherToken,undefined);assert.equal(trial.inviteToken,undefined);
const trialRead=await read(trial);assert.equal(trialRead.r.status,200);assert.deepEqual(trialRead.d.students,[]);
assert.notEqual((await post('/api/classroom',{action:'scenario',id:trial.id,scenario:true},{Authorization:`Bearer ${trial.studentToken}`})).r.status,200);
const {d:a}=await post('/api/classroom',{action:'join',id:teacher.id,name:'Test A'},{Authorization:`Bearer ${teacher.inviteToken}`});
assert.equal(a.teacherToken,undefined);assert.equal(a.inviteToken,undefined);
const {d:b}=await post('/api/classroom',{action:'join',id:teacher.id,name:'Test B'},{Authorization:`Bearer ${teacher.inviteToken}`});
assert.equal((await read(a)).r.status,200);assert.notEqual((await read(a,b.studentToken)).r.status,200);
const evidence=(await read(a)).d.world.evidence[0].id;
assert.equal((await post('/api/classroom',{action:'collect',id:a.id,studentId:a.studentId,evidenceId:evidence},{Authorization:`Bearer ${a.studentToken}`})).r.status,200);
assert.ok((await read(a)).d.student.evidence.includes(evidence));assert.deepEqual((await read(b)).d.student.evidence,[]);
const teacherRead=await read(teacher,teacher.teacherToken);assert.equal(teacherRead.d.students.filter(x=>x.id===a.studentId||x.id===b.studentId).length,2);
if(process.env.PILOT_TEST_AI_DISABLED==='1'){
 const disabled=await post('/api/classroom',{action:'talk',id:trial.id,studentId:trial.studentId,npc:'harbor',scenario:false,message:'What evidence supports this explanation?',requestId:crypto.randomUUID()},{Authorization:`Bearer ${trial.studentToken}`});
 assert.notEqual(disabled.r.status,200);assert.match(disabled.d.error,/paused/);
}
console.log('PASS public pages, teacher gate, origin guard, isolated trials, invitation joins, cross-student denial, and persisted evidence.');
