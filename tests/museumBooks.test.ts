import {test} from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../lib/curriculum/catalog.json';
import {museumBooks,getMuseumBook,museumBookForTopic,museumObjectMatchesQuery} from '../lib/museumBooks';
import {getMuseumInvestigation,investigationObjects} from '../lib/museumInvestigations';
import {museumObjects} from '../lib/museums';
import {museumStudyFromQuery} from '../lib/museumLinks';

test('book collections follow all prepared readings and recommend a matching reviewed pair',()=>{
 assert.equal(museumBooks.length,catalog.worlds.length);
 assert.equal(new Set(museumBooks.map(book=>book.worldId)).size,museumBooks.length);
 for(const world of catalog.worlds){
  const book=getMuseumBook(world.id)!;
  assert.ok(book,world.id);
  assert.equal(book.sourceTitle,world.source.title);
  assert.deepEqual(book.lessons,world.lessons.map(({id,title,sourceRange,inquiry})=>({id,title,range:sourceRange,inquiry})));
  assert.equal(museumBookForTopic(book.topic),book);
  const plan=getMuseumInvestigation(book.investigation)!;
  assert.ok(plan,book.investigation);
  assert.equal(plan.topic,book.topic);
  assert.equal(investigationObjects(plan).length,2);
 }
});
test('searching by book title finds objects saved under author topic names',()=>{
 for(const [query,topic] of [['Pride and Prejudice','Jane Austen'],['A Christmas Carol','Charles Dickens'],['Narrative of the Life','Frederick Douglass'],['Declaration of Sentiments','Seneca Falls']]){
  const found=museumObjects.filter(item=>museumObjectMatchesQuery(item,query));
  assert.ok(found.length>0,query);
  assert.ok(found.every(item=>item.topic===topic),query);
 }
});
test('book links filter without opening or assigning objects and retain more specific link precedence',()=>{
 for(const book of museumBooks)assert.deepEqual(museumStudyFromQuery({book:book.worldId}),{objectIds:[],topic:book.topic,studyId:undefined});
 for(const book of ['unknown',['austen-letter'],'https://example.com'])assert.equal(museumStudyFromQuery({book}),undefined);
 assert.equal(museumStudyFromQuery({book:'austen-letter',object:'met-395662'})?.topic,'Macbeth');
 assert.equal(museumStudyFromQuery({book:'austen-letter',study:'royal-power'})?.topic,'Alexandria');
 assert.equal(museumStudyFromQuery({book:'austen-letter',object:'unknown'}),undefined);
 assert.equal(museumStudyFromQuery({book:'austen-letter',compare:'met-395662'}),undefined);
});
