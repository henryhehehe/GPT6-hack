import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
const packetVersion=JSON.parse(readFileSync(new URL('../lib/curriculum/packets.json',import.meta.url),'utf8')).version;
const base=process.env.SMOKE_BASE_URL??'http://localhost:5173';
const isolated=process.argv.includes('--local-isolated');
if(isolated&&!['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname))throw new Error('--local-isolated requires a loopback server with a disposable test database.');
// Local Wrangler accepts the edge client header. Give each test case its own
// synthetic visitor; hosted requests never receive this header from the script.
const runId=randomUUID().replaceAll('-','').slice(0,8),visitorHeaders={};let visitor=0;
function nextVisitor(){if(isolated)visitorHeaders['CF-Connecting-IP']=`2001:db8:${runId.slice(0,4)}:${runId.slice(4)}::${++visitor}`;}
nextVisitor();
async function post(path,body,token){const r=await fetch(base+path,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...visitorHeaders,...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
function sameAccess(actual,expected){for(const key of ['id','teacherToken','inviteToken','studentId','studentToken'])assert.ok(typeof actual[key]==='string'&&actual[key]===expected[key],`Launch retry changed ${key}; credentials omitted.`);}
const original=(await post('/api/classroom',{action:'create'})).data;
assert.ok(original.teacherToken);
const path=`/api/lesson-builder?id=${original.id}`;
const denied=await post(path,{action:'catalog',draftId:randomUUID(),lessonId:'odyssey-ix-01'},original.studentToken);
assert.notEqual(denied.status,200);
const invalid=await post(path,{action:'catalog',draftId:randomUUID(),lessonId:'not-a-lesson'},original.teacherToken);
assert.notEqual(invalid.status,200);
for(const lessonId of ['alexandria-02','odyssey-ix-02','austen-letter-02','seneca-falls-01','christmas-carol-03','tempest-03','douglass-literacy-01','declaration-01','frankenstein-01','frankenstein-03']){
 nextVisitor();
 const draftId=randomUUID();const body={action:'catalog',draftId,lessonId};
 const first=await post(path,body,original.teacherToken);assert.equal(first.status,200,JSON.stringify(first.data));
 assert.equal(first.data.world.lessonPack.curriculum.lessonId,lessonId);
 assert.ok(first.data.world.lessonPack.curriculum.teachingNotes.length);
 if(lessonId==='christmas-carol-03')assert.ok(first.data.world.evidence.find(e=>e.id==='46-420-0').text.endsWith('sage and onion to the eyebrows!'));
 if(lessonId==='tempest-03')assert.match(first.data.world.evidence.find(e=>e.id==='1540-170-0').context.editorialNote,/Folger assigns it to Miranda/);
 const retry=await post(path,body,original.teacherToken);assert.deepEqual(retry.data,first.data);
 const changed=await post(path,{...body,lessonId:'macbeth-01'},original.teacherToken);assert.notEqual(changed.status,200);
 const blocked=await post(path,{action:'launch',draftId,reviewed:false},original.teacherToken);assert.notEqual(blocked.status,200);
 const launch=await post(path,{action:'launch',draftId,reviewed:true},original.teacherToken);assert.equal(launch.status,200);
 const c=launch.data;assert.notEqual(c.id,original.id);
 const repeated=await post(path,{action:'launch',draftId,reviewed:true},original.teacherToken);assert.equal(repeated.status,200,repeated.data.error);sameAccess(repeated.data,c);
 const read=await fetch(`${base}/api/classroom?id=${c.id}&studentId=${c.studentId}`,{headers:{Authorization:`Bearer ${c.studentToken}`}});
 const snapshot=await read.json();assert.equal(snapshot.world.lessonPack.curriculum.lessonId,lessonId);
 const prepared=first.data.world;
 assert.equal(snapshot.world.lessonPack.curriculum.version,packetVersion);
 assert.deepEqual(snapshot.world.evidence,prepared.evidence);
 assert.equal(snapshot.world.lessonPack.readingRange,prepared.lessonPack.readingRange);
 if(['alexandria-02','seneca-falls-01','tempest-03','douglass-literacy-01','declaration-01'].includes(lessonId))assert.ok(snapshot.world.evidence.some(e=>e.context?.readingNote&&e.context.references?.length));
 const collect=await post('/api/classroom',{action:'collect',id:c.id,studentId:c.studentId,evidenceId:snapshot.world.evidence[0].id},c.studentToken);assert.equal(collect.status,200);
 if(snapshot.world.lessonPack.curriculum.mode!=='counterfactual'){
  assert.notEqual((await post('/api/classroom',{action:'scenario',id:c.id,scenario:true},c.teacherToken)).status,200);
  assert.notEqual((await post('/api/classroom',{action:'talk',id:c.id,studentId:c.studentId,scenario:true},c.studentToken)).status,200);
 }
 assert.notEqual((await post('/api/classroom',{action:'author',id:c.id,lesson:'do not call a model',intervention:'replace'},c.teacherToken)).status,200);
 console.log(`PASS ${lessonId}: source draft, retries, teacher review, fresh launch, collection, and mode boundary`);
}
const check=await fetch(`${base}/api/classroom?id=${original.id}&studentId=${original.studentId}`,{headers:{Authorization:`Bearer ${original.teacherToken}`}});
const unchanged=await check.json();assert.equal(unchanged.version,1);assert.equal(unchanged.world.lessonPack,undefined);
console.log('PASS original classroom preserved. No model calls or credentials logged.');
