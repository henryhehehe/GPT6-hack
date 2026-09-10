import type {InterventionPreview} from '../lib/interventionContext';
import type {MuseumNote} from '../lib/museumNotes';
import {test,after,mock} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {initialWorld,type StudentState} from '../lib/world';
import {loadInterventionContext} from '../lib/interventionContext';

// Run the actual Worker handlers offline. Only runtime bindings and upstream transport are substituted.
const testEnv:Record<string,unknown>={OPENAI_API_KEY:'offline-test-key',PILOT_AI_REQUEST_LIMIT:'100'};
(globalThis as unknown as {__interventionTestEnv:unknown}).__interventionTestEnv=testEnv;
const hooks=registerHooks({resolve(specifier,context,next){return specifier==='cloudflare:workers'?{url:'data:text/javascript,export const env = globalThis.__interventionTestEnv;',shortCircuit:true}:next(specifier,context);}});
const {POST,GET:readClassroom}=await import('../app/api/classroom/route');
const {GET}=await import('../app/api/director/route');
after(()=>{hooks.deregister();delete (globalThis as unknown as {__interventionTestEnv?:unknown}).__interventionTestEnv;});

const classId='10000000-0000-4000-8000-000000000001',otherClass='10000000-0000-4000-8000-000000000002';
const learnerA='20000000-0000-4000-8000-000000000001',learnerB='20000000-0000-4000-8000-000000000002',foreign='20000000-0000-4000-8000-000000000003';
const hint={title:'Look for another source of support',text:'Compare the explicit funding assumption with the source account.',question:'Could a patron change this outcome?',zone:'library'};
function state(name:string,claim:string):StudentState{return {name,zone:'library',evidence:['strabo'],unlocked:false,turns:[{claim,npc:'library',at:'2026-09-10T18:00:00Z',worldVersion:3,scenario:true,result:{reply:'Reconsider.',items:[],evidenceIds:['strabo'],nextQuestion:'What assumption matters?',score:0,unlocked:false,responseId:'not-needed-by-model',latencyMs:1}}],dialogue:[]};}
function fixture(){
  const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE classrooms(id TEXT PRIMARY KEY, teacher_token TEXT, invite_token TEXT, world TEXT, state TEXT, version INTEGER, lesson TEXT, created_at TEXT); CREATE TABLE students(id TEXT PRIMARY KEY,class_id TEXT,token TEXT,state TEXT,revision INTEGER); CREATE TABLE pilot_usage(id TEXT PRIMARY KEY,used INTEGER NOT NULL DEFAULT 0);');
  for(const id of [classId,otherClass])sql.prepare('INSERT INTO classrooms VALUES (?,?,?,?,?,?,?,?)').run(id,'teacher-secret','invite-secret',JSON.stringify(initialWorld),JSON.stringify({scenario:false,hint:null,run:null}),4,'source','2026-09-10');
  for(const [id,room,name,claim] of [[learnerA,classId,'A','A thinks trade is the only support.'],[learnerB,classId,'B','B argues a patron could replace lost trade income.'],[foreign,otherClass,'Foreign','Private answer from another class.']])sql.prepare('INSERT INTO students VALUES (?,?,?,?,?)').run(id,room,'student-secret',JSON.stringify(state(name,claim)),7);
  testEnv.DB={async batch(statements:{run:()=>Promise<unknown>}[]){return Promise.all(statements.map(statement=>statement.run()));},prepare(query:string){const stmt=sql.prepare(query);let params:unknown[]=[];return {bind(...values:unknown[]){params=values;return this;},async first(){return stmt.get(...params as never[])??null;},async all(){return {results:stmt.all(...params as never[])};},async run(){const result=stmt.run(...params as never[]);return {meta:{changes:Number(result.changes)}};}};}};
  return {sql,quotaCount:()=>Number((sql.prepare('SELECT COUNT(*) AS count FROM pilot_usage').get() as {count:number}).count)};
}
function request(studentId:unknown,token='teacher-secret') {return new Request('https://class.test/api/classroom',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'director',id:classId,studentId,instruction:'Help the learner test a different explanation.',student:{name:'Forged student',turns:[{claim:'CLIENT FORGERY'}]}})});}

