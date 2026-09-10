'use client';

import {useState} from 'react';
import {museumObjects} from '@/lib/museums';
import {Download,ClipboardList,FileText,ArrowRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {classroomLearners,learnerSummary,learningReportHtml,lessonKitHtml,rubricKeys,rubricName,teachingPlan,matchesReviewFocus,reviewFocusCounts,type Learner} from '@/lib/teachingKit';
import type {World} from '@/lib/world';
import {downloadHtml} from '@/lib/download';
import './teaching-kit.css';

export default function TeachingKit({world,students,previewId,view,onClose,onPrepareHelp,helpDisabled=false,demoMode=false}:{world:World;students:Learner[];previewId?:string;view:'plan'|'report'|null;onClose:()=>void;onPrepareHelp?:(studentId:string)=>void;helpDisabled?:boolean;demoMode?:boolean}) {
  const [minutes,setMinutes]=useState<30|45|60>(45),[filter,setFilter]=useState('all');
  const [downloaded,setDownloaded]=useState('');
  const [includePractice,setIncludePractice]=useState(demoMode);
  const learners=classroomLearners(students,previewId);
  const submitted=learners.filter(learner=>learner.turns.length>0).length;
  const practice=students.find(student=>student.id===previewId);
  const reviewable=includePractice&&practice?[practice,...learners]:learners;
  const visible=reviewable.filter(learner=>matchesReviewFocus(learner,filter));
  const reviewCounts=reviewFocusCounts(students,previewId);
  function save(kind:'plan'|'report') {
    downloadHtml(kind==='plan'?'counterfactual-worlds-teaching-kit.html':'counterfactual-worlds-learning-report.html',kind==='plan'?lessonKitHtml(world,minutes):learningReportHtml(world,students,previewId,new Date().toISOString(),includePractice));
    setDownloaded('Download prepared. Open the HTML file and use your browser’s Print command to print or save as PDF.');
  }
  return <Dialog open={view!==null} onOpenChange={open=>{if(!open){setDownloaded('');onClose();}}}><DialogContent className="teaching-kit">
    <header><span className="eyebrow">{view==='plan'?'PLAN YOUR LESSON':'REVIEW SUBMITTED WORK'}</span><DialogTitle>{view==='plan'?'Your teaching guide & worksheet':'Classroom learning report'}</DialogTitle><DialogDescription>{world.title} · {world.objective}</DialogDescription></header>
    {view==='plan'?<>
      <div className="kit-toolbar"><label>Lesson length<select value={minutes} onChange={event=>setMinutes(Number(event.target.value) as 30|45|60)}><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option></select></label><button className="primary-button" onClick={()=>save('plan')}><Download size={16}/> Download guide & worksheet</button></div>
      <p className="kit-note">Planning estimate · Suggested secondary audience; check the reading level for your learners. Download includes source cards, a student worksheet, and a paper fallback.</p>
      {!!world.museumObjectIds?.length&&<section className="kit-prep"><h3>Museum objects in this lesson</h3><p>During investigation time, project an object and ask: What can we observe? What are we interpreting? What remains uncertain? The download includes records, questions, and space for observations.</p><ul>{museumObjects.filter(item=>world.museumObjectIds?.includes(item.id)).map(item=><li key={item.id}><a href={item.recordUrl} target="_blank" rel="noreferrer">{item.title}</a> · {item.date}</li>)}</ul><p>Context for discussion. Argument feedback still uses the assigned source cards.</p></section>}
      <section className="kit-prep"><h3><ClipboardList size={18}/> Before students arrive</h3><ul><li>Review the sources and reading boundary.</li><li>Preview as a student and test the invitation on a student device. Hosting access must also be granted.</li><li>Choose individual exploration, paired reading, or teacher-led projection. Print the worksheet if devices are unavailable.</li></ul></section>
      <ol className="kit-sequence">{teachingPlan(world,minutes).map(step=><li key={step.title}><span>{step.minutes} min</span><div><h3>{step.title}</h3><p>{step.instruction}</p></div></li>)}</ol>
      <section><h3>What to look for</h3><p>{rubricKeys.map(key=>rubricName(world,key)).join(' · ')}</p><p>Accept a supported disagreement. Ask students what changed and why. Review the actual writing before deciding whether the reasoning improved.</p></section>
      <details><summary>Support different readers</summary><p>Read a card aloud or pair a reader with a recorder. Offer: “My claim is… The source says… This matters because… One limitation is…”. Keep the original source available. For extension, ask for a competing explanation using the same evidence.</p></details>
    </>:<>
      <div className="kit-toolbar"><label>Show<select value={filter} onChange={event=>setFilter(event.target.value)}><option value="all">All joined learners</option><option value="review">No answer or AI suggests review</option><option value="unsubmitted">No explanation yet</option>{rubricKeys.map(key=><option key={key} value={key}>{rubricName(world,key)} · AI suggests review</option>)}</select></label><button className="primary-button" disabled={!reviewable.length} onClick={()=>save('report')}><Download size={16}/> Download all submitted work</button></div>
      <div className="kit-stats"><span><strong>{learners.length}</strong> joined learners</span><span><strong>{submitted}</strong> submitted an explanation</span><span><strong>{learners.length-submitted}</strong> awaiting a first explanation</span></div>
      <p className="kit-note">Practice work is excluded from joined-learner counts. AI feedback is provisional, not a grade. Wording changes are not proof of improvement. Paper responses and unsent drafts are not included.</p>
      {practice&&<label className="kit-practice-toggle"><input type="checkbox" checked={includePractice} onChange={event=>setIncludePractice(event.target.checked)}/> Include my practice learner in the report</label>}
      {!!learners.length&&<section className="kit-review-focus" aria-label="Choose work to review"><h3>Where to look next</h3><div><button aria-pressed={filter==='unsubmitted'} onClick={()=>setFilter('unsubmitted')}>No explanation <strong>{reviewCounts.unsubmitted}</strong></button>{rubricKeys.map(key=><button key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{rubricName(world,key)} <strong>{reviewCounts[key]}</strong></button>)}</div><p className="kit-note">Criteria counts use each learner’s latest AI feedback. A learner may appear under more than one criterion. Verify the writing before deciding what support is needed.</p></section>}
      {!reviewable.length?<div className="kit-empty"><FileText size={24}/><h3>No student work yet</h3><p>Invite learners from the studio. Their submitted explanations will appear here; your student preview stays separate.</p></div>:!visible.length?<p>No learners match this filter. Teachers should still review every learner’s work.</p>:visible.map(learner=>{const {first,latest,status}=learnerSummary(learner);return <article className="kit-learner" key={learner.id}><header><h3>{learner.id===previewId?'Your practice learner':learner.name}</h3><span>{status}</span></header><p>{learner.turns.length} submissions · {learner.evidence.length} cards saved</p>{latest?<>
        {status==='Context changed'&&<p className="kit-note">The world version or scenario differs between these answers. Review their contexts before comparing.</p>}
        <div className="kit-comparison"><section><h4>First explanation</h4><p className="kit-context">World v{first.worldVersion} · {first.scenario?'Hypothetical branch':'Baseline'}</p><blockquote>{first.claim}</blockquote></section>{learner.turns.length>1&&<section><h4>Latest explanation</h4><p className="kit-context">World v{latest.worldVersion} · {latest.scenario?'Hypothetical branch':'Baseline'}</p><blockquote>{latest.claim}</blockquote></section>}</div>
        <details><summary>Latest AI feedback & next question</summary><p>{latest.result.reply}</p><ul>{latest.result.items.map(item=><li key={item.key}><strong>{rubricName(world,item.key)} · {item.earned?'AI marked supported':'AI suggested review'}</strong><p>{item.reason}</p>{item.excerpt&&<blockquote>{item.excerpt}</blockquote>}</li>)}</ul><p><strong>Next question:</strong> {latest.result.nextQuestion}</p><p className="kit-note">AI-referenced evidence IDs: {latest.result.evidenceIds.join(', ')||'None'}. These are not verified student-selected citations. The download includes every submitted turn.</p></details>
      </>:<p>No explanation submitted yet. Check whether this learner needs help opening a source or starting a claim.</p>}{onPrepareHelp&&<button className="text-button learner-help-action" disabled={helpDisabled} onClick={()=>onPrepareHelp(learner.id)}>Prepare teaching help <ArrowRight size={16}/></button>}</article>;})}
      <p className="kit-note">Downloads contain learner names and writing. Keep them with your classroom records. Download includes all joined learners and your practice learner if selected, regardless of this filter.</p>
    </>}
    {downloaded&&<p className="kit-note" role="status">{downloaded}</p>}
  </DialogContent></Dialog>;
}
