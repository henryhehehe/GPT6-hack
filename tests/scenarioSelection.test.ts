import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readScenarioSelection,saveScenarioSelection,scenarioSelectionKey} from '../lib/scenarioSelection';

function browserStorage(){
 const data=new Map<string,string>();
 return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
}

test('reload restores either learner scenario independently of the classroom default',()=>{
 const storage=browserStorage(),key=scenarioSelectionKey('class','alex');
 saveScenarioSelection(storage,key,true,false);
 assert.equal(readScenarioSelection(storage,key,false),true);
 saveScenarioSelection(storage,key,false,true);
 assert.equal(readScenarioSelection(storage,key,true),false);
});

test('a teacher scenario change overrides a previously remembered learner choice',()=>{
 const storage=browserStorage(),key=scenarioSelectionKey('class','alex');
 saveScenarioSelection(storage,key,false,false);
 assert.equal(readScenarioSelection(storage,key,true),true);
 saveScenarioSelection(storage,key,true,true);
 assert.equal(readScenarioSelection(storage,key,false),false);
});

test('scenario choices do not cross classroom or learner boundaries',()=>{
 const storage=browserStorage();
 saveScenarioSelection(storage,scenarioSelectionKey('history','alex'),true,false);
 assert.equal(readScenarioSelection(storage,scenarioSelectionKey('history','sam'),false),false);
 assert.equal(readScenarioSelection(storage,scenarioSelectionKey('literature','alex'),false),false);
});

test('malformed or unavailable storage falls back to the teacher scenario',()=>{
 const storage=browserStorage();
 for(const value of ['{broken','null','[]','true','{"scenario":"false","teacherScenario":true}']){
  storage.setItem('key',value);
  assert.equal(readScenarioSelection(storage,'key',true),true);
 }
 const blocked={getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('blocked');}};
 assert.equal(readScenarioSelection(blocked,'key',false),false);
 assert.doesNotThrow(()=>saveScenarioSelection(blocked,'key',true,false));
});