test('intervention input bounds history and omits identity, dialogue, and transport metadata',async t=>{
  const f=fixture();t.after(()=>f.sql.close());const learner=state('B','Answer');
  learner.turns=Array.from({length:8},(_,i)=>({...learner.turns[0],claim:`Answer ${i}`}));
  f.sql.prepare('UPDATE students SET state=? WHERE id=?').run(JSON.stringify({...learner,dialogue:[{message:'Private conversation'}]}),learnerB);
  const context=await loadInterventionContext(testEnv.DB as D1Database,{id:classId,studentId:learnerB,token:'teacher-secret',instruction:'Help with the latest reasoning.'});
  assert.deepEqual(context.input.student.turns.map(turn=>turn.claim),['Answer 5','Answer 6','Answer 7']);
  const text=JSON.stringify(context.input);assert.ok(!text.includes('Private conversation'));assert.ok(!text.includes('not-needed-by-model'));assert.equal('name' in context.input.student,false);
});

test('HTTP director uses B’s stored work, preserves its scenario, and returns private preview provenance',async t=>{
  const f=fixture();t.after(()=>f.sql.close());let modelInput:Record<string,unknown>|undefined;
  const fetchMock=mock.method(globalThis,'fetch',async(_url:RequestInfo|URL,init?:RequestInit)=>{modelInput=JSON.parse(JSON.parse(String(init?.body)).input);return Response.json({id:'response-test',status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(hint)}]}]});});t.after(()=>fetchMock.mock.restore());
  const response=await POST(request(learnerB));assert.equal(response.status,200);const result=await response.json() as {learner:{id:string;name:string;revision:number};classroomId:string;audience:string;baseVersion:number;patch:Record<string,unknown>};
  assert.deepEqual(result.learner,{id:learnerB,name:'B',revision:7});assert.equal(result.classroomId,classId);assert.equal(result.baseVersion,4);assert.equal(result.audience,'classroom');
  const input=modelInput as {scenario:boolean;student:{turns:{claim:string;scenario:boolean;worldVersion:number}[]}};
  assert.equal(input.student.turns[0].claim,'B argues a patron could replace lost trade income.');assert.equal(input.student.turns[0].scenario,true);assert.equal(input.student.turns[0].worldVersion,3);assert.equal(input.scenario,false);
  assert.ok(!JSON.stringify(modelInput).includes('CLIENT FORGERY'));assert.ok(!JSON.stringify(modelInput).includes('student-secret'));assert.ok(!JSON.stringify(modelInput).includes('A thinks'));
  assert.equal('learner' in result.patch,false);assert.equal(fetchMock.mock.callCount(),1);
  const applied=await POST(new Request('https://class.test/api/classroom',{method:'POST',headers:{Authorization:'Bearer teacher-secret','Content-Type':'application/json'},body:JSON.stringify({action:'apply',id:classId,...result})}));
  assert.equal(applied.status,200);
  const studentResponse=await readClassroom(new Request(`https://class.test/api/classroom?id=${classId}&studentId=${learnerA}`,{headers:{Authorization:'Bearer student-secret'}}));
  const studentView=await studentResponse.json() as {state:{hint:Record<string,unknown>}};
  assert.equal(studentView.state.hint.title,hint.title);assert.equal('learner' in studentView.state.hint,false);assert.ok(!JSON.stringify(studentView).includes('B argues'));assert.equal(fetchMock.mock.callCount(),1);
});

test('HTTP invalid or foreign learner and non-teacher requests use no quota or upstream call',async t=>{
  const f=fixture();t.after(()=>f.sql.close());const fetchMock=mock.method(globalThis,'fetch',async()=>{throw new Error('Unexpected network call');});t.after(()=>fetchMock.mock.restore());
  for(const [studentId,token] of [[undefined,'teacher-secret'],['invalid','teacher-secret'],[foreign,'teacher-secret'],[learnerB,'student-secret']])assert.equal((await POST(request(studentId,token))).status,400);
  assert.equal(fetchMock.mock.callCount(),0);assert.equal(f.quotaCount(),0);
});

