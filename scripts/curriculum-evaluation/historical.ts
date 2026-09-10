import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {prepareCatalogLesson} from '../../lib/curriculum';
import fixtures from '../../docs/curriculum/HISTORICAL-FEEDBACK-CASES.json';

export function historicalFixtures(){
 const notes=readFileSync(new URL('../../lib/curriculum/sourceNotes.json',import.meta.url));
 if(createHash('sha256').update(notes).digest('hex')!==fixtures.sourceNotesSha256)throw new Error('Historical context notes changed. Review the historical feedback cases before evaluating.');
 for(const example of fixtures.examples){
  const world=prepareCatalogLesson(example.lessonId).world!;
  const sourceMaterials=world.evidence.flatMap(e=>[e.text,e.context?.text??'']);
  if(example.kind==='fabricated-quotation'&&example.quotedPhrases.some(phrase=>sourceMaterials.some(text=>text.toLowerCase().includes(phrase.toLowerCase()))))throw new Error(`The supposed fabricated quotation occurs in the packet for ${example.id}.`);
  for(const assertion of example.contextAssertions){
   const evidence=world.evidence.find(e=>e.id===assertion.evidenceId&&example.evidenceIds.includes(e.id));
   const context=evidence?.context;
   const note=assertion.material==='readingNote'?context?.readingNote:assertion.material==='editorialNote'?context?.editorialNote:undefined;
   if(!note?.includes(assertion.text)||sourceMaterials.some(text=>text.includes(assertion.text)))throw new Error(`The source/context distinction changed in ${example.id}. Review its feedback expectation.`);
   if(example.kind==='context-misattribution'&&!example.learnerText.includes(assertion.text))throw new Error(`The intended note misattribution is missing in ${example.id}.`);
  }
 }
 return fixtures;
}
