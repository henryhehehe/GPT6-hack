'use client';
import {useRef,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {museumCitation,type MuseumObject} from '@/lib/museums';
import {investigationForObjects} from '@/lib/museumInvestigations';
import MuseumInvestigationGuide from './MuseumInvestigationGuide';
import MuseumImageInspector from './MuseumImageInspector';
import {museumObjectPath} from '@/lib/museumLinks';
import './museum.css';
function StudyShare({items}:{items:MuseumObject[]}){
 const [feedback,setFeedback]=useState<{path:string;message:string}>();
 if(items.length<1||items.length>2)return null;
 const path=museumObjectPath(items[0].id,items[1]?.id);
 async function copy(){
  try{await navigator.clipboard.writeText(new URL(path,window.location.origin).href);setFeedback({path,message:'Link copied.'});}
  catch{setFeedback({path,message:'Copy was unavailable. Use the link beside this button.'});}
 }
 return <div className="museum-share"><a href={path}>{items.length===2?'Link to this comparison':'Link to this object'}</a><button onClick={()=>void copy()}>Copy link</button><span role="status">{feedback?.path===path?feedback.message:''}</span><small>Opens the public objects; does not add them to a classroom.</small></div>;
}
export function MuseumStudyContent({items,onNote}:{items:MuseumObject[];onNote?:(id:string)=>void}){
 const comparing=items.length===2,plan=investigationForObjects(items);
 const guideRef=useRef<HTMLDivElement>(null),overviewRef=useRef<HTMLDivElement>(null);
 return <><div ref={overviewRef}/><StudyShare items={items}/>{plan&&<div className="museum-guide-jump"><span>{plan.minutes}-minute guided discussion</span><button onClick={()=>guideRef.current?.scrollIntoView({block:'start'})}>Discussion & worksheet ↓</button></div>}<p className="museum-study-intro">{comparing?'Compare the dates and materials first, then look for similarities and differences in the images. Photographs are fitted separately; their displayed sizes do not represent the objects’ relative scale.':'Begin with what you can observe. Read the museum record before deciding what it means.'}</p><div className={`museum-study-grid ${comparing?'museum-study-pair':''}`}>{items.map(item=><article key={item.id}><span className="museum-object-kicker">{item.topic} · {item.accession}</span><h3>{item.title}</h3><MuseumImageInspector key={item.id} item={item}/><dl><dt>Date</dt><dd>{item.date}</dd><dt>Material</dt><dd>{item.medium}</dd><dt>Culture / place</dt><dd>{item.culture}</dd><dt>Dimensions</dt><dd>{item.dimensions}</dd><dt>Maker</dt><dd>{item.creator}</dd></dl><section className="museum-teaching"><span>Our discussion prompt</span><p>{item.prompt}</p><strong>What this object cannot establish</strong><p>{item.limits}</p></section><details className="museum-study-citation"><summary>Citation & credit</summary><textarea readOnly aria-label={`Citation for ${item.title}`} value={museumCitation(item)} rows={5} onFocus={event=>event.currentTarget.select()}/><p>Record retrieved {item.retrievedAt}.</p></details><a className="museum-study-record" href={item.recordUrl} target="_blank" rel="noreferrer">Original museum record ↗</a>{onNote&&<button className="museum-note-entry" onClick={()=>onNote(item.id)}>Write a field note →</button>}</article>)}</div>{plan?<div ref={guideRef}><MuseumInvestigationGuide key={plan.id} plan={plan} onBack={()=>overviewRef.current?.scrollIntoView({block:'start'})}/></div>:comparing&&<section className="museum-comparison-question"><strong>What changes when you put them together?</strong><p>Name one detail they share and one difference. Do their dates, materials, or purposes change your interpretation? What additional source would help you test it?</p><small>Comparison prompt written for this app. Contextual discussion is separate from source-card assessment.</small></section>}</>;
}
export default function MuseumStudyDialog({items,onClose,onNote}:{items:MuseumObject[];onClose:()=>void;onNote?:(id:string)=>void}){
 const trigger=useRef<HTMLElement|null>(null);
 return <Dialog open={items.length>0} onOpenChange={value=>{if(!value)onClose();}}><DialogContent className="museum-dialog museum-study-dialog" onOpenAutoFocus={()=>{trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;}} onCloseAutoFocus={event=>{if(trigger.current?.isConnected){event.preventDefault();trigger.current.focus();}}}><DialogTitle>{investigationForObjects(items)?.title??(items.length===2?'Two objects. A closer look.':'Look closely at the object')}</DialogTitle><DialogDescription>Museum photographs and collection records · keep observation separate from interpretation</DialogDescription><MuseumStudyContent onNote={onNote} items={items}/></DialogContent></Dialog>;
}
