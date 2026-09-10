import {test} from 'node:test';
import assert from 'node:assert/strict';
import {museumObjectPath,museumStudyFromQuery} from '../lib/museumLinks';
import {museumObjects} from '../lib/museums';
import {museumInvestigations} from '../lib/museumInvestigations';

test('every object can be reopened from a public link without classroom or learner data',()=>{
 for(const item of museumObjects){
  const url=new URL(museumObjectPath(item.id),'https://class.test');
  assert.equal(url.pathname,'/collections');
  assert.deepEqual([...url.searchParams.keys()],['object']);
  assert.deepEqual(museumStudyFromQuery(Object.fromEntries(url.searchParams)),{objectIds:[item.id],topic:item.topic,studyId:undefined});
 }
});
test('custom comparisons retain order and only filter the catalog when the topic is shared',()=>{
 const pair=['met-84629','met-90487'];
 const url=new URL(museumObjectPath(pair[0],pair[1]),'https://class.test');
 assert.deepEqual(museumStudyFromQuery(Object.fromEntries(url.searchParams)),{objectIds:pair,topic:'Jane Austen',studyId:undefined});
 assert.deepEqual(museumStudyFromQuery({object:'met-90487',compare:'met-84629'})?.objectIds,[...pair].reverse());
 assert.equal(museumStudyFromQuery({object:'cma-142026',compare:'met-84629'})?.topic,undefined);
});
test('existing investigation links retain precedence and open all ten reviewed plans',()=>{
 for(const plan of museumInvestigations){
  assert.deepEqual(museumStudyFromQuery({study:plan.id,object:'met-84629'}),{objectIds:plan.objectIds,topic:plan.topic,studyId:plan.id});
 }
});
test('invalid, repeated, duplicate, and partial URL selections fall back to browsing',()=>{
 for(const query of [{},{compare:'met-84629'},{object:'invented'},{object:['met-84629']},{object:'met-84629',compare:['met-90487']},{object:'met-84629',compare:'met-84629'},{object:'met-84629',compare:'invented'},{study:['royal-power']},{study:'unknown',object:'met-84629'},{object:'https://evil.test'}])assert.equal(museumStudyFromQuery(query),undefined);
 for(const ids of [['invented'],['met-84629','invented'],['met-84629','met-84629']])assert.throws(()=>museumObjectPath(ids[0],ids[1]));
});
