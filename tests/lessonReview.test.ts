import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonReviewKey} from '../lib/lessonReview';
import {initialWorld} from '../lib/world';

const draft=()=>({id:'draft-a',title:'Source packet',range:'Pages 1–4',world:structuredClone(initialWorld)});

test('an unchanged restored packet keeps the same review identity',()=>{
 const current=draft();assert.equal(lessonReviewKey(current),lessonReviewKey(structuredClone(current)));
});
test('source edits, changed reading ranges and a new draft invalidate prior approval',()=>{
 const original=draft(),key=lessonReviewKey(original);
 for(const changed of [{...draft(),id:'draft-b'},{...draft(),range:'Pages 5–8'},{...draft(),title:'Another reading'}])assert.notEqual(lessonReviewKey(changed),key);
 const changed=draft();changed.world.evidence[0].text+=' Newly revised.';assert.notEqual(lessonReviewKey(changed),key);
});
test('unfinished lessons and in-progress illustrations cannot be approved',()=>{
 assert.equal(lessonReviewKey(null),null);assert.equal(lessonReviewKey({...draft(),world:null}),null);
 assert.equal(lessonReviewKey({...draft(),imageStatus:'generating'}),null);
});
test('a replaced illustration invalidates the reviewed world',()=>{
 const original=draft();original.world.settingImage={draftId:'draft-a',caption:'Interpretation',model:'image-model',responseId:'first-image'};
 const changed=structuredClone(original);changed.world.settingImage!.responseId='second-image';
 assert.notEqual(lessonReviewKey(changed),lessonReviewKey(original));
});
