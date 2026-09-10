import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {initialWorld,preserveHistoricalSources,validateWorld} from '../lib/world';
import {groundLesson} from '../lib/lessonBuilder';
import {prepareCatalogLesson} from '../lib/curriculum';
import packets from '../lib/curriculum/packets.json';
import manifest from '../docs/curriculum/sources/manifest.json';

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
