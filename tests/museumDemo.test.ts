import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMuseumDemoWorld,alexandriaMuseumIds,museumDemoSource} from '../lib/museumDemo';
import {initialWorld,validateWorld} from '../lib/world';
import {museumObjects} from '../lib/museums';
import {lessonKitHtml,teachingPlan} from '../lib/teachingKit';

test('museum demo starts with reviewed Alexandria objects and the unchanged source packet',()=>{
 const world=validateWorld(createMuseumDemoWorld());assert.equal(world.museumObjectIds?.length,3);assert.deepEqual(world.museumObjectIds,alexandriaMuseumIds);assert.deepEqual(world.evidence,initialWorld.evidence);assert.equal(museumDemoSource(world)?.id,'strabo');
 world.museumObjectIds!.pop();world.evidence[0].text='changed locally';assert.equal(createMuseumDemoWorld().museumObjectIds?.length,3);assert.deepEqual(createMuseumDemoWorld().evidence,initialWorld.evidence);assert.equal(initialWorld.museumObjectIds,undefined);
});
test('tour cannot substitute for a different reading or an invented source card',()=>{
 const world=createMuseumDemoWorld();world.evidence=world.evidence.filter(card=>card.id!=='strabo');assert.equal(museumDemoSource(world),undefined);
 world.evidence.push({...initialWorld.evidence[0],kind:'teaching-prop'});assert.equal(museumDemoSource(world),undefined);
});
test('teacher and paper demo include attribution, observation prompts, and source limits',()=>{
 const world=createMuseumDemoWorld(),html=lessonKitHtml(world,45);
 for(const text of ['1965.552','CC0','Museum object discussion','One detail I can observe','Limit:','Original museum record','the app assesses the assigned source cards'])assert.ok(html.includes(text),text);
 assert.equal(teachingPlan(world,45).reduce((sum,step)=>sum+step.minutes,0),45);
 assert.ok(!lessonKitHtml(initialWorld,45).includes('Museum object discussion'));
});

test('a growing Alexandria collection cannot overflow or alter the introductory demo',()=>{
 assert.ok(museumObjects.filter(item=>item.topic==='Alexandria').length>6);
 assert.deepEqual(validateWorld(createMuseumDemoWorld()).museumObjectIds,['cma-142026','cma-101386','cma-97411']);
});
