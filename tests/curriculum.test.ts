import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {prepareCatalogLesson} from '../lib/curriculum';
import {initialWorld,scenarioAllowed,validateWorld} from '../lib/world';
import {groundLesson} from '../lib/lessonBuilder';
import catalog from '../lib/curriculum/catalog.json';
import packets from '../lib/curriculum/packets.json';
import planningCatalog from '../docs/curriculum/catalog.json';
import formativeExamples from '../docs/curriculum/FORMATIVE-EXAMPLES.json';

test('every catalog lesson has a fresh, complete runtime world with local evidence and its own objective',()=>{
 const ids=new Set<string>();
 for(const entry of catalog.worlds)for(const lesson of entry.lessons){
  assert.ok(!ids.has(lesson.id));ids.add(lesson.id);
  const draft=prepareCatalogLesson(lesson.id),world=validateWorld(draft.world);
  assert.equal(world.objective,lesson.inquiry);
  assert.equal(world.lessonPack?.curriculum?.lessonId,lesson.id);
  assert.equal(world.lessonPack?.curriculum?.revisionTask,lesson.revisionTask);
  assert.equal(world.lessonPack?.readingRange,lesson.sourceRange);
  for(const node of world.nodes){assert.ok(world.evidence.some(e=>e.zone===node.id&&node.evidenceIds.includes(e.id)));}
  assert.equal(new Set(world.lessonPack?.characters.map(c=>c.zone)).size,3);
  assert.equal(scenarioAllowed(world),lesson.mode==='counterfactual');
  world.evidence[0].text='modified locally';
  assert.notEqual(prepareCatalogLesson(lesson.id).world?.evidence[0].text,'modified locally');
 }
 assert.equal(ids.size,30);
});

test('all exact excerpts and bounded context resolve against pinned source snapshots and hashes',()=>{
 for(const source of Object.values(packets.sources)){
  const disk=readFileSync(new URL(`../docs/curriculum/sources/${source.id}.txt`,import.meta.url),'utf8');
  assert.equal(source.text,disk);
  assert.equal(createHash('sha256').update(disk).digest('hex'),source.sha256);
 }
 for(const card of Object.values(packets.cards)){
  const source=packets.sources[card.sourceId as keyof typeof packets.sources];
  assert.equal(source.text.slice(card.start,card.end),card.text);
  assert.ok(card.text.length>=20&&card.text.length<=700);
  assert.ok(card.contextStart<=card.start&&card.contextEnd>=card.end&&card.contextEnd<=source.text.length);
 }
});

test('assigned source locators do not cross the selected lesson boundaries',()=>{
 const allowed:Record<string,RegExp>={
  'odyssey-ix':/^Book IX$/,'austen-letter':/^Chapter 3[56]$/,
  'macbeth-01':/^Act 1, Scene 3$/,'macbeth-02':/^Act 1, Scene [57]$/,'macbeth-03':/^Act 1, Scene 7$/,
  'frankenstein-01':/^Letter I{1,2}$/,'frankenstein-02':/^Chapter [45]$/,'frankenstein-03':/^Chapter 5$/,
  'christmas-carol-01':/^Stave 1$/,'christmas-carol-02':/^Stave [12]$/,'christmas-carol-03':/^Stave [13]$/,
  'tempest-01':/^Act 1, Scene 1$/,'tempest-02':/^Act 1, Scene 2$/,'tempest-03':/^Act 1, Scene 2$/,
  'douglass-literacy-01':/^Chapter VI$/,'douglass-literacy-02':/^Chapter VII$/,'douglass-literacy-03':/^Chapter VII$/,
 };
 for(const [id,ids] of Object.entries(packets.lessons)){
  const rule=allowed[id]??Object.entries(allowed).find(([prefix])=>id.startsWith(prefix))?.[1];
  if(rule)for(const cardId of ids)assert.match(packets.cards[cardId as keyof typeof packets.cards].locator,rule,id);
 }
});

