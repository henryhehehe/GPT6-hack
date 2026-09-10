'use client';
import {useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {museumObjects,museumCitation} from '@/lib/museums';
import {museumDemoObjectId} from '@/lib/museumDemo';
import './museum.css';
import MuseumImageInspector from './MuseumImageInspector';
import {MuseumStudyContent} from './MuseumStudyDialog';
import {alexandriaCoinPair,comparisonObjects} from '@/lib/museumStudy';
const coin=museumObjects.find(item=>item.id===museumDemoObjectId)!;
export function MuseumDemoTrail({onInspect,onRead,onWrite,busy,saved,hasDraft}:{onInspect:()=>void;onRead:()=>void;onWrite:()=>void;busy:boolean;saved:boolean;hasDraft:boolean}){
 return <section className="museum-demo-trail" aria-label="Museum investigation"><div className="museum-demo-intro"><span>REAL OBJECT → WRITTEN SOURCE → YOUR EXPLANATION</span><h2>What can a coin tell us about a city?</h2><p>Follow a royal portrait from the museum collection into Alexandria’s bigger question.</p></div><nav aria-label="Museum demo steps"><button disabled={busy} onClick={onInspect}><span>01</span><strong>Inspect the coin</strong><small>Zoom in on a real artifact</small></button><button onClick={onRead}><span>02</span><strong>Read Strabo’s account</strong><small>{saved?'Saved in your field journal':'Compare it with the written source'}</small></button><button onClick={onWrite}><span>03</span><strong>{hasDraft?'Continue your explanation':'Build your explanation'}</strong><small>Use source cards; name the limits</small></button></nav></section>;
}
export default function MuseumInvestigation({open,onClose,onRead,onNote}:{onNote?:(id:string)=>void;open:boolean;onClose:()=>void;onRead:()=>void}){
 const [comparing,setComparing]=useState(false);
 return <Dialog open={open} onOpenChange={value=>{if(!value){setComparing(false);onClose();}}}><DialogContent className="museum-dialog museum-investigation"><DialogTitle>A portrait of power</DialogTitle><DialogDescription>01 / Inspect the object · museum photograph, not a generated image</DialogDescription>
  <div className="museum-study-switch" role="group" aria-label="Object investigation view"><button aria-pressed={!comparing} onClick={()=>setComparing(false)}>Inspect the gold coin</button><button aria-pressed={comparing} onClick={()=>setComparing(true)}>Compare gold & silver coins</button></div>
  {comparing?<MuseumStudyContent onNote={onNote} items={comparisonObjects(alexandriaCoinPair)}/>:<div className="museum-inspection-layout"><MuseumImageInspector key={open?'open':'closed'} item={coin}/>

  <div className="museum-investigation-copy"><span className="museum-date">{coin.date} · {coin.medium}</span><h3>{coin.title}</h3><p className="museum-record-fact">The museum identifies this coin as minted at Alexandreia in Egypt. Its record dates the coin to 205–145 BCE.</p><ol><li><strong>Observe.</strong> Look at the portrait, lettering, and symbols on the two sides. Which details can you describe without guessing?</li><li><strong>Interpret.</strong> What might these choices communicate about royal authority?</li><li><strong>Find the limit.</strong> The coin does not tell us how scholars were paid. What kind of source would help answer that?</li></ol><p className="museum-boundary">These questions are our teaching prompts. The museum record and your interpretation are distinct.</p><a href={coin.recordUrl} target="_blank" rel="noreferrer">Read the original museum record ↗</a><details><summary>Citation & credit</summary><p>{museumCitation(coin)}</p></details></div></div>}
  {!comparing&&onNote&&<button className="museum-note-entry" onClick={()=>onNote(coin.id)}>Write a field note about this coin →</button>}
  <footer className="museum-investigation-next"><div><strong>Next: compare the written account.</strong><p>Strabo describes a scholarly community and its support. Read his words, then distinguish the source from our funding assumption.</p></div><button onClick={()=>{setComparing(false);onRead();}}>Read Strabo’s account <ArrowRight size={17}/></button></footer>
 </DialogContent></Dialog>;
}
