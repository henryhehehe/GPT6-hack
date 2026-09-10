import {museumObjects,museumCitation} from './museums';
import {normalizedAnswer,turnId} from './learning';
import catalog from './curriculum/catalog.json';
import {scenarioAllowed, type StudentState, type World} from './world';

export type Learner = StudentState & {id:string};
export const rubricKeys = ['claim','evidence','mechanism','limitation'] as const;
export function rubricName(world:World,key:string) {
  if(key==='mechanism')return world.lessonPack?.subject==='literature'?'Textual analysis':'Reasoning';
  if(key==='limitation')return world.lessonPack?.subject==='literature'?'Alternative reading':'Limitation / alternative';
  return key==='claim'?'Claim':'Evidence';
}
export function learnerSummary(student:Learner) {
  const first=student.turns[0], latest=student.turns.at(-1);
  const normalize=normalizedAnswer;
  const status=!latest?'No explanation yet':student.turns.length===1?'First explanation':
    first.worldVersion!==latest.worldVersion||first.scenario!==latest.scenario?'Context changed':
    normalize(first.claim)===normalize(latest.claim)?'Same wording':'Wording changed';
  return {first,latest,status,needsReview:!latest||latest.result.items.some(item=>!item.earned)};
}
export function classroomLearners(students:Learner[],previewId?:string) {
  return students.filter(student=>student.id!==previewId);
}
export function matchesReviewFocus(student:Learner,focus:string) {
  const latest=student.turns.at(-1);
  if(focus==='all')return true;
  if(focus==='unsubmitted')return !latest;
  if(focus==='review')return learnerSummary(student).needsReview;
  return !!latest?.result.items.some(item=>item.key===focus&&!item.earned);
}
export function reviewFocusCounts(students:Learner[],previewId?:string) {
  const learners=classroomLearners(students,previewId);
  return Object.fromEntries(['unsubmitted',...rubricKeys].map(key=>[key,learners.filter(student=>matchesReviewFocus(student,key)).length]));
}
export function teachingPlan(world:World,minutes:30|45|60) {
  const lesson=catalog.worlds.flatMap(entry=>entry.lessons).find(entry=>entry.id===world.lessonPack?.curriculum?.lessonId);
  const times=minutes===30?[3,9,6,4,8]:minutes===60?[5,20,12,8,15]:[5,15,8,5,12];
  const analysis=world.lessonPack?.subject==='literature'?'how the language supports your interpretation':'why the evidence supports your explanation';
  return [
    {title:'Predict',minutes:times[0],instruction:`Ask: ${world.objective} Students save a starting prediction in the app, or write one on paper, before reading.`},
    {title:'Read & investigate',minutes:times[1],instruction:lesson?.evidenceActivity??'Read the evidence cards. Identify what each source establishes and separate it from assumptions and invented teaching props.'},
    {title:'Make a case',minutes:times[2],instruction:`Write a claim, cite a specific detail, and explain ${analysis}. Name a limitation or an alternative. Submit in the app or write on the worksheet.`},
    {title:'Challenge',minutes:times[3],instruction:world.lessonPack?.curriculum?.teacherChallenge??'Could another explanation fit the same evidence? Which assumption would you need to check?'},
    {title:'Revise & reflect',minutes:times[4],instruction:world.lessonPack?.curriculum?.revisionTask??'Reconsider your first explanation. Write a revised answer and identify the evidence that changed or strengthened your reasoning.'},
  ];
}

