import assert from 'node:assert/strict';
const base=process.env.APP_URL??'http://127.0.0.1:5178';
async function post(path,body,headers={}){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});const text=await r.text();let d;try{d=JSON.parse(text);}catch{assert.equal(r.ok,false,`${path} returned a successful non-JSON response`);d={error:`HTTP ${r.status} (non-JSON response)`};}return {r,d};}
async function read(c,token=c.studentToken){const r=await fetch(`${base}/api/classroom?id=${c.id}&studentId=${c.studentId}`,{headers:{Authorization:`Bearer ${token}`}});return {r,d:await r.json()};}
for(const path of ['/','/try','/studio'])assert.equal((await fetch(base+path)).status,200);
assert.notEqual((await post('/api/classroom',{action:'try'},{Origin:'https://untrusted.example'})).r.status,200);
// Recording and hackathon visitors enter directly, without a login cookie or code.
const {d:teacher,r:created}=await post('/api/classroom',{action:'create'});assert.equal(created.status,200,teacher.error);assert.ok(teacher.teacherToken);assert.ok(teacher.inviteToken);
const preview=await read(teacher);assert.equal(preview.r.status,200);assert.ok(preview.d.student);assert.deepEqual(preview.d.students,[]);
assert.equal((await post('/api/classroom',{action:'scenario',id:teacher.id,scenario:true},{Authorization:`Bearer ${teacher.teacherToken}`})).r.status,200);
assert.equal((await read(teacher)).d.state.scenario,true,'student preview follows the teacher scenario');
const {d:trial,r:tr}=await post('/api/classroom',{action:'try'});assert.equal(tr.status,200);assert.equal(trial.teacherToken,undefined);assert.equal(trial.inviteToken,undefined);
const trialRead=await read(trial);assert.equal(trialRead.r.status,200);assert.deepEqual(trialRead.d.students,[]);
assert.notEqual((await post('/api/classroom',{action:'scenario',id:trial.id,scenario:true},{Authorization:`Bearer ${trial.studentToken}`})).r.status,200);
const {d:a}=await post('/api/classroom',{action:'join',id:teacher.id,name:'Test A'},{Authorization:`Bearer ${teacher.inviteToken}`});
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
console.log('PASS public pages, no-code studio creation, student preview, shared scenario, origin guard, isolated trials, invitation joins, cross-student denial, and persisted evidence.');