class Socket {
  sent:Record<string,unknown>[]=[];closed=false;handlers=new Map<string,((event:{data:string})=>unknown)[]>();
  accept(){} send(data:string){this.sent.push(JSON.parse(data));}
  addEventListener(type:string,handler:(event:{data:string})=>unknown){this.handlers.set(type,[...(this.handlers.get(type)??[]),handler]);}
  async receive(data:unknown){for(const handler of this.handlers.get('message')??[])await handler({data:JSON.stringify(data)});}
  close(){if(this.closed)return;this.closed=true;for(const handler of this.handlers.get('close')??[])handler({data:''});}
}
function sockets(){
  const NativeResponse=globalThis.Response;
  let server:Socket;
  class Pair {0=new Socket();1=new Socket();constructor(){server=this[1];}}
  class WorkerResponse extends NativeResponse {constructor(body:BodyInit|null,init:ResponseInit){super(body,init?.status===101?{status:200}:init);Object.assign(this,{webSocket:(init as {webSocket?:unknown}).webSocket});}}
  const responseMock=mock.method(globalThis,'Response',WorkerResponse);
  const workerGlobals=globalThis as unknown as {WebSocketPair:typeof WebSocketPair};
  const previous=workerGlobals.WebSocketPair;workerGlobals.WebSocketPair=Pair as unknown as typeof WebSocketPair;
  return {server:()=>server,restore(){responseMock.mock.restore();workerGlobals.WebSocketPair=previous;}};
}
test('WebSocket director resolves B from storage and labels the completed preview with the frozen learner',async t=>{
  const f=fixture(),runtime=sockets(),upstream=new Socket();t.after(()=>{runtime.restore();f.sql.close();});
  const fetchMock=mock.method(globalThis,'fetch',async()=>({status:101,webSocket:upstream} as unknown as Response));t.after(()=>fetchMock.mock.restore());
  await GET(new Request('https://class.test/api/director',{headers:{Upgrade:'websocket'}}));
  await runtime.server().receive({type:'start',id:classId,token:'teacher-secret',studentId:learnerB,instruction:'Help test another explanation.',student:{claim:'CLIENT FORGERY'}});
  const input=JSON.parse(String(upstream.sent[0].input));assert.equal(input.student.turns[0].claim,'B argues a patron could replace lost trade income.');assert.ok(!JSON.stringify(input).includes('CLIENT FORGERY'));
  // A new submission after generation starts must not relabel the earlier context.
  f.sql.prepare('UPDATE students SET state=?,revision=8 WHERE id=?').run(JSON.stringify(state('Renamed B','New answer')),learnerB);
  await upstream.receive({type:'response.created',response:{id:'response-ws'}});
  await upstream.receive({type:'response.completed',response:{id:'response-ws',output:[{content:[{type:'output_text',text:JSON.stringify(hint)}]}]}});
  const result=runtime.server().sent.find(message=>message.type==='result')?.result as {learner:unknown;audience:string;classroomId:string};
  assert.deepEqual(result.learner,{id:learnerB,name:'B',revision:7});assert.equal(result.audience,'classroom');assert.equal(result.classroomId,classId);assert.equal(fetchMock.mock.callCount(),1);
});
test('WebSocket rejects missing/foreign learner and unauthorized teacher before quota and upstream connection',async t=>{
  const f=fixture(),runtime=sockets();t.after(()=>{runtime.restore();f.sql.close();});const fetchMock=mock.method(globalThis,'fetch',async()=>{throw new Error('Unexpected network call');});t.after(()=>fetchMock.mock.restore());
  for(const [studentId,token] of [[undefined,'teacher-secret'],[foreign,'teacher-secret'],[learnerB,'student-secret']]){
    await GET(new Request('https://class.test/api/director',{headers:{Upgrade:'websocket'}}));
    await runtime.server().receive({type:'start',id:classId,token,studentId,instruction:'Help this learner.'});
    assert.equal(runtime.server().sent.at(-1)?.type,'error');
  }
  assert.equal(fetchMock.mock.callCount(),0);assert.equal(f.quotaCount(),0);
});

