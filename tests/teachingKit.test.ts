import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classroomLearners,learnerSummary,learningReportHtml,lessonKitHtml,teachingPlan,matchesReviewFocus,reviewFocusCounts,investigationDownloadHtml,type Learner} from '../lib/teachingKit';
import {initialWorld,type Turn} from '../lib/world';
import {prepareCatalogLesson} from '../lib/curriculum';
import catalog from '../lib/curriculum/catalog.json';

function turn(claim:string,scenario=false,worldVersion=1):Turn {
  return {claim,scenario,worldVersion,npc:'library',at:'2026-09-10T18:00:00Z',result:{reply:'Consider an alternative.',score:0,unlocked:false,responseId:'test',latencyMs:0,evidenceIds:['strabo'],nextQuestion:'What could change?',items:[{key:'claim',earned:false,excerpt:'',reason:'Explain the claim.'},{key:'evidence',earned:false,excerpt:'',reason:'Read the source.'},{key:'mechanism',earned:false,excerpt:'',reason:'Connect cause and effect.'},{key:'limitation',earned:false,excerpt:'',reason:'Consider a patron.'}]}};
}
function learner(id:string,turns:Turn[]=[]):Learner {return {id,name:id,turns,zone:'library',evidence:[],unlocked:false};}

test('review focus counts latest feedback only, excludes the preview, and separates missing work',()=>{
  const first=turn('Initial answer'),latest=turn('Revised answer');
  latest.result.items=latest.result.items.map(item=>({...item,earned:item.key!=='limitation'}));
  const revised=learner('revised',[first,latest]),unsubmitted=learner('waiting'),preview=learner('preview',[first]);
  const counts=reviewFocusCounts([revised,unsubmitted,preview],'preview');
  assert.deepEqual(counts,{unsubmitted:1,claim:0,evidence:0,mechanism:0,limitation:1});
  assert.equal(matchesReviewFocus(unsubmitted,'evidence'),false);
  assert.equal(matchesReviewFocus(unsubmitted,'review'),true);
  assert.equal(matchesReviewFocus(revised,'limitation'),true);
  assert.equal(matchesReviewFocus(revised,'evidence'),false);
});

test('teaching sequence fits each chosen duration across all catalog lessons',()=>{
  for(const world of catalog.worlds)for(const entry of world.lessons){
    const prepared=prepareCatalogLesson(entry.id).world!;
    for(const duration of [30,45,60] as const){
      const plan=teachingPlan(prepared,duration);
      assert.equal(plan.reduce((sum,step)=>sum+step.minutes,0),duration);
      assert.equal(plan[3].instruction,prepared.lessonPack?.curriculum?.teacherChallenge);
      const kit=lessonKitHtml(prepared,duration);
      assert.ok(kit.includes('Student investigation'));
      assert.ok(kit.includes('Paper responses remain on paper'));
    }
  }
});
test('repeated answers and context changes never appear as a demonstrated improvement',()=>{
  assert.equal(learnerSummary(learner('a')).status,'No explanation yet');
  assert.equal(learnerSummary(learner('a',[turn('A claim')])).status,'First explanation');
  assert.equal(learnerSummary(learner('a',[turn('A claim'),turn('  a   CLAIM ')])).status,'Same wording');
  assert.equal(learnerSummary(learner('a',[turn('A claim'),turn('A different claim')])).status,'Wording changed');
  assert.equal(learnerSummary(learner('a',[turn('A claim'),turn('A different claim',true)])).status,'Context changed');
  assert.equal(learnerSummary(learner('a',[turn('A claim'),turn('A different claim',false,2)])).status,'Context changed');
});
test('reports exclude the teacher preview by identity and include all actual submissions',()=>{
  const preview=learner('private-preview',[turn('Preview-only answer')]);
  const student=learner('actual-learner',[turn('First answer'),turn('Middle answer'),turn('Latest answer')]);
  student.name='Teacher preview'; // A name alone must never hide a real learner.
  assert.deepEqual(classroomLearners([preview,student],preview.id),[student]);
  const report=learningReportHtml(initialWorld,[preview,student],preview.id,'2026-09-10');
  assert.ok(!report.includes('Preview-only answer'));
  for(const answer of ['First answer','Middle answer','Latest answer'])assert.ok(report.includes(answer));
  assert.ok(report.includes('1 joined learners'));
  assert.ok(report.includes('not proof of student-selected citations'));
});
test('demo reports can include actual practice work without inventing a joined learner',()=>{
  const practice=learner('practice',[turn('My own practice answer')]);
  const report=learningReportHtml(initialWorld,[practice],practice.id,'now',true);
  assert.ok(report.includes('0 joined learners'));
  assert.ok(report.includes('Your practice learner'));
  assert.ok(report.includes('My own practice answer'));
  assert.ok(!learningReportHtml(initialWorld,[practice],practice.id,'now').includes('My own practice answer'));
});
test('writing download works without submitted work and distinguishes drafts from submissions',()=>{
  const student=learner('student');student.evidence=['strabo'];
  const draft='<script>alert("draft")</script>';
  const html=investigationDownloadHtml(initialWorld,student,draft,true,'now');
  assert.ok(html.includes('My current draft — not submitted'));
  assert.ok(html.includes('No submitted explanations'));
  assert.ok(html.includes('does not submit your draft'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes(initialWorld.evidence.find(e=>e.id==='strabo')!.title));
  assert.ok(!html.includes(initialWorld.evidence.find(e=>e.id==='ledger')!.title));
});
test('standalone downloads escape hostile learner and source text and load no remote assets',()=>{
  const attack='<script src="https://attacker.invalid/x">&</script>';
  const student=learner('student',[turn(attack)]);student.name=attack;
  const world=structuredClone(initialWorld);world.title=attack;world.evidence[0].text=attack;world.evidence[0].source=attack;
  for(const html of [lessonKitHtml(world,45),learningReportHtml(world,[student],undefined,'now')]){
    assert.ok(!html.includes('<script'));
    assert.ok(html.includes('&lt;script'));
    assert.ok(!html.includes('<img'));
    assert.ok(!html.includes('<iframe'));
    assert.ok(!html.includes('<link'));
  }
});
