import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {initialWorld,preserveHistoricalSources,validateWorld} from '../lib/world';
import {groundLesson} from '../lib/lessonBuilder';
import {prepareCatalogLesson} from '../lib/curriculum';
import packets from '../lib/curriculum/packets.json';
import manifest from '../docs/curriculum/sources/manifest.json';
import historicalCases from '../docs/curriculum/HISTORICAL-FEEDBACK-CASES.json';

test('new Alexandria uses the saved Jones quotation and separate contextual explanation',()=>{
 const evidence=initialWorld.evidence.find(e=>e.id==='strabo')!;
 const text=readFileSync(new URL('../docs/curriculum/sources/strabo-17-1-8.txt',import.meta.url),'utf8');
 const html=readFileSync(new URL('../docs/curriculum/sources/strabo-17-1-8.html',import.meta.url));
 assert.equal(evidence.text,text);
 assert.equal(evidence.text,packets.cards.strabo.text);
 assert.equal(evidence.context!.sourceVersion,createHash('sha256').update(text).digest('hex'));
 assert.equal(createHash('sha256').update(html).digest('hex'),manifest['strabo-17-1-8'].retrievedHtmlSha256);
 assert.match(text,/formerly was appointed by the kings, but is now appointed by Caesar\.$/);
 assert.ok(!text.includes('trade'));
 assert.match(evidence.context!.readingNote!,/does not establish a trade-funded budget/);
 assert.equal(evidence.context!.text.slice(evidence.context!.start,evidence.context!.end),text);
});

test('historical context and reference links survive validation, while legacy saved evidence stays unchanged',()=>{
 for(const id of ['alexandria-01','declaration-01','douglass-literacy-01','seneca-falls-02','tempest-03']){
  const world=validateWorld(JSON.parse(JSON.stringify(prepareCatalogLesson(id).world)));
  assert.ok(world.evidence.some(e=>e.context?.readingNote&&e.context.references?.length));
 }
 const legacy=structuredClone(initialWorld);
 legacy.evidence[0]={id:'strabo',title:'A community of scholars',text:'Strabo describes a shared dining hall and a learned community at the Museum, within the royal palaces. This supports an institutional context; it does not establish trade as its only source of funding.',kind:'source',source:'Strabo, Geography 17.1.8 · https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/17A1*.html',zone:'library'};
 assert.deepEqual(validateWorld(legacy),legacy);
 assert.equal(validateWorld(legacy).evidence[0].context,undefined);
});

test('scenario authoring restores canonical provenance and rejects missing or altered sources',()=>{
 const generated=structuredClone(initialWorld);
 delete generated.evidence[0].context;
 generated.evidence[0].title='A changed model title';
 assert.deepEqual(preserveHistoricalSources(generated).evidence[0],initialWorld.evidence[0]);
 generated.evidence[0].text='A false quotation about trade taxes.';
 assert.throws(()=>preserveHistoricalSources(generated),/did not match/);
 generated.evidence[0].kind='teaching-prop';
 assert.throws(()=>preserveHistoricalSources(generated),/omitted/);
});

test('model-generated lessons cannot mint trusted historical notes or reference links',()=>{
 const world=prepareCatalogLesson('seneca-falls-02').world!;
 world.evidence[0].context!.readingNote='A fabricated historical assertion.';
 world.evidence[0].context!.references=[{title:'Invented authority',url:'https://example.com/invented'}];
 const passages=world.evidence.map(e=>({id:e.id,text:e.text,locator:e.context!.locator}));
 const generated=groundLesson(world,passages,'Declaration of Sentiments','Selected grievances');
 assert.ok(generated.evidence.every(e=>!e.context));
 assert.equal(generated.lessonPack?.curriculum,undefined);
});

test('historical feedback cases match the assigned quotations and separately labeled notes',()=>{
 assert.equal(historicalCases.packetVersion,packets.version,'Review these cases when the packet changes.');
 const notes=readFileSync(new URL('../lib/curriculum/sourceNotes.json',import.meta.url));
 assert.equal(historicalCases.sourceNotesSha256,createHash('sha256').update(notes).digest('hex'),'Review the case expectations when context notes change.');
 assert.equal(new Set(historicalCases.examples.map(e=>e.id)).size,historicalCases.examples.length);
 for(const example of historicalCases.examples){
  const world=prepareCatalogLesson(example.lessonId).world!;
  const selected=world.evidence.filter(e=>example.evidenceIds.includes(e.id));
  assert.equal(selected.length,example.evidenceIds.length,`${example.id}: missing or repeated evidence`);
  const sourceMaterials=world.evidence.flatMap(e=>[e.text,e.context?.text??'']);
  for(const phrase of example.quotedPhrases){
   assert.ok(example.learnerText.includes(phrase),`${example.id}: quotation absent from the learner answer`);
   if(example.kind==='fabricated-quotation'){
    assert.ok(!sourceMaterials.some(text=>text.toLowerCase().includes(phrase.toLowerCase())),`${example.id}: supposed fabrication occurs in the source`);
   }else{
    assert.ok(selected.some(e=>e.text.includes(phrase)),`${example.id}: legitimate quotation absent from selected cards`);
   }
  }
  for(const assertion of example.contextAssertions){
   const evidence=selected.find(e=>e.id===assertion.evidenceId);
   assert.ok(evidence,`${example.id}: context refers to unselected evidence`);
   assert.ok(['readingNote','editorialNote'].includes(assertion.material));
   const context=evidence.context!;
   const note=assertion.material==='readingNote'?context.readingNote:context.editorialNote;
   assert.ok(note?.includes(assertion.text),`${example.id}: missing context statement`);
   assert.ok(!sourceMaterials.some(text=>text.includes(assertion.text)),`${example.id}: note quotation also occurs in the source; reassess attribution expectation`);
   if(example.kind==='context-misattribution')assert.ok(example.learnerText.includes(assertion.text));
  }
  if(example.kind==='fabricated-quotation')assert.ok(example.quotedPhrases.length>0);
  if(example.kind==='context-misattribution')assert.ok(example.contextAssertions.length>0);
 }
});