test('closing the WebSocket during context lookup stops before quota and upstream connection',async t=>{
  const f=fixture(),runtime=sockets();t.after(()=>{runtime.restore();f.sql.close();});const fetchMock=mock.method(globalThis,'fetch',async()=>{throw new Error('Unexpected network call');});t.after(()=>fetchMock.mock.restore());
  await GET(new Request('https://class.test/api/director',{headers:{Upgrade:'websocket'}}));
  const pending=runtime.server().receive({type:'start',id:classId,token:'teacher-secret',studentId:learnerB,instruction:'Help this learner.'});
  runtime.server().close();await pending;
  assert.equal(fetchMock.mock.callCount(),0);assert.equal(f.quotaCount(),0);
});


test('public trials and invitees retain learner-only access',async t=>{
  const f=fixture();t.after(()=>f.sql.close());const fetchMock=mock.method(globalThis,'fetch',async()=>{throw new Error('Unexpected AI call');});t.after(()=>fetchMock.mock.restore());
  const created=await POST(new Request('https://class.test/api/classroom',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'try'})}));
  assert.equal(created.status,200);
  const guest=await created.json() as {id:string;studentId:string;studentToken:string;teacherToken:string;inviteToken:string};
  assert.equal(guest.teacherToken,undefined);assert.equal(guest.inviteToken,undefined);assert.notEqual(guest.id,classId);
  const owned=await readClassroom(new Request(`https://class.test/api/classroom?id=${guest.id}&studentId=${guest.studentId}`,{headers:{Authorization:`Bearer ${guest.studentToken}`}}));assert.equal(owned.status,200);
  const own=await owned.json() as {students:unknown[]};assert.deepEqual(own.students,[]);
  assert.notEqual((await readClassroom(new Request(`https://class.test/api/classroom?id=${classId}&studentId=${guest.studentId}`,{headers:{Authorization:`Bearer ${guest.studentToken}`}}))).status,200);
  const joined=await POST(new Request('https://class.test/api/classroom',{method:'POST',headers:{Authorization:'Bearer invite-secret','Content-Type':'application/json'},body:JSON.stringify({action:'join',id:classId,name:'Guest learner'})}));
  assert.equal(joined.status,200);const invited=await joined.json() as {studentToken:string;teacherToken?:string;inviteToken?:string};assert.equal(invited.teacherToken,undefined);assert.equal(invited.inviteToken,undefined);
  const denied=await POST(new Request('https://class.test/api/classroom',{method:'POST',headers:{Authorization:`Bearer ${invited.studentToken}`,'Content-Type':'application/json'},body:JSON.stringify({action:'scenario',id:classId,scenario:true})}));assert.equal(denied.status,400);
  assert.equal(fetchMock.mock.callCount(),0);
});

const sceneEdit={appearance:{timeOfDay:'sunset',weather:'hazy',water:'choppy',viewpoint:'harbor'},intervention:'What if ships return but scholar support remains low?',nodes:initialWorld.nodes.map(node=>({id:node.id,activity:node.id==='harbor'?1:.1,consequence:'Activity changes under this hypothetical assumption.',mechanism:'Under the exercise assumption, trade can recover before support.'}))};
function actionRequest(action:string,body:Record<string,unknown>,token='student-secret') {return new Request('https://class.test/api/classroom',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action,id:classId,studentId:learnerA,...body})});}

