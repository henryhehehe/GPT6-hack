import {test} from 'node:test';
import assert from 'node:assert/strict';
import {saveMuseumNote,removeMuseumNote} from '../lib/museumNotes';
import {investigationDownloadHtml,learningReportHtml} from '../lib/teachingKit';
import {initialWorld} from '../lib/world';
const input={objectId:'cma-142026',observation:'I see a portrait and lettering.',interpretation:'It might communicate authority.',question:'Who used this coin?'};
const at='2026-09-10T22:00:00Z';
test('notes retain separate fields, accept safe retries, and reject stale changes',()=>{
 const first=saveMuseumNote([],input,0,at);assert.equal(first.note.revision,1);assert.equal(first.note.observation,input.observation);
 const replay=saveMuseumNote(first.notes,input,0,at);assert.equal(replay.notes,first.notes);
 assert.throws(()=>saveMuseumNote(first.notes,{...input,observation:'New text'},0,at),/another tab/);
 const edited=saveMuseumNote(first.notes,{...input,observation:'New text'},1,at,1);assert.equal(edited.note.revision,2);
 assert.throws(()=>removeMuseumNote(edited.notes,input.objectId,1),/another tab/);
 assert.deepEqual(removeMuseumNote(edited.notes,input.objectId,2),[]);
 // Deletion increments the stored sequence, so a re-created note cannot match an old revision.
 const recreated=saveMuseumNote([],input,0,at,3);assert.equal(recreated.note.revision,4);assert.throws(()=>saveMuseumNote(recreated.notes,{...input,question:'Overwrite'},2,at,4),/another tab/);
});
test('unknown objects and oversized or empty observations cannot enter a notebook',()=>{
 for(const change of [{objectId:'invented'},{observation:' '},{observation:'x'.repeat(501)},{interpretation:'x'.repeat(501)},{question:'x'.repeat(301)}])assert.throws(()=>saveMuseumNote([],{...input,...change},0,at));
 assert.throws(()=>saveMuseumNote([],input,-1,at));
});
test('writing download escapes learner notes and retains original object attribution',()=>{
 const note=saveMuseumNote([],{...input,observation:'<script>alert(1)</script>'},0,at).note;
 const html=investigationDownloadHtml(initialWorld,{name:'Learner',zone:'harbor',evidence:[],turns:[],unlocked:false,museumNotes:[note]},'draft',false,at);
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('1965.552'));assert.ok(html.includes('not a museum quotation'));assert.ok(html.includes('My museum field notes'));
 const report=learningReportHtml(initialWorld,[{id:'learner',name:'Learner',zone:'harbor',evidence:[],turns:[],unlocked:false,museumNotes:[note]}],undefined,at);assert.ok(report.includes('&lt;script&gt;'));assert.ok(!report.includes('<script>'));assert.ok(report.includes('1965.552'));assert.ok(report.includes('saved museum notes'));
});

test('Met field notes retain their museum and accession in learner and teacher exports',()=>{
 const note=saveMuseumNote([],{objectId:'met-90487',observation:'I see a narrow dress with short sleeves.',interpretation:'',question:''},0,at).note;
 const student={name:'Learner',zone:'harbor' as const,evidence:[],turns:[],unlocked:false,museumNotes:[note]};
 for(const html of [investigationDownloadHtml(initialWorld,student,'',false,at),learningReportHtml(initialWorld,[{id:'learner',...student}],undefined,at)]){
  assert.ok(html.includes('The Metropolitan Museum of Art'));assert.ok(html.includes('13.49.16'));assert.ok(html.includes('ca. 1810'));assert.ok(html.includes(note.observation));
 }
});
