import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {initialWorld,type DialogueTurn} from '../lib/world';
import {validateDialogue,dialogueHistory} from '../lib/characters';
import {replaceWorldSql,saveStudentSql} from '../lib/classroomWrites';

test('dialogue rejects invented and duplicate evidence references',()=>{
 for(const evidenceIds of [['fake'],['strabo','strabo']])assert.throws(()=>validateDialogue({reply:'Look at the account.',evidenceIds,followUp:''},initialWorld));
 assert.deepEqual(validateDialogue({reply:'The ledger is invented for this exercise.',evidenceIds:['ledger'],followUp:''},initialWorld).evidenceIds,['ledger']);
});
test('dialogue cannot supply score or unlock fields',()=>{
 const result=validateDialogue({reply:'Let us examine the source.',evidenceIds:[],followUp:'What do you notice?',score:4,unlocked:true},initialWorld);
 assert.equal('unlocked' in result,false);assert.equal('score' in result,false);
});
test('conversation context excludes other characters and scenarios and is bounded',()=>{
 const turns=Array.from({length:10},(_,i)=>({message:String(i),npc:'library',scenario:false,result:{reply:String(i)}} as DialogueTurn));
 turns.push({message:'private other context',npc:'harbor',scenario:false,result:{reply:'harbor'}} as DialogueTurn,{message:'alternate',npc:'library',scenario:true,result:{reply:'changed'}} as DialogueTurn);
 assert.deepEqual(dialogueHistory(turns,'library',false).map(t=>t.student),['4','5','6','7','8','9']);
});
function database(){const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE classrooms(id TEXT PRIMARY KEY, state TEXT, world TEXT, lesson TEXT, version INTEGER); CREATE TABLE students(id TEXT PRIMARY KEY,class_id TEXT,state TEXT,revision INTEGER);');db.prepare('INSERT INTO classrooms VALUES (?,?,?,?,?)').run('class','{}','old','lesson',1);db.prepare('INSERT INTO students VALUES (?,?,?,?)').run('student','class',JSON.stringify({evidence:[],turns:[]}),1);return db;}
for(const kind of ['dialogue','evidence','turns'])test(`atomic world replacement refuses ${kind} saved during generation`,()=>{
 const db=database();try{const state={evidence:[],turns:[],[kind]:['progress']};assert.equal(db.prepare(saveStudentSql).run(JSON.stringify(state),'student',1,1).changes,1);assert.equal(db.prepare(replaceWorldSql).run('{}','new','new lesson','class',1).changes,0);assert.equal((db.prepare('SELECT world FROM classrooms').get() as {world:string}).world,'old');}finally{db.close();}
});
test('student reply cannot persist after world replacement wins the race',()=>{
 const db=database();try{assert.equal(db.prepare(replaceWorldSql).run('{}','new','new lesson','class',1).changes,1);assert.equal(db.prepare(saveStudentSql).run(JSON.stringify({dialogue:['old reply']}),'student',1,1).changes,0);assert.equal((db.prepare('SELECT revision FROM students').get() as {revision:number}).revision,1);}finally{db.close();}
});
test('concurrent student writes cannot erase a saved conversation',()=>{
 const db=database();try{assert.equal(db.prepare(saveStudentSql).run(JSON.stringify({dialogue:['reply']}),'student',1,1).changes,1);assert.equal(db.prepare(saveStudentSql).run(JSON.stringify({evidence:['ledger']}),'student',1,1).changes,0);}finally{db.close();}
});
