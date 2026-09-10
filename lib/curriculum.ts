import catalog from './curriculum/catalog.json';
import packets from './curriculum/packets.json';
import sourceNotes from './curriculum/sourceNotes.json';
import {initialWorld,validateWorld,type World,type ZoneId} from './world';
import type {LessonDraft} from './lessonBuilder';

const zones:ZoneId[]=['harbor','market','library'];
const scenes:Record<string,'coast'|'garden'|'archive'>={'odyssey-ix':'coast','austen-letter':'garden',tempest:'coast'};
type Card=typeof packets.cards[keyof typeof packets.cards];
type Source=typeof packets.sources[keyof typeof packets.sources];

/** IDs are resolved from a pinned, authored registry. No caller-supplied world or source text is trusted. */
export function prepareCatalogLesson(lessonId:string):Pick<LessonDraft,'title'|'range'|'objective'|'format'|'sourceUrl'|'hasUpload'|'passages'|'world'|'run'>{
 const entry=catalog.worlds.find(world=>world.lessons.some(l=>l.id===lessonId));
 const selected=entry?.lessons.find(l=>l.id===lessonId);
 if(!entry||!selected)throw new Error('This lesson is not in the world library. Choose another lesson.');
 const ids=(packets.lessons as Record<string,string[]>)[lessonId];
 if(entry.id!=='alexandria'&&(!ids||ids.length!==3))throw new Error('The source packet is not available for this lesson.');
 const evidence:World['evidence']=entry.id==='alexandria'?structuredClone(initialWorld.evidence):ids.map((id,i)=>{
  const card=(packets.cards as Record<string,Card>)[id],source=(packets.sources as Record<string,Source>)[card?.sourceId];
  if(!card||!source||source.text.slice(card.start,card.end)!==card.text)throw new Error('The prepared source packet failed verification.');
  const context=source.text.slice(card.contextStart,card.contextEnd);
  return {id:card.id,title:card.title,text:card.text,kind:'source',zone:zones[i],
   source:`${entry.id==='seneca-falls'&&source.id.startsWith('declaration')?'Declaration of Independence (1776)':entry.source.title} · ${entry.id==='seneca-falls'&&source.id.startsWith('declaration')?'National Archives transcription':entry.source.edition} · ${card.locator} · ${source.url}`,
   context:{text:context,locator:`${card.locator} · bounded source context; whitespace normalized`,sourceVersion:source.sha256,start:card.start-card.contextStart,end:card.end-card.contextStart,
    editorialNote:'editorialNote' in card?card.editorialNote:undefined,
    ...(sourceNotes[entry.id as keyof typeof sourceNotes]??{})}};
 });
 const counterfactual=selected.mode==='counterfactual';
 const world:World={
  title:selected.title,subtitle:entry.title,objective:selected.inquiry,
  intervention:entry.id==='alexandria'?selected.id.endsWith('02')?'What if a patron replaced the lost funding?':initialWorld.intervention:
   counterfactual?'What if Ulysses withheld his name after escaping?':'Close reading: examine the original evidence.',
  nodes:zones.map((zone,i)=>({id:zone,title:entry.places[i],
   baseline:entry.id==='alexandria'?initialWorld.nodes[i].baseline:['Read the account','Examine its support','Compare and reconsider'][i],
   consequence:entry.id==='alexandria'?initialWorld.nodes[i].consequence:counterfactual?'Consider an invented alternative; the source stays unchanged.':'The assigned source stays unchanged.',
   mechanism:entry.id==='alexandria'?initialWorld.nodes[i].mechanism:[selected.evidenceActivity,selected.teacherChallenge,selected.revisionTask][i],
   evidenceIds:evidence.filter(e=>e.zone===zone).map(e=>e.id),activity:entry.id==='alexandria'?initialWorld.nodes[i].activity:1})),
  evidence,
  lessonPack:{subject:entry.subject as 'history'|'literature',scene:scenes[entry.id]??'archive',sourceTitle:entry.source.title,readingRange:selected.sourceRange,
   characters:zones.map((zone,i)=>({zone,name:['Source guide','Evidence guide','Reflection guide'][i],role:'Fictional reading guide',
    perspective:`Use only the assigned packet. ${selected.mode==='close-reading'?'Support analysis and alternative readings.':'Distinguish documentary support from inference.'} Accept evidence-bounded uncertainty. Do not require absent passages or outside facts. Never impersonate an author or historical witness.`,
    starters:[['Who is speaking in this source?','What does this passage establish?','What remains uncertain?'][i],selected.teacherChallenge]})),
   activities:zones.map((zone,i)=>({zone,instruction:[selected.evidenceActivity,selected.teacherChallenge,selected.revisionTask][i]})),
   curriculum:{worldId:entry.id,lessonId,version:packets.version,mode:selected.mode as 'close-reading'|'source-investigation'|'counterfactual',teacherChallenge:selected.teacherChallenge,revisionTask:selected.revisionTask,
    teachingNotes:entry.cautions,
    sourceNote:entry.id==='alexandria'?'Strabo: exact saved quotation; historical reading note is separate. Funding: assumption. Ledger: invented prop. The Mouseion is a scholarly institution, distinct from a Library building or book collection. Page and footnote markers are omitted from this quotation.':`${entry.source.edition}. Read all three cards before comparisons. Selected excerpts and bounded context only; no later events are supplied. Whitespace normalized, including verse line breaks; source page/footnote markers retained. Do not assess verse form from this normalized text.`}}
 };
 // Replacement support is an explicitly different scenario, not a claim that the institution still loses funding.
 if(lessonId==='alexandria-02'){
  world.nodes[2].consequence='A hypothetical patron maintains scholar support.';
  world.nodes[2].mechanism='Assume a patron fully replaces the lost trade-linked support. Under this additional assumption, the disruption need not reduce scholar support.';
  world.nodes[2].activity=1;
 }
 return {title:entry.source.title,range:selected.sourceRange,objective:selected.inquiry,format:'text',sourceUrl:entry.source.url,hasUpload:false,
  passages:evidence.map(e=>({id:e.id,text:e.text,locator:e.context?.locator??e.source})),world:validateWorld(world),run:null};
}
