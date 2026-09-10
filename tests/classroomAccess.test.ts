import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readClassroomAccess,saveClassroomAccess,type ClassroomAccess} from '../lib/classroomAccess';

function browserStorage(){
 const data=new Map<string,string>();
 return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
}
const alex:ClassroomAccess={id:'history-class',studentId:'alex',studentToken:'alex-token',studentName:'Alex'};
const sam:ClassroomAccess={id:'literature-class',studentId:'sam',studentToken:'sam-token',studentName:'Sam'};

test('returning through either class invitation restores that class after switching lessons',()=>{
 const storage=browserStorage();
 assert.equal(saveClassroomAccess(storage,alex),true);
 assert.equal(saveClassroomAccess(storage,sam),true);
 assert.deepEqual(readClassroomAccess(storage),sam);
 assert.deepEqual(readClassroomAccess(storage,alex.id),alex);
 assert.deepEqual(readClassroomAccess(storage,sam.id),sam);
 assert.equal(readClassroomAccess(storage,'unrelated-class'),null);
});

test('existing installations can resume their saved class without joining again',()=>{
 const storage=browserStorage();storage.setItem('cw-access',JSON.stringify(alex));
 assert.deepEqual(readClassroomAccess(storage,alex.id),alex);
 assert.equal(readClassroomAccess(storage,sam.id),null);
});

test('a different learner on a shared device replaces the remembered profile for that class',()=>{
 const storage=browserStorage();saveClassroomAccess(storage,alex);
 const replacement={...alex,studentId:'new-learner',studentToken:'new-token',studentName:'Jordan'};
 saveClassroomAccess(storage,replacement);
 assert.deepEqual(readClassroomAccess(storage,alex.id),replacement);
});

test('damaged and incomplete browser records cannot become classroom credentials',()=>{
 for(const value of ['{broken','null','[]','"hello"',JSON.stringify({id:alex.id}),JSON.stringify({...alex,studentToken:42})]){
  const storage=browserStorage();storage.setItem('cw-access',value);
  assert.equal(readClassroomAccess(storage),null);
 }
 const storage=browserStorage();storage.setItem(`cw-access:${alex.id}`,JSON.stringify(sam));
 assert.equal(readClassroomAccess(storage,alex.id),null);
});

test('blocked browser storage does not turn a successful join into an exception',()=>{
 const storage={getItem:()=>{throw new Error('Storage blocked');},setItem:()=>{throw new Error('Quota exceeded');}};
 assert.equal(saveClassroomAccess(storage,alex),false);
 assert.equal(readClassroomAccess(storage),null);
});
