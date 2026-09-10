import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkEvaluation} from '../scripts/curriculum-evaluation/runner';
import historicalCases from '../docs/curriculum/HISTORICAL-FEEDBACK-CASES.json';
import captured from './fixtures/historical-claim-credit.json';

test('the recorded invented-consent claim earns a review flag without rewriting its historical score',()=>{
 const example=historicalCases.examples.find(e=>e.id===captured.exampleId)!;
 const before=structuredClone(captured.evaluation);
 const flags=checkEvaluation(captured.evaluation,example);
 assert.equal(flags.length,1);
 assert.match(flags[0],/Claim credit/);
 assert.equal(captured.evaluation.score,1);
 assert.equal(captured.evaluation.items.find(i=>i.key==='evidence')!.earned,false);
 assert.deepEqual(captured.evaluation,before);
});

test('claim-credit review distinguishes deliberate misattribution from legitimate disagreement and uncertainty',()=>{
 for(const id of ['tempest-03-history-editorial-in-dialogue','tempest-03-history-edition-disagreement','seneca-falls-02-history-universal-needs-checking']){
  const example=historicalCases.examples.find(e=>e.id===id)!;
  const feedback=structuredClone(captured.evaluation);
  feedback.items=feedback.items.map(i=>({...i,earned:i.key==='claim',excerpt:i.key==='claim'?example.learnerText:'',reason:'Offline review fixture.'}));
  const flags=checkEvaluation(feedback,example);
  assert.equal(flags.length,example.kind==='context-misattribution'?1:0);
 }
});
