import {test} from 'node:test';
import assert from 'node:assert/strict';
import {comparisonObjects,alexandriaCoinPair,relatedMuseumTopic} from '../lib/museumStudy';
import {initialWorld} from '../lib/world';
import {prepareCatalogLesson} from '../lib/curriculum';

test('comparison requires two distinct known objects and keeps the requested order',()=>{
 const pair=comparisonObjects(alexandriaCoinPair);assert.deepEqual(pair.map(item=>item.id),alexandriaCoinPair);
 assert.deepEqual(comparisonObjects([...alexandriaCoinPair].reverse()).map(item=>item.id),[...alexandriaCoinPair].reverse());
 for(const ids of [[],['cma-142026'],['cma-142026','cma-142026'],['cma-142026','unreviewed'],[...alexandriaCoinPair,'cma-101386']])assert.deepEqual(comparisonObjects(ids),[]);
 assert.equal(pair[0].medium,'gold');assert.equal(pair[1].medium,'silver');assert.notEqual(pair[0].date,pair[1].date);
});
test('collection suggestions follow the assigned curriculum without guessing from a custom title',()=>{
 assert.equal(relatedMuseumTopic(initialWorld),'Alexandria');
 const alexandria=prepareCatalogLesson('alexandria-01').world!;assert.equal(relatedMuseumTopic(alexandria),'Alexandria');
 const custom={...alexandria,title:'The Odyssey',lessonPack:{...alexandria.lessonPack!,curriculum:undefined}};assert.equal(relatedMuseumTopic(custom),undefined);
 const odyssey={...alexandria,lessonPack:{...alexandria.lessonPack!,curriculum:{...alexandria.lessonPack!.curriculum!,worldId:'odyssey-ix'}}};assert.equal(relatedMuseumTopic(odyssey),'The Odyssey');
 const other={...odyssey,lessonPack:{...odyssey.lessonPack,curriculum:{...odyssey.lessonPack.curriculum,worldId:'macbeth'}}};assert.equal(relatedMuseumTopic(other),undefined);
 assert.equal(alexandria.museumObjectIds,undefined);
});
