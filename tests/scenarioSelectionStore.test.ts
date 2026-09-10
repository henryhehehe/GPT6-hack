import test from 'node:test';
import assert from 'node:assert/strict';
import {createScenarioSelectionStore} from '../lib/scenarioSelectionStore';
import {saveScenarioSelection} from '../lib/scenarioSelection';
const noop=()=>{};
function fixture(){const values=new Map<string,string>();return {values,storage:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}}};}

test('teacher changes override a saved learner choice, including when toggling back',()=>{
 const {storage}=fixture();saveScenarioSelection(storage,'learner',true,false);
 const initial=createScenarioSelectionStore({key:'learner',teacherScenario:false,allowed:true},()=>storage);initial.subscribe(noop);assert.equal(initial.getSnapshot(),true);
 const changed=createScenarioSelectionStore({key:'learner',teacherScenario:true,allowed:true},()=>storage);changed.subscribe(noop);assert.equal(changed.getSnapshot(),true);
 const returned=createScenarioSelectionStore({key:'learner',teacherScenario:false,allowed:true},()=>storage);returned.subscribe(noop);assert.equal(returned.getSnapshot(),false);
});

test('reading an uncommitted teacher change does not overwrite the current choice',()=>{
 const {storage,values}=fixture();saveScenarioSelection(storage,'learner',true,false);const before=values.get('learner');
 const pending=createScenarioSelectionStore({key:'learner',teacherScenario:true,allowed:true},()=>storage);
 assert.equal(pending.getSnapshot(),true);assert.equal(values.get('learner'),before);
});

test('learner changes persist immediately and do not cross classroom keys',()=>{
 const {storage,values}=fixture();const store=createScenarioSelectionStore({key:'class-a:learner-a',teacherScenario:false,allowed:true},()=>storage);
 let notices=0;store.subscribe(()=>notices++);store.setScenario(true);assert.equal(notices,1);
 assert.deepEqual(JSON.parse(values.get('class-a:learner-a')!),{scenario:true,teacherScenario:false});
 const other=createScenarioSelectionStore({key:'class-b:learner-a',teacherScenario:false,allowed:true},()=>storage);assert.equal(other.getSnapshot(),false);
});

test('a lesson without a what-if branch cannot restore or select one',()=>{
 const {storage}=fixture();saveScenarioSelection(storage,'learner',true,true);
 const store=createScenarioSelectionStore({key:'learner',teacherScenario:true,allowed:false},()=>storage);store.subscribe(noop);store.setScenario(true);
 assert.equal(store.getSnapshot(),false);assert.equal(store.getServerSnapshot(),false);
});

test('blocked browser storage and teacher previews retain usable in-memory choices',()=>{
 for(const key of ['learner',null]){
  const store=createScenarioSelectionStore({key,teacherScenario:false,allowed:true},()=>{throw new Error('Blocked');});store.subscribe(noop);
  store.setScenario(true);assert.equal(store.getSnapshot(),true);store.setScenario(false);assert.equal(store.getSnapshot(),false);
 }
});