test('scene preview does not mutate; apply preserves learner work, rejects stale edits and is idempotent',async t=>{
 const f=fixture();t.after(()=>f.sql.close());const before=f.sql.prepare('SELECT state FROM students WHERE id=?').get(learnerA);
 const fetchMock=mock.method(globalThis,'fetch',async()=>Response.json({id:'response-scene',status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({...hint,scene:sceneEdit})}]}]}));t.after(()=>fetchMock.mock.restore());
 const response=await POST(actionRequest('director',{instruction:'Bring ships back but keep scholar support low.',sceneEdit:true},'teacher-secret'));
 assert.equal(response.status,200);const preview=await response.json() as InterventionPreview;assert.deepEqual(preview.patch.scene,sceneEdit);
 assert.equal((f.sql.prepare('SELECT version FROM classrooms WHERE id=?').get(classId) as {version:number}).version,4);
 assert.equal((await POST(actionRequest('apply',preview))).status,400);
 assert.equal((await POST(actionRequest('apply',preview,'teacher-secret'))).status,200);
 assert.equal((await POST(actionRequest('apply',preview,'teacher-secret'))).status,200);
 const row=f.sql.prepare('SELECT world,state,version FROM classrooms WHERE id=?').get(classId) as {world:string;state:string;version:number};
 assert.equal(row.version,5);assert.equal(JSON.parse(row.state).scenario,true);assert.equal(JSON.parse(row.state).sceneRevision,preview.patch.id);assert.equal(JSON.parse(row.world).nodes[0].activity,1);assert.deepEqual(JSON.parse(row.world).evidence,initialWorld.evidence);
 assert.deepEqual(f.sql.prepare('SELECT state FROM students WHERE id=?').get(learnerA),before);
 const stale={...preview,patch:{...preview.patch,id:crypto.randomUUID()}};
 assert.equal((await POST(actionRequest('apply',stale,'teacher-secret'))).status,400);
 const ordinary={baseVersion:5,patch:{...hint,id:crypto.randomUUID(),responseId:'response-hint',latencyMs:1,request:'Ask a question.',kind:'teaching-prop',basis:preview.patch.basis}};
 assert.equal((await POST(actionRequest('apply',ordinary,'teacher-secret'))).status,200);
 assert.equal(JSON.parse((f.sql.prepare('SELECT state FROM classrooms WHERE id=?').get(classId) as {state:string}).state).sceneRevision,preview.patch.id);
});

test('learner-aware dialogue uses only stored learner work and cannot award progress',async t=>{
 const f=fixture();t.after(()=>f.sql.close());let input:Record<string,unknown>|undefined;
 const fetchMock=mock.method(globalThis,'fetch',async(_url:RequestInfo|URL,init?:RequestInit)=>{input=JSON.parse(JSON.parse(String(init?.body)).input);return Response.json({id:'response-dialogue',status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({reply:'What rules out a patron?',followUp:'Check your assumption.',evidenceIds:['strabo'],unlocked:true})}]}]});});t.after(()=>fetchMock.mock.restore());
 const response=await POST(actionRequest('talk',{npc:'library',scenario:false,message:'Help me rethink my answer.',requestId:crypto.randomUUID(),learner:{claim:'CLIENT FORGERY'}}));
 assert.equal(response.status,200);const text=JSON.stringify(input);assert.ok(text.includes('A thinks trade is the only support.'));assert.ok(!text.includes('B argues'));assert.ok(!text.includes('CLIENT FORGERY'));
 const learner=JSON.parse((f.sql.prepare('SELECT state FROM students WHERE id=?').get(learnerA) as {state:string}).state);
 assert.equal(learner.unlocked,false);assert.equal(learner.turns.length,1);assert.deepEqual(learner.evidence,['strabo']);assert.equal(learner.dialogue.length,1);
});

