import {test} from 'node:test';
import assert from 'node:assert/strict';
import {findArgumentReplay,prepareArgumentRequest,pendingArgumentKey,readPendingArgument,savePendingArgument,clearPendingArgument} from '../lib/argumentSubmission';
import {gradeArgument,type Turn} from '../lib/world';
import {initialWorld} from '../lib/world';

const input={claim:'Trade could support scholars, but a patron might replace lost income.',npc:'library' as const,scenario:true};
function browserStorage(){const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);},removeItem:(key:string)=>{data.delete(key);}};}
function savedTurn():Turn{
 const result=gradeArgument({reply:'Consider the funding assumption.',items:['claim','evidence','mechanism','limitation'].map(key=>({key,earned:true,excerpt:input.claim,reason:'Supported by the explanation.'})),evidenceIds:['funding'],nextQuestion:'What could replace trade income?'},input.claim,['funding'],initialWorld);
 return {...prepareArgumentRequest(input),at:'2026-09-10T18:00:00Z',worldVersion:1,result:{...result,responseId:'saved-feedback',latencyMs:1200}};
}

test('a retry after a lost response or refresh retrieves the saved feedback',()=>{
 const storage=browserStorage(),key=pendingArgumentKey('class','learner');
 const turn=savedTurn();savePendingArgument(storage,key,turn as ReturnType<typeof prepareArgumentRequest>);
 const retried=prepareArgumentRequest(input,readPendingArgument(storage,key));
 assert.equal(retried.requestId,turn.requestId);
 assert.equal(findArgumentReplay([turn],retried,retried.requestId),turn);
});

test('a saved receipt remains retrievable at the answer limit and after lesson updates',()=>{
 const turn=savedTurn();
 const history:Turn[]=Array.from({length:30},(_,i)=>({...turn,requestId:crypto.randomUUID(),worldVersion:i+1}));
 history[0]=turn;
 assert.equal(findArgumentReplay(history,input,turn.requestId)?.result.responseId,'saved-feedback');
 assert.equal(history.length,30);
});

test('changing text, character, or scenario creates a new submission and cannot alter an old receipt',()=>{
 const turn=savedTurn();
 for(const changed of [{...input,claim:'A different explanation.'},{...input,npc:'harbor' as const},{...input,scenario:false}]){
  assert.notEqual(prepareArgumentRequest(changed,turn).requestId,turn.requestId);
  assert.throws(()=>findArgumentReplay([turn],changed,turn.requestId),/submission changed/);
 }
});

test('finishing an older submission cannot clear a newer pending draft request',()=>{
 const storage=browserStorage(),key=pendingArgumentKey('class','learner');
 const old=prepareArgumentRequest(input),next=prepareArgumentRequest({...input,claim:'My revised explanation.'});
 savePendingArgument(storage,key,next);clearPendingArgument(storage,key,old.requestId);
 assert.equal(readPendingArgument(storage,key)?.requestId,next.requestId);
 clearPendingArgument(storage,key,next.requestId);assert.equal(readPendingArgument(storage,key),undefined);
});

test('pending submissions are isolated by classroom and learner and damaged records are ignored',()=>{
 const storage=browserStorage(),key=pendingArgumentKey('class','learner');
 savePendingArgument(storage,key,prepareArgumentRequest(input));
 assert.equal(readPendingArgument(storage,pendingArgumentKey('other','learner')),undefined);
 assert.equal(readPendingArgument(storage,pendingArgumentKey('class','other')),undefined);
 for(const invalid of ['{bad',JSON.stringify({...input,requestId:'not-an-id'}),'null']){
  storage.setItem(key,invalid);assert.equal(readPendingArgument(storage,key),undefined);
 }
});

test('legacy argument history works without request IDs',()=>{
 const turn=savedTurn();delete turn.requestId;
 assert.equal(findArgumentReplay([turn],input),undefined);
 assert.equal(findArgumentReplay([turn],input,crypto.randomUUID()),undefined);
});
