import assert from 'node:assert/strict';
import {sourceVersion,materials} from '../lib/learning.ts';
const base=process.env.APP_URL||'http://127.0.0.1:5193';
async function call(url,body,token){const r=await fetch(base+url,{method:body?'POST':'GET',headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{})},body:body?(body instanceof FormData?body:JSON.stringify(body)):undefined});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
const source=`Ada believed the bridge belonged to everyone. Rowan argued that the builder should charge a toll because wood and labour cost money. At the town meeting, a child asked who would carry medicine across the river if the toll was too high. The council paused the vote to hear from the ferryman.

The ferryman described winter floods. He said that his boat carried travellers without charge during emergencies, but that he could not ferry everyone every day. Ada proposed a shared fund. Rowan asked who would contribute and whether poor families would be heard. Neither offered an exact budget.

The narrator records the questions without declaring a winner. At dusk, Ada and Rowan carried a broken plank back to the workshop together. The unfinished ending invites readers to consider both care for neighbours and the labour required to maintain a public bridge.`;
const original=await call('/api/classroom',{action:'create'}),endpoint=`/api/lesson-builder?id=${original.id}`;
const form=new FormData();form.set('title','The Unfinished Bridge — original test story');form.set('text',source);form.set('range','Complete supplied excerpt');form.set('objective','Use textual detail to compare interpretations of the unfinished ending.');
let draft=await call(endpoint,form,original.teacherToken);draft=await call(endpoint,{action:'generate',draftId:draft.id},original.teacherToken);assert.equal(draft.world.lessonPack.subject,'literature');assert.ok(draft.world.evidence.every(e=>source.includes(e.text)));
const c=await call(endpoint,{action:'launch',draftId:draft.id,reviewed:true},original.teacherToken);
const learner=await call('/api/classroom',{action:'join',id:c.id,name:'Literature learner'},c.inviteToken);
await call('/api/classroom',{action:'predict',id:c.id,studentId:learner.studentId,text:'The ending might show Ada winning the dispute.'},learner.studentToken);
const citations=[];
for(const e of draft.world.evidence){await call('/api/classroom',{action:'collect',id:c.id,studentId:learner.studentId,evidenceId:e.id},learner.studentToken);const m=materials(e)[0];citations.push({evidenceId:e.id,material:m.id,sourceVersion:await sourceVersion(e),start:0,end:m.text.length,quote:m.text,relevance:'The narrator leaves the dispute unresolved while showing shared work.'});}
const claim='The ending suggests cooperation without resolving the dispute. Ada and Rowan carry a broken plank together, so shared work survives their disagreement about tolls. However, the narrator declares no winner and neither side offers an exact budget. The gesture could suggest solidarity rather than agreement; it cannot prove that Rowan accepts Ada’s funding proposal.';
const input={action:'argue',id:c.id,studentId:learner.studentId,requestId:crypto.randomUUID(),npc:'library',scenario:false,claim,citations};
const first=await call('/api/classroom',input,learner.studentToken);assert.equal(first.evaluation.unlocked,true,JSON.stringify(first.evaluation));
const revision=await call('/api/classroom',{...input,requestId:crypto.randomUUID(),revisesTurnId:first.turn.id,claim:claim+' The paused vote reinforces that unresolved policy question: practical cooperation is not the same as a settled argument.',reflection:'I changed my initial winner interpretation because the narrator leaves the vote unresolved; the shared plank supports cooperation but not agreement.'},learner.studentToken);
assert.equal(revision.turn.revisionChanged,true);
const snapshot=await call(`/api/classroom?id=${c.id}&studentId=${learner.studentId}`,null,learner.studentToken);assert.equal(snapshot.student.turns.length,2);assert.equal(snapshot.student.turns[1].citations.length,citations.length);assert.ok(snapshot.student.prediction);
const teacher=await call(`/api/classroom?id=${c.id}`,null,c.teacherToken);assert.equal(teacher.students.find(s=>s.id===learner.studentId).turns[1].revisesTurnId,first.turn.id);
console.log(JSON.stringify({passed:true,checks:'generated literature lesson, canonical source review, launch, prediction, supported alternative reading, citations, revision and teacher history',responseIds:[draft.run.responseId,first.evaluation.responseId,revision.evaluation.responseId]}));