test('museum critique uses canonical image and saved note, caches replay, and rejects stale or foreign notes',async t=>{
 const f=fixture();t.after(()=>f.sql.close());
 const note={objectId:'cma-142026',observation:'A face on a coin.',interpretation:'It proves every scholar had royal funding.',question:'What can the image establish?'};
 const savedResponse=await POST(actionRequest('museum-note',{note,baseRevision:0}));assert.equal(savedResponse.status,200);const saved=(await savedResponse.json() as {note:MuseumNote}).note;
 let payload:Record<string,unknown>|undefined;
 const fetchMock=mock.method(globalThis,'fetch',async(_url:RequestInfo|URL,init?:RequestInit)=>{payload=JSON.parse(String(init?.body));return Response.json({id:'response-museum',status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({observation:'A profile is visible.',interpretation:'Funding is not established by this image.',uncertainty:'The coin cannot identify every scholar’s patron.',question:'Which claim would need another source?'})}]}]});});t.after(()=>fetchMock.mock.restore());
 assert.equal((await POST(actionRequest('museum-feedback',{objectId:note.objectId,baseRevision:999}))).status,400);
 assert.equal((await POST(actionRequest('museum-feedback',{objectId:note.objectId,baseRevision:saved.revision,studentId:foreign}))).status,400);
 assert.equal(fetchMock.mock.callCount(),0);
 const result=await POST(actionRequest('museum-feedback',{objectId:note.objectId,baseRevision:saved.revision,imageUrl:'https://attacker.invalid/image',note:{observation:'FORGED'}}));assert.equal(result.status,200);
 const reviewed=(await result.json() as {note:MuseumNote}).note;assert.equal(reviewed.feedback!.noteRevision,saved.revision);
 const serialized=JSON.stringify(payload);assert.ok(serialized.includes('input_image'));assert.ok(serialized.includes('openaccess-cdn.clevelandart.org'));assert.ok(!serialized.includes('attacker.invalid'));assert.ok(!serialized.includes('FORGED'));
 assert.equal((await POST(actionRequest('museum-feedback',{objectId:note.objectId,baseRevision:saved.revision}))).status,200);assert.equal(fetchMock.mock.callCount(),1);
 const learner=JSON.parse((f.sql.prepare('SELECT state FROM students WHERE id=?').get(learnerA) as {state:string}).state);assert.equal(learner.unlocked,false);assert.equal(learner.turns.length,1);
});

test('WebSocket scene correction uses the successor response and preserves the scene schema',async t=>{
 const f=fixture(),runtime=sockets(),upstream=new Socket();t.after(()=>{runtime.restore();f.sql.close();});
 const fetchMock=mock.method(globalThis,'fetch',async()=>({status:101,webSocket:upstream} as unknown as Response));t.after(()=>fetchMock.mock.restore());
 await GET(new Request('https://class.test/api/director',{headers:{Upgrade:'websocket'}}));
 await runtime.server().receive({type:'start',id:classId,token:'teacher-secret',studentId:learnerA,sceneEdit:true,instruction:'Return ships but keep the market quiet.'});
 assert.ok(JSON.stringify(upstream.sent[0].text).includes('scene'));assert.equal(JSON.parse(String(upstream.sent[0].input)).sceneEdit,true);
 await upstream.receive({type:'response.created',response:{id:'original-scene'}});
 await runtime.server().receive({type:'steer',input:'Keep library activity low too.'});assert.equal(upstream.sent.at(-1)?.type,'response.steer');
 await upstream.receive({type:'response.steer.accepted'});
 await upstream.receive({type:'response.completed',response:{id:'original-scene',output:[{content:[{type:'output_text',text:JSON.stringify(hint)}]}]}});
 assert.equal(runtime.server().sent.some(message=>message.type==='result'),false);
 await upstream.receive({type:'response.created',response:{id:'successor-scene'}});
 await upstream.receive({type:'response.completed',response:{id:'successor-scene',output:[{content:[{type:'output_text',text:JSON.stringify({...hint,scene:sceneEdit})}]}]}});
 const result=runtime.server().sent.find(message=>message.type==='result') as {steered:boolean;result:{patch:{scene:unknown;responseId:string}}};assert.equal(result.steered,true);assert.deepEqual(result.result.patch.scene,sceneEdit);assert.equal(result.result.patch.responseId,'successor-scene');
});