// Downloads contain untrusted source and learner text; never interpolate it as markup.
export const escapeHtml=(value:unknown)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const p=(value:unknown)=>`<p>${escapeHtml(value)}</p>`;
const documentHtml=(title:string,body:string)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escapeHtml(title)}</title><style>body{max-width:850px;margin:40px auto;padding:0 24px;font:16px/1.6 system-ui,sans-serif;color:#183e3e}h1,h2,h3{line-height:1.2}h1{font-size:30px}h2{margin-top:32px}p,blockquote,li{white-space:pre-wrap;overflow-wrap:anywhere}article{border-top:1px solid #bac9c4;padding:16px 0}small{font-size:14px;color:#435b54}blockquote{margin:12px 0;padding:12px 18px;border-left:3px solid #638a7a;background:#f3f6f4}.answer{min-height:90px;border-bottom:1px solid #aab8b2}.page{break-before:page}footer{margin-top:30px;font-size:14px}@media print{body{margin:0;padding:0;color:#111}.screen{display:none}h2,h3{break-after:avoid}blockquote{background:none}.answer{min-height:90px}@page{margin:18mm}}</style></head><body><small>COUNTERFACTUAL WORLDS</small><h1>${escapeHtml(title)}</h1><p class="screen">Use your browser’s Print command to print or save as PDF. This downloaded document works offline.</p>${body}<footer>Teacher review required. AI feedback is provisional; activity and changed wording do not establish learning gains.</footer></body></html>`;

export function lessonKitHtml(world:World,minutes:30|45|60) {
  const sequence=teachingPlan(world,minutes);
  const objects=museumObjects.filter(item=>world.museumObjectIds?.includes(item.id));
  const criteria=rubricKeys.map(key=>rubricName(world,key)).join(' · ');
  return documentHtml(`${world.title} — teaching kit`,
    `<h2>Teacher guide</h2>${p(world.objective)}${p(`${minutes}-minute planning estimate · Suggested secondary audience; review reading demands for your class.`)}
    ${p(`Reading: ${world.lessonPack?.readingRange??'Alexandria source card, explicit funding assumption, and invented harbor ledger.'}`)}
    ${world.lessonPack?.curriculum?`<h3>Source & teaching notes</h3>${p(world.lessonPack.curriculum.sourceNote)}${(world.lessonPack.curriculum.teachingNotes??[]).map(p).join('')}`:''}
    ${scenarioAllowed(world)?p(`Optional hypothetical branch: ${world.intervention}`):p('Close reading / source investigation. Keep the assigned source unchanged.')}
    <h3>Before class</h3><ul><li>Check every excerpt, source label, reading boundary, and suitability for your learners.</li><li>Preview the lesson and test the invitation on a student device; hosting access is separate from the invitation.</li><li>Choose individual exploration, paired reading, or a teacher-led projection. Print the worksheet as a fallback.</li></ul>
    <h3>Teaching sequence</h3>${sequence.map(step=>`<article><h3>${step.minutes} min · ${escapeHtml(step.title)}</h3>${p(step.instruction)}</article>`).join('')}
    ${objects.length?`<h3>Museum object discussion · optional, within investigation time</h3>${p('Project a museum photograph before reading. Ask learners to separate observation, interpretation, and uncertainty. Museum objects are contextual supplements; the app assesses the assigned source cards. Open the linked photographs online before class; this download retains the records and questions offline.')}${objects.map(item=>`<article><h3>${escapeHtml(item.title)}</h3>${p(`${item.date} · ${item.medium}`)}${p(item.prompt)}${p(`Limit: ${item.limits}`)}<small>${escapeHtml(museumCitation(item))}</small><p><a href="${escapeHtml(item.recordUrl)}">Original museum record</a></p></article>`).join('')}`:''}
    <h3>Support & extension</h3>${p('Support: read one card aloud, pair a reader with a recorder, and use “My claim is… The source says… This supports my claim because… One limitation is…”. Keep the original source available.')}${p('Extend: defend a competing interpretation using the same evidence. Explain what additional source would help decide between the interpretations.')}
    <h3>Assess the work</h3>${p(criteria)}${p('Look for a defensible interpretation and an accurate use of evidence. Invite supported disagreement. Compare the initial and revised writing yourself; do not convert the AI score directly into a grade.')}
    <section class="page"><h2>Student investigation</h2>${p(world.title)}${p(`Question: ${world.objective}`)}${p('Name / class: ____________________________________')}
    <h3>1. Before reading: what do you think, and why?</h3><div class="answer"></div>
    ${objects.length?`<h3>Optional: look closely at a museum object</h3>${p('Object / accession: ____________________________________')}${p('One detail I can observe:')}<div class="answer"></div>${p('My interpretation, and one thing the object cannot establish:')}<div class="answer"></div>${p('Compare with the written source below. Keep observations distinct from assumptions.')}`:''}
    <h3>2. Read the evidence</h3>${world.evidence.map(card=>`<article><h3>${escapeHtml(card.title)}</h3>${p(card.kind==='source'?'Source material — check whether quoted or paraphrased':card.kind==='assumption'?'Scenario assumption':'Invented teaching prop')}<blockquote>${escapeHtml(card.text)}</blockquote><small>${escapeHtml(card.source)}</small>${card.context?`${card.context.editorialNote?p(card.context.editorialNote):''}${card.context.readingNote?p(card.context.readingNote):''}<details open><summary>Reading context · ${escapeHtml(card.context.locator)}</summary>${p(card.context.text)}</details>`:''}</article>`).join('')}
    <h3>3. Choose a detail and explain what it supports</h3>${p('Source title / locator, quoted detail, and why it matters:')}<div class="answer"></div>
    <h3>4. Make your case</h3>${p(criteria)}<div class="answer"></div>
    <h3>5. Consider a challenge</h3>${p(sequence[3].instruction)}<div class="answer"></div>
    <h3>6. Revise and reflect</h3>${p(sequence[4].instruction)}${p('My revised explanation, and what changed (or stayed the same) and why:')}<div class="answer"></div>
    <small>Paper responses remain on paper; this worksheet does not sync with the app.</small></section>`);
}

export function learningReportHtml(world:World,students:Learner[],previewId:string|undefined,generatedAt:string,includePractice=false) {
  const joined=classroomLearners(students,previewId);
  const practice=includePractice?students.find(student=>student.id===previewId):undefined;
  const learners=practice?[practice,...joined]:joined;
  return documentHtml(`${world.title} — learning report`,
    `${p(`Downloaded: ${generatedAt}`)}${p(world.objective)}${p(`${joined.length} joined learners. ${practice?'Practice learner included separately.':'Teacher preview excluded.'} Snapshot of submitted work; unsent drafts and paper responses are not included.`)}${p('Keep this report with your classroom records: it contains learner names and writing. AI-referenced source IDs alone are not proof of student-selected citations. Where recorded, exact selected quotes, source versions, predictions, and revision reflections are included below; older submissions may lack them.')}
    ${learners.length?learners.map(student=>{const summary=learnerSummary(student);return `<section><h2>${escapeHtml(student.id===previewId?'Your practice learner':student.name)}</h2>${p(`${student.turns.length} submissions · ${summary.status}`)}${student.prediction?`<h3>Starting prediction</h3>${p(student.prediction.text)}${p(`${student.prediction.at} · World v${student.prediction.worldVersion}`)}`:p('No starting prediction recorded.')}${student.archiveReflection?`<h3>Archive reflection</h3>${p(student.archiveReflection.text)}`:''}${student.turns.length?student.turns.map((turn,index)=>`<article><h3>Submission ${index+1}</h3>${p(`${turn.at} · World v${turn.worldVersion} · ${turn.scenario?'Hypothetical branch':'Baseline'}`)}<blockquote>${escapeHtml(turn.claim)}</blockquote>${turn.revisesTurnId?`${p(`Revises submission ${student.turns.findIndex((prior,i)=>turnId(prior,i)===turn.revisesTurnId)+1} · ${turn.revisionChanged?'Changed wording':'Unchanged resubmission'}`)}${p(`Reason for revision: ${turn.reflection??''}`)}`:''}${turn.citations?.length?`<h4>Student-selected passages</h4>${turn.citations.map(c=>`<blockquote>${escapeHtml(c.quote)}</blockquote>${p(`Source ${c.evidenceId} · ${c.material} · UTF-16 range ${c.start}–${c.end} · Version ${c.sourceVersion}`)}${p(`Learner explanation: ${c.relevance}`)}`).join('')}`:p('No student-selected passages recorded.')}${p(`Provisional AI feedback: ${turn.result.reply}`)}<ul>${turn.result.items.map(item=>`<li>${escapeHtml(rubricName(world,item.key))}: ${item.earned?'AI marked supported':'AI suggested review'} — ${escapeHtml(item.reason)}${item.excerpt?` (learner excerpt: “${escapeHtml(item.excerpt)}”)`:''}</li>`).join('')}</ul>${p(`AI-referenced evidence IDs: ${turn.result.evidenceIds.join(', ')||'None'}`)}${p(`Next question: ${turn.result.nextQuestion}`)}</article>`).join(''):p('No explanation submitted yet.')}</section>`;}).join(''):p('No joined learners yet.')}`);
}

export function investigationDownloadHtml(world:World,student:StudentState,draft:string,scenario:boolean,generatedAt:string) {
  const saved=world.evidence.filter(card=>student.evidence.includes(card.id));
  return documentHtml(`${world.title} — my investigation`,
    `${p(`Downloaded: ${generatedAt}`)}${p(world.objective)}${p('A copy from this browser. Downloading does not submit your draft to a teacher or request AI feedback.')}
    <h2>My current draft — not submitted</h2>${p(scenario?'Writing about the hypothetical branch.':'Writing about the baseline.')}<blockquote>${escapeHtml(draft.trim()?draft:'No open draft.')}</blockquote>
    <h2>Evidence saved in my journal</h2>${saved.length?saved.map(card=>`<article><h3>${escapeHtml(card.title)}</h3>${p(card.kind==='source'?'Source material':card.kind==='assumption'?'Scenario assumption':'Invented teaching prop')}<blockquote>${escapeHtml(card.text)}</blockquote>${p(card.source)}</article>`).join(''):p('No evidence saved yet.')}
    <h2>Previously submitted explanations</h2>${student.turns.length?student.turns.map((turn,i)=>`<article><h3>Submission ${i+1}</h3>${p(`${turn.at} · World v${turn.worldVersion} · ${turn.scenario?'Hypothetical branch':'Baseline'}`)}<blockquote>${escapeHtml(turn.claim)}</blockquote>${p(`Provisional AI feedback: ${turn.result.reply}`)}${p(`Next question: ${turn.result.nextQuestion}`)}</article>`).join(''):p('No submitted explanations. You can keep writing and discuss this document with a teacher.')}`);
}
