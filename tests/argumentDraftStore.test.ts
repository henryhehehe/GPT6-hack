import test from 'node:test';
import assert from 'node:assert/strict';
import {createArgumentDraftStore} from '../lib/argumentDraftStore';

function fixture(){
 const data=new Map<string,string>();
 const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,text:string)=>{data.set(key,text);},removeItem:(key:string)=>{data.delete(key);}};
 return {data,storage,store:createArgumentDraftStore(()=>storage)};
}
const noop=()=>{};

test('typing persists immediately and emptying a draft removes its saved copy',()=>{
 const {store,data}=fixture();store.subscribe('class-a:learner-a',noop);
 store.setText('A source-supported explanation.');
 assert.equal(data.get('class-a:learner-a'),'A source-supported explanation.');
 assert.equal(store.getSnapshot('class-a:learner-a').saved,true);
 store.setText('');assert.equal(data.has('class-a:learner-a'),false);
});

test('a first classroom adopts pre-class writing once; other learners remain separate',()=>{
 const {store,data}=fixture();store.subscribe(null,noop);store.setText('Written before the classroom exists.');
 store.subscribe('class-a:learner-a',noop);assert.equal(data.get('class-a:learner-a'),'Written before the classroom exists.');
 store.subscribe('class-a:learner-b',noop);assert.equal(store.getSnapshot('class-a:learner-b').text,'');
 store.setText('Learner B draft.');store.subscribe('class-a:learner-a',noop);
 assert.equal(store.getSnapshot('class-a:learner-a').text,'Written before the classroom exists.');
});

test('restoring an existing draft takes precedence over unassigned writing',()=>{
 const {store,data}=fixture();data.set('restored','Already saved.');
 store.subscribe(null,noop);store.setText('Unassigned.');store.subscribe('restored',noop);
 assert.equal(store.getSnapshot('restored').text,'Already saved.');assert.equal(data.get('restored'),'Already saved.');
});

test('reading an uncommitted classroom cannot redirect edits from the active learner',()=>{
 const {store,data}=fixture();store.subscribe('active',noop);store.setText('Current draft.');
 store.getSnapshot('uncommitted');store.setText(text=>text+' More evidence.');
 assert.equal(data.get('active'),'Current draft. More evidence.');assert.equal(data.has('uncommitted'),false);
});

test('saved feedback clears only the submitted text and preserves a newer revision',()=>{
 const {store,data}=fixture();store.subscribe('learner',noop);store.setText('Submitted explanation.');
 const submitted=store.getSnapshot('learner').text;
 store.setText('A newer revision with more evidence.');store.setText(current=>current===submitted?'':current);
 assert.equal(data.get('learner'),'A newer revision with more evidence.');
 const revision=store.getSnapshot('learner').text;store.setText(current=>current===revision?'':current);
 assert.equal(data.has('learner'),false);
});

test('storage getter and write failures preserve text without claiming it is saved',()=>{
 const blocked=createArgumentDraftStore(()=>{throw new Error('Storage unavailable');});blocked.subscribe('learner',noop);
 blocked.setText('Still available here.');assert.deepEqual(blocked.getSnapshot('learner'),{text:'Still available here.',saved:false});
 const store=createArgumentDraftStore(()=>({getItem:()=>null,setItem:()=>{throw new Error('Quota exceeded');},removeItem:()=>{throw new Error('Blocked');}}));
 store.subscribe('learner',noop);store.setText('Also retained.');assert.deepEqual(store.getSnapshot('learner'),{text:'Also retained.',saved:false});
});

test('restored drafts are bounded and snapshots stay stable until text or save status changes',()=>{
 const {store,data}=fixture();data.set('learner','x'.repeat(2000));
 const before=store.getSnapshot('learner');assert.equal(before.text.length,1600);assert.equal(store.getSnapshot('learner'),before);
 let notices=0;const unsubscribe=store.subscribe('learner',()=>notices++);store.setText('Edited');
 assert.equal(notices,1);assert.notEqual(store.getSnapshot('learner'),before);
 unsubscribe();store.setText('Edited again');assert.equal(notices,1);
});
