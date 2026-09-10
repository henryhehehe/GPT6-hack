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


test('teacher attaches museum objects durably; learners read but cannot change selections',async t=>{
 const f=fixture();t.after(()=>f.sql.close());
 const send=(objectId:string,included:boolean,token='teacher-secret')=>POST(new Request('https://class.test/api/classroom',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'museum',id:classId,objectId,included})}));
 const before=f.sql.prepare('SELECT state FROM students WHERE id=?').get(learnerA);
 assert.equal((await send('cma-142026',true,'student-secret')).status,400);
 assert.equal((await send('cma-999999',true)).status,400);
 assert.equal((await send('cma-142026',true)).status,200);
 assert.equal((await send('cma-142026',true)).status,200);
 const response=await readClassroom(new Request(`https://class.test/api/classroom?id=${classId}&studentId=${learnerA}`,{headers:{Authorization:'Bearer student-secret'}}));
 const body=await response.json() as {world:{museumObjectIds:string[];evidence:unknown[]}};
 assert.deepEqual(body.world.museumObjectIds,['cma-142026']);assert.deepEqual(body.world.evidence,initialWorld.evidence);
 assert.deepEqual(f.sql.prepare('SELECT state FROM students WHERE id=?').get(learnerA),before);
 assert.equal(f.quotaCount(),0);
 assert.equal((await send('cma-142026',false)).status,200);
 const row=f.sql.prepare('SELECT world FROM classrooms WHERE id=?').get(classId) as {world:string};assert.deepEqual(JSON.parse(row.world).museumObjectIds,[]);
});

test('try creates a persistent museum demo, while ordinary creation keeps its existing defaults',async t=>{
 const f=fixture();t.after(()=>f.sql.close());
 for(const action of ['try','create']){
  const response=await POST(new Request('https://class.test/api/classroom',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})}));
  assert.equal(response.status,200);const access=await response.json() as {id:string;teacherToken:string;studentId:string;studentToken:string};
  const read=await readClassroom(new Request(`https://class.test/api/classroom?id=${access.id}&studentId=${access.studentId}`,{headers:{Authorization:`Bearer ${access.studentToken}`}}));
  assert.equal(read.status,200);const body=await read.json() as {world:{museumObjectIds?:string[];evidence:unknown[]}};
  assert.deepEqual(body.world.evidence,initialWorld.evidence);
  assert.deepEqual(body.world.museumObjectIds,action==='try'?['cma-142026','cma-101386','cma-97411']:undefined);
 }
});
