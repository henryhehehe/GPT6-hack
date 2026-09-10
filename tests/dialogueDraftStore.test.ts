import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDialogueDraftStore} from '../lib/dialogueDraftStore';

function fixture(){
 const data=new Map<string,string>();
 const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
 const store=(key='class:B:library:false',source='source1')=>createDialogueDraftStore(key,source,()=>storage);
 return {data,storage,store};
}
test('reload recovers a failed question with the same retry identity',()=>{
 const {store}=fixture(),first=store();first.edit('  What supports that claim?  ');const sent=first.prepare(()=> 'request1');
 const restored=store();assert.equal(restored.read().message,'  What supports that claim?  ');
 assert.deepEqual(restored.prepare(()=> 'must-not-replace'),sent);
 restored.complete(sent);assert.equal(store().read().message,'');assert.equal(store().read().pending,undefined);
});
test('a response preserves newer typing and the next question receives its own retry ID',()=>{
 const {store}=fixture(),draft=store();draft.edit('First question?');const sent=draft.prepare(()=> 'first');
 draft.edit('Newer question?');draft.complete(sent);
 assert.equal(store().read().message,'Newer question?');assert.equal(draft.prepare(()=> 'second').id,'second');
});
test('learner, character, scenario and source changes isolate recovered questions',()=>{
 const {store}=fixture(),draft=store();draft.edit('Question for B');draft.prepare(()=> 'B-request');
 for(const key of ['class:A:library:false','class:B:harbor:false','class:B:library:true'])assert.equal(store(key).read().message,'');
 const changed=store(undefined,'source2');assert.equal(changed.read().message,'');assert.equal(changed.read().pending,undefined);assert.match(changed.read().warning,/source material changed/);
});
test('an old response cannot overwrite a question entered after a source change',()=>{
 const {store}=fixture(),old=store();old.edit('Old source question');const sent=old.prepare(()=> 'old');
 const fresh=store(undefined,'source2');fresh.edit('New source question');old.complete(sent);
 assert.equal(store(undefined,'source2').read().message,'New source question');
});
test('blocked reads and writes retain editable memory and expose recovery failures',()=>{
 for(const blockedRead of [true,false]){
  const draft=createDialogueDraftStore('B','source',()=>({getItem:()=>{if(blockedRead)throw new Error('blocked');return null;},setItem:()=>{throw new Error('full');}}));
  if(blockedRead)assert.match(draft.read().warning,/unavailable/);
  draft.edit('Still editable');const sent=draft.prepare(()=> 'memory-retry');
  assert.equal(draft.read().message,'Still editable');assert.match(draft.read().warning,/could not be saved/);
  assert.deepEqual(draft.prepare(()=> 'not-used'),sent);
 }
});
test('pre-upgrade questions and lost-response retry IDs survive with a source-check notice',()=>{
 const {data,store}=fixture();data.set('class:B:library:false','Unsent older question');data.set('class:B:library:false:pending',JSON.stringify({id:'old-id',message:'Unsent older question'}));
 const migrated=store();assert.equal(migrated.read().message,'Unsent older question');assert.match(migrated.read().warning,/current sources/);
 const sent=migrated.prepare(()=> 'new-id');assert.equal(sent.id,'old-id');migrated.complete(sent);
 assert.equal(store().read().message,'');
});
