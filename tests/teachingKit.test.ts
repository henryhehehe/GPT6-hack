import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classroomLearners,learnerSummary,learningReportHtml,lessonKitHtml,teachingPlan,type Learner} from '../lib/teachingKit';
import {initialWorld,type Turn} from '../lib/world';
import {prepareCatalogLesson} from '../lib/curriculum';
import catalog from '../lib/curriculum/catalog.json';

function turn(claim:string,scenario=false,worldVersion=1):Turn {
  return {claim,scenario,worldVersion,npc:'library',at:'2026-09-10T18:00:00Z',result:{reply:'Consider an alternative.',score:0,unlocked:false,responseId:'test',latencyMs:0,evidenceIds:['strabo'],nextQuestion:'What could change?',items:[{key:'claim',earned:false,excerpt:'',reason:'Explain the claim.'},{key:'evidence',earned:false,excerpt:'',reason:'Read the source.'},{key:'mechanism',earned:false,excerpt:'',reason:'Connect cause and effect.'},{key:'limitation',earned:false,excerpt:'',reason:'Consider a patron.'}]}};
}
function learner(id:string,turns:Turn[]=[]):Learner {return {id,name:id,turns,zone:'library',evidence:[],unlocked:false};}

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

test('learning reports retain exact selected quotes, prediction and linked revision reflection safely',()=>{
 const first={...turn('A patron can support learning.'),id:'first'};
 const revised={...turn('A patron may help if the support continues.'),id:'second',revisesTurnId:'first',revisionChanged:true,reflection:'I added a condition after reading the source.',citations:[{evidenceId:'strabo',material:'text' as const,sourceVersion:'a'.repeat(64),start:0,end:24,quote:'<script>selected</script>',relevance:'The source supports <b>conditional</b> reasoning.'}]};
 const student={...learner('B',[first,revised]),prediction:{text:'My original prediction',at:'now',worldVersion:1},archiveReflection:{text:'Another interpretation remains possible.',at:'later',worldVersion:1}};
 const html=learningReportHtml(initialWorld,[student],undefined,'now');
 for(const text of ['My original prediction','Revises submission 1','I added a condition','Another interpretation','Student-selected passages','a'.repeat(64),'&lt;script&gt;selected&lt;/script&gt;','&lt;b&gt;conditional&lt;/b&gt;'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('<script>'));assert.equal(learnerSummary(learner('B',[turn('Same words.'),turn('SAME WORDS!!!')])).status,'Same wording');
});
