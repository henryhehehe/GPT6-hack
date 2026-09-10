import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {museumObjects,museumTopics,normalizeClevelandRecord,normalizeMetRecord,MuseumSelectionSchema} from '../lib/museums';
import {relatedMuseumTopic} from '../lib/museumStudy';
import {prepareCatalogLesson} from '../lib/curriculum';
import catalog from '../lib/curriculum/catalog.json';

test('every curriculum world has reviewed museum objects, without automatically assigning them',()=>{
 assert.equal(museumObjects.length,67);
 assert.equal(museumTopics.length,10);
 for(const entry of catalog.worlds){
  const world=prepareCatalogLesson(entry.lessons[0].id).world!;
  assert.ok(world,entry.id);
  const topic=relatedMuseumTopic(world);
  assert.ok(topic,entry.id);
  assert.ok(museumObjects.filter(item=>item.topic===topic).length>=3,entry.id);
  assert.equal(world.museumObjectIds,undefined);
 }
});

test('all retained additions reproduce from retained museum metadata with verified image rights',async()=>{
 const directory=new URL('../assets/museums/source-records/',import.meta.url);
 const files=(await readdir(directory)).filter(name=>name.endsWith('.json'));
 assert.equal(files.length,60);
 for(const filename of files){
  const snapshot=JSON.parse(await readFile(new URL(filename,directory),'utf8'));
  const item=museumObjects.find(item=>`${item.id}.json`===filename)!;
  assert.ok(item,filename);
  const {topic,connection,prompt,limits}=item;
  const normalized=(item.id.startsWith('cma-')?normalizeClevelandRecord:normalizeMetRecord)(snapshot.record,{topic,connection,prompt,limits},snapshot.retrievedAt);
  assert.deepEqual(normalized,item,filename);
  assert.ok(snapshot.endpoint.endsWith(String(item.providerId)));
  assert.ok(prompt.length>120&&limits.length>120,filename);
 }
 assert.match(museumObjects.find(item=>item.id==='cma-170257')!.creator,/^attributed to John Townsend/);
 assert.equal(museumObjects.find(item=>item.id==='cma-100166')!.dimensions,'Not specified in the API record');
 assert.equal(museumObjects.find(item=>item.id==='met-623325')!.culture,'probably British');
 assert.equal(museumObjects.find(item=>item.id==='met-157539')!.culture,'American or European');
 assert.equal(museumObjects.find(item=>item.id==='met-365591')!.date,'first published 1797; reissued 1852');
});

test('newly added objects participate in mixed-topic selection without raising the six-object limit',()=>{
 const ids=['met-282066','met-286586','met-14094','cma-137145','cma-100166','met-365591'];
 assert.deepEqual(MuseumSelectionSchema.parse(ids),ids);
 assert.equal(MuseumSelectionSchema.safeParse([...ids,'met-159519']).success,false);
});
