import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getMuseumInvestigation,museumInvestigations,investigationObjects,investigationForObjects,museumInvestigationPath,suggestedMuseumInvestigations,addMuseumInvestigation} from '../lib/museumInvestigations';
import {museumWorksheetHtml} from '../lib/museumWorksheet';
import {museumTopics,museumObjects} from '../lib/museums';

test('guided investigations bind two reviewed objects and preserve their reading boundaries',()=>{
 assert.equal(new Set(museumInvestigations.map(plan=>plan.id)).size,10);
 for(const plan of museumInvestigations){
  const objects=investigationObjects(plan);
  assert.equal(objects.length,2);assert.notEqual(objects[0].id,objects[1].id);
  assert.ok(objects.every(item=>item.topic===plan.topic));
  assert.equal(plan.steps.reduce((total,step)=>total+step.minutes,0),plan.minutes);
  assert.equal(investigationForObjects([...objects].reverse()),plan);
  assert.equal(getMuseumInvestigation(new URL(`https://class.test${museumInvestigationPath(plan.id)}`).searchParams.get('study')),plan);
 }
 assert.match(getMuseumInvestigation('odyssey-retold')!.readingBridge,/outside Book IX/);
 assert.match(getMuseumInvestigation('austen-first-impressions')!.steps[2].prompt,/Neither record/);
 assert.equal(getMuseumInvestigation(['royal-power']),undefined);
 assert.equal(getMuseumInvestigation('unknown'),undefined);
 assert.equal(investigationForObjects([]),undefined);
 const objects=investigationObjects(museumInvestigations[0]);
 assert.equal(investigationForObjects([objects[0],objects[0]]),undefined);
 assert.throws(()=>museumWorksheetHtml('<script>bad</script>'));
 assert.throws(()=>museumInvestigationPath('https://evil.test'));
});
test('learner suggestions require both objects to be assigned; teacher suggestions follow topic',()=>{
 assert.deepEqual(suggestedMuseumInvestigations(undefined,[]),[]);
 assert.deepEqual(suggestedMuseumInvestigations(undefined,['met-90487']),[]);
 assert.deepEqual(suggestedMuseumInvestigations(undefined,['met-90487','met-192043']).map(plan=>plan.id),['austen-first-impressions']);
 assert.deepEqual(suggestedMuseumInvestigations('Alexandria').map(plan=>plan.id),['royal-power']);
});
test('worksheets retain citations, limits, and blank responses without loading remote assets',()=>{
 for(const plan of museumInvestigations){
  const html=museumWorksheetHtml(plan.id);
  for(const object of investigationObjects(plan)){
   assert.ok(html.includes(object.accession));assert.ok(html.includes(object.recordUrl));assert.ok(html.includes(object.provider));
  }
  assert.match(html,/Space for your response/);assert.match(html,/What this object cannot establish/);
  assert.match(html,/photographs are not embedded/);assert.match(html,/@media print/);
  assert.ok(!/<(?:script|img|iframe|link)\b/i.test(html));
 }
 // Defend the download boundary even if future editorial text contains markup.
 const plan=museumInvestigations[0],title=plan.title;
 try{plan.title='<img src=x onerror=alert(1)>';const html=museumWorksheetHtml(plan.id);assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));}finally{plan.title=title;}
});

test('teaching guide includes only complete pairs and leaves the planned lesson duration intact',async()=>{
 const {lessonKitHtml,teachingPlan}=await import('../lib/teachingKit');
 const {initialWorld}=await import('../lib/world');
 for(const plan of museumInvestigations){
  const partial={...initialWorld,museumObjectIds:[plan.objectIds[0]]};
  assert.ok(!lessonKitHtml(partial,45).includes('Ready-to-use museum investigations'));
  const world={...initialWorld,museumObjectIds:plan.objectIds};
  const html=lessonKitHtml(world,45);
  assert.ok(html.includes(plan.title));assert.ok(html.includes(plan.steps[0].prompt));
  assert.ok(html.includes('within investigation time'));
  assert.equal(teachingPlan(world,45).reduce((total,step)=>total+step.minutes,0),45);
 }
});

test('every collection topic has one usable investigation and suggestions respect the chosen topic',()=>{
 for(const topic of museumTopics){
  const plans=suggestedMuseumInvestigations(topic);
  assert.equal(plans.length,1,topic);
  assert.equal(investigationObjects(plans[0]).length,2);
  assert.deepEqual(suggestedMuseumInvestigations(topic,plans[0].objectIds),plans);
  assert.deepEqual(suggestedMuseumInvestigations(topic,[plans[0].objectIds[0]]),[]);
 }
});

test('every investigation adds a complete pair, safely retries, and refuses a full unrelated selection',()=>{
 for(const plan of museumInvestigations){
  assert.deepEqual(addMuseumInvestigation([],plan.id),plan.objectIds);
  assert.deepEqual(addMuseumInvestigation(plan.objectIds,plan.id),plan.objectIds);
  const full=museumObjects.filter(item=>!plan.objectIds.includes(item.id)).slice(0,6).map(item=>item.id);
  const before=[...full];
  assert.throws(()=>addMuseumInvestigation(full,plan.id),/make room/);
  assert.deepEqual(full,before);
 }
});