test('unknown lessons, tampered context, and invented source packets fail closed',()=>{
 for(const id of ['','constructor','__proto__','odyssey-ix-99','../../arbitrary'])assert.throws(()=>prepareCatalogLesson(id));
 const world=prepareCatalogLesson('odyssey-ix-01').world!;
 world.evidence[0].context!.text='A made-up replacement';
 assert.throws(()=>validateWorld(world),/does not match/);
});

test('Alexandria preserves source kinds and gives the replacement patron a distinct conditional consequence',()=>{
 const a=prepareCatalogLesson('alexandria-01').world!,b=prepareCatalogLesson('alexandria-02').world!;
 assert.deepEqual(a.evidence,initialWorld.evidence);
 assert.equal(b.nodes[2].activity,1);assert.notEqual(a.nodes[2].consequence,b.nodes[2].consequence);
 assert.equal(scenarioAllowed(initialWorld),true);
});

test('model-generated lessons cannot acquire authored curriculum identity or unverified context',()=>{
 const world=prepareCatalogLesson('austen-letter-02').world!;
 const passages=world.evidence.map(e=>({id:e.id,text:e.text,locator:e.context!.locator}));
 const generated=groundLesson({...world,intervention:'What if a reader missed a detail?'},passages,'Austen','Chapters 35–36');
 assert.equal(generated.lessonPack?.curriculum,undefined);
 assert.ok(generated.evidence.every(e=>e.context===undefined));
});

test('runtime teaching tasks and boundaries match the reviewed planning catalog',()=>{
 assert.deepEqual(catalog.worlds,planningCatalog.worlds);
 const austen=prepareCatalogLesson('austen-letter-02');
 assert.match(austen.range,/Chapter 36/);
 assert.match(austen.world!.nodes[0].mechanism,/first reading, rereading, and self-assessment/);
 assert.ok(austen.world!.evidence.every(e=>e.context?.locator.startsWith('Chapter 36')));
 for(const entry of catalog.worlds){
  const world=prepareCatalogLesson(entry.lessons[0].id).world!;
  assert.deepEqual(world.lessonPack!.curriculum!.teachingNotes,entry.cautions);
  assert.ok(world.lessonPack!.characters.every(c=>c.perspective.includes('Do not require absent passages')));
 }
});

test('reviewed Dickens boundary preserves a complete sentence and its source continuation',()=>{
 const card=packets.cards['46-420-0'];
 assert.ok(card.text.endsWith('steeped in sage and onion to the eyebrows!'));
 const source=packets.sources['46-420'].text;
 assert.equal(source.slice(card.start,card.end),card.text);
 assert.ok(source.slice(card.end).startsWith(' But now, the plates being changed'));
 assert.equal(prepareCatalogLesson('christmas-carol-03').world!.lessonPack!.curriculum!.version,packets.version);
});

test('edition cautions survive world validation without altering the quoted speaker',()=>{
 const world=prepareCatalogLesson('tempest-03').world!;
 const card=world.evidence.find(e=>e.id==='1540-170-0')!;
 assert.match(card.text,/^PROSPERO\./);
 assert.match(card.title,/this edition/);
 assert.match(card.context!.editorialNote!,/Folger assigns it to Miranda/);
 assert.match(world.lessonPack!.curriculum!.sourceNote,/verse line breaks/);
 const odyssey=prepareCatalogLesson('odyssey-ix-03').world!;
 assert.ok(odyssey.evidence.some(e=>e.context?.editorialNote?.includes('Footnote bodies are not included')));
});

test('formative review examples use their assigned packet and mark intentional fabricated quotes',()=>{
 assert.equal(formativeExamples.packetVersion,packets.version);
 assert.equal(new Set(formativeExamples.examples.map(e=>e.id)).size,12);
 for(const example of formativeExamples.examples){
  const world=prepareCatalogLesson(example.lessonId).world!;
  const available=world.evidence.filter(e=>example.evidenceIds.includes(e.id));
  assert.equal(available.length,example.evidenceIds.length);
  for(const phrase of example.quotedPhrases){
   assert.ok(example.learnerText.includes(phrase));
   const matched=available.some(e=>e.text.includes(phrase));
   assert.equal(matched,example.kind!=='fabricated-quotation',example.id);
  }
 }
});