test('reading-world appearance preview and apply preserve lesson mode, sources, learner work and provenance',async t=>{
 const {prepareCatalogLesson}=await import('../lib/curriculum');
 const f=fixture();t.after(()=>f.sql.close());const world=prepareCatalogLesson('austen-letter-01').world!;
 f.sql.prepare('UPDATE classrooms SET world=? WHERE id=?').run(JSON.stringify(world),classId);
 const before=f.sql.prepare('SELECT state FROM students WHERE id=?').get(learnerA);
 const appearance={timeOfDay:'sunset',weather:'clear',water:'calm',viewpoint:'market'};
 let sent:Record<string,unknown>|undefined;
 const fetchMock=mock.method(globalThis,'fetch',async(_url:RequestInfo|URL,init?:RequestInit)=>{sent=JSON.parse(String(init?.body));return Response.json({id:'response-reading-scene',status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({...hint,scene:{appearance}})}]}]});});t.after(()=>fetchMock.mock.restore());
 const response=await POST(actionRequest('director',{instruction:'Warm sunset at the second reading station.',sceneEdit:true},'teacher-secret'));
 assert.equal(response.status,200);const preview=await response.json() as InterventionPreview;
 assert.deepEqual(preview.patch.scene,{appearance});assert.equal(preview.patch.basis?.studentId,learnerA);
 const model=JSON.parse(String(sent!.input));assert.equal(model.sceneCapabilities.activity,false);assert.equal(model.sceneCapabilities.water,false);
 assert.equal((f.sql.prepare('SELECT version FROM classrooms WHERE id=?').get(classId) as {version:number}).version,4);
 assert.equal((await POST(actionRequest('apply',preview,'teacher-secret'))).status,200);
 const saved=f.sql.prepare('SELECT world,state,version FROM classrooms WHERE id=?').get(classId) as {world:string;state:string;version:number};
 assert.deepEqual(JSON.parse(saved.world),JSON.parse(JSON.stringify({...world,sceneAppearance:appearance})));assert.equal(JSON.parse(saved.state).scenario,false);assert.equal(saved.version,5);
 assert.deepEqual(f.sql.prepare('SELECT state FROM students WHERE id=?').get(learnerA),before);
 assert.equal((await POST(actionRequest('apply',preview,'teacher-secret'))).status,200);
 const forged={...preview,baseVersion:5,patch:{...preview.patch,id:crypto.randomUUID(),scene:sceneEdit}};
 assert.equal((await POST(actionRequest('apply',forged,'teacher-secret'))).status,400);
});

test('teacher scene undo is private, preserves newer museum selections and learner work, and costs no AI',async t=>{
 const f=fixture();t.after(()=>f.sql.close());
 const fetchMock=mock.method(globalThis,'fetch',async()=>{throw new Error('Recovery must not call Astra');});t.after(()=>fetchMock.mock.restore());
 const students=f.sql.prepare('SELECT * FROM students ORDER BY id').all();
 const prior={...hint,id:crypto.randomUUID(),responseId:'prior-response',latencyMs:1,request:'PRIVATE TEACHER INSTRUCTION',kind:'teaching-prop',basis:{studentId:learnerB,name:'Private learner name',revision:7}};
 f.sql.prepare('UPDATE classrooms SET state=? WHERE id=?').run(JSON.stringify({scenario:false,hint:prior,run:null}),classId);
 const patch={...prior,id:crypto.randomUUID(),scene:sceneEdit};
 assert.equal((await POST(actionRequest('apply',{patch,baseVersion:4},'teacher-secret'))).status,200);
 const learnerView=await (await readClassroom(new Request(`https://class.test/api/classroom?id=${classId}&studentId=${learnerA}`,{headers:{Authorization:'Bearer student-secret'}}))).json() as {state:Record<string,unknown>};
 assert.equal('sceneUndo' in learnerView.state,false);assert.ok(!JSON.stringify(learnerView).includes('PRIVATE TEACHER'));assert.ok(!JSON.stringify(learnerView).includes('Private learner'));
 assert.equal((await POST(actionRequest('museum',{objectId:'cma-142026',included:true},'teacher-secret'))).status,200);
 const recovery={operation:'undo',requestId:crypto.randomUUID(),baseVersion:6};
 assert.equal((await POST(actionRequest('scene-recover',recovery))).status,400);
 assert.equal((await POST(actionRequest('scene-recover',{...recovery,baseVersion:5},'teacher-secret'))).status,400);
 assert.equal((await POST(actionRequest('scene-recover',recovery,'teacher-secret'))).status,200);
 assert.equal((await POST(actionRequest('scene-recover',recovery,'teacher-secret'))).status,200);
 assert.equal((await POST(actionRequest('scene-recover',{...recovery,operation:'reset-atmosphere'},'teacher-secret'))).status,400);
 const row=f.sql.prepare('SELECT world,state,version FROM classrooms WHERE id=?').get(classId) as {world:string;state:string;version:number};
 assert.deepEqual(JSON.parse(row.world),{...initialWorld,museumObjectIds:['cma-142026']});assert.equal(row.version,7);
 const restored=JSON.parse(row.state);assert.equal(restored.scenario,false);assert.deepEqual(restored.hint,prior);assert.equal(restored.sceneRevision,recovery.requestId);assert.equal(restored.sceneUndo,undefined);
 assert.deepEqual(f.sql.prepare('SELECT * FROM students ORDER BY id').all(),students);assert.equal(fetchMock.mock.callCount(),0);assert.equal(f.quotaCount(),0);
});

