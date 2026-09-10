import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialWorld,type StudentState} from '../lib/world';
import {learnerReasoningContext} from '../lib/learnerContext';
import {applySceneChange} from '../lib/sceneIntervention';
import {saveMuseumNote} from '../lib/museumNotes';

const scene={intervention:'What if ships return but scholar support does not?',nodes:initialWorld.nodes.map(node=>({id:node.id,activity:node.id==='harbor'?1:0,consequence:'Activity changes under this assumption.',mechanism:'This is hypothetical, conditional on the exercise assumption.'}))};
test('scene edits preserve source contexts, identities, baselines and original world',()=>{
 const before=structuredClone(initialWorld),changed=applySceneChange(initialWorld,scene);
 assert.deepEqual(initialWorld,before);assert.deepEqual(changed.evidence,before.evidence);
 assert.deepEqual(changed.nodes.map(node=>({id:node.id,baseline:node.baseline,evidenceIds:node.evidenceIds})),before.nodes.map(node=>({id:node.id,baseline:node.baseline,evidenceIds:node.evidenceIds})));
 assert.equal(changed.nodes[0].activity,1);assert.equal(changed.nodes[1].activity,0);
});
test('scene contract rejects source injection, duplicate places and out-of-range activity',()=>{
 assert.throws(()=>applySceneChange(initialWorld,{...scene,evidence:[]}));
 assert.throws(()=>applySceneChange(initialWorld,{...scene,nodes:[scene.nodes[0],scene.nodes[0],scene.nodes[2]]}));
 assert.throws(()=>applySceneChange(initialWorld,{...scene,nodes:scene.nodes.map(node=>({...node,activity:2}))}));
});
test('learner context distinguishes earlier scenarios and excludes name and credentials',()=>{
 const learner={name:'Private name',zone:'harbor',evidence:['strabo','fake'],turns:[{claim:'The library must close.',scenario:true,worldVersion:1,result:{items:[],nextQuestion:'Could a patron help?'}}],museumNotes:[]} as unknown as StudentState;
 const context=learnerReasoningContext(learner,initialWorld,false,2);
 assert.equal(context.latestArgument?.matchesViewedContext,false);assert.equal(context.latestArgument?.scenario,true);
 assert.deepEqual(context.collectedEvidence,['strabo']);assert.equal('name' in context,false);
 assert.equal(learnerReasoningContext({...learner,turns:[]},initialWorld,false,2).latestArgument,null);
});
test('editing museum writing invalidates image feedback while an unchanged save preserves it',()=>{
 const input={objectId:'cma-142026',observation:'A profile on the coin.',interpretation:'Perhaps authority.',question:'Who used it?'};
 const note={...input,revision:1,updatedAt:'2026-09-10',feedback:{observation:'Look at the profile.',interpretation:'An inference.',uncertainty:'Circulation is unclear.',question:'What detail?',noteRevision:1,responseId:'response-test',latencyMs:1}};
 assert.ok(saveMuseumNote([note],input,1,'2026-09-10').note.feedback);
 assert.equal(saveMuseumNote([note],{...input,observation:'A head faces right.'},1,'2026-09-10').note.feedback,undefined);
});
