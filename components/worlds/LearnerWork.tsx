'use client';
import type {StudentState} from '@/lib/world';
import {turnId} from '@/lib/learning';

export default function LearnerWork({student,onEvidence}:{student:StudentState;onEvidence?:(id:string)=>void}){
 return <section className="learner-work"><h3>{student.name}&apos;s reasoning</h3><p><strong>Starting prediction:</strong> {student.prediction?.text??'Not recorded in earlier work.'}</p>
 {student.turns.map((turn,i)=>{
  const previous=student.turns.find((t,n)=>turnId(t,n)===turn.revisesTurnId);
  return <details key={turnId(turn,i)} open={i===student.turns.length-1}><summary>Explanation {i+1}{turn.revisesTurnId?turn.revisionChanged?' · revision submitted':' · unchanged resubmission':''}</summary>
   {previous&&<><strong>Before</strong><blockquote>{previous.claim}</blockquote></>}<strong>{previous?'After':'Explanation'}</strong><blockquote>{turn.claim}</blockquote>
   {turn.citations?.length?turn.citations.map((c,n)=><div className="saved-citation" key={n}>{onEvidence?<button className="text-button" onClick={()=>onEvidence(c.evidenceId)}>Open {c.evidenceId} · selected passage</button>:<strong>{c.evidenceId} · selected passage</strong>}<blockquote>{c.quote}</blockquote><p>{c.relevance}</p><small>Source version {c.sourceVersion.slice(0,12)}</small></div>):<p className="helper">No structured passages were selected for this answer.</p>}
   <p><strong>Feedback:</strong> {turn.result.nextQuestion}</p>{turn.result.items.map(item=><p key={item.key}>{item.earned?'✓':'○'} {item.key}: {item.reason}</p>)}{turn.reflection&&<p><strong>What changed and why:</strong> {turn.reflection}</p>}
  </details>;
 })}{student.archiveReflection&&<p><strong>Archive reflection:</strong> {student.archiveReflection.text}</p>}
 <p className="helper">Feedback is provisional. Compare the actual wording and evidence; attempts and unlocks do not measure improvement.</p></section>;
}