test('atmosphere reset can be undone and retains activity, newer challenges and student progress',async t=>{
 const f=fixture();t.after(()=>f.sql.close());const students=f.sql.prepare('SELECT * FROM students ORDER BY id').all();
 const patch={...hint,id:crypto.randomUUID(),responseId:'scene-response',latencyMs:1,request:'Edit scene',kind:'teaching-prop',basis:{studentId:learnerA,name:'A',revision:7},scene:sceneEdit};
 assert.equal((await POST(actionRequest('apply',{patch,baseVersion:4},'teacher-secret'))).status,200);
 const edited=JSON.parse((f.sql.prepare('SELECT world FROM classrooms WHERE id=?').get(classId) as {world:string}).world);
 const newer={...patch,id:crypto.randomUUID(),scene:undefined,title:'A newer classroom question'};
 assert.equal((await POST(actionRequest('apply',{patch:newer,baseVersion:5},'teacher-secret'))).status,200);
 const reset={operation:'reset-atmosphere',requestId:crypto.randomUUID(),baseVersion:6};
 assert.equal((await POST(actionRequest('scene-recover',reset,'teacher-secret'))).status,200);
 let row=f.sql.prepare('SELECT world,state,version FROM classrooms WHERE id=?').get(classId) as {world:string;state:string;version:number};
 assert.equal(JSON.parse(row.world).sceneAppearance,undefined);assert.deepEqual(JSON.parse(row.world).nodes,edited.nodes);assert.equal(JSON.parse(row.state).hint.id,newer.id);assert.equal(JSON.parse(row.state).scenario,true);
 assert.equal((await POST(actionRequest('scene-recover',{operation:'undo',requestId:crypto.randomUUID(),baseVersion:7},'teacher-secret'))).status,200);
 row=f.sql.prepare('SELECT world,state,version FROM classrooms WHERE id=?').get(classId) as typeof row;
 assert.deepEqual(JSON.parse(row.world),edited);assert.equal(JSON.parse(row.state).hint.id,newer.id);assert.equal(row.version,8);
 assert.deepEqual(f.sql.prepare('SELECT * FROM students ORDER BY id').all(),students);assert.equal(f.quotaCount(),0);
});

test('undo keeps an ordinary challenge shared after the scene edit',async t=>{
 const f=fixture();t.after(()=>f.sql.close());
 const patch={...hint,id:crypto.randomUUID(),responseId:'scene-response',latencyMs:1,request:'Edit scene',kind:'teaching-prop',basis:{studentId:learnerA,name:'A',revision:7},scene:sceneEdit};
 assert.equal((await POST(actionRequest('apply',{patch,baseVersion:4},'teacher-secret'))).status,200);
 const newer={...patch,id:crypto.randomUUID(),scene:undefined,title:'Newer question'};
 assert.equal((await POST(actionRequest('apply',{patch:newer,baseVersion:5},'teacher-secret'))).status,200);
 assert.equal((await POST(actionRequest('scene-recover',{operation:'undo',requestId:crypto.randomUUID(),baseVersion:6},'teacher-secret'))).status,200);
 const row=f.sql.prepare('SELECT world,state FROM classrooms WHERE id=?').get(classId) as {world:string;state:string};
 assert.deepEqual(JSON.parse(row.world),initialWorld);assert.equal(JSON.parse(row.state).hint.id,newer.id);
});
