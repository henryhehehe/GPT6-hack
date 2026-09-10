'use client';
import { useState } from 'react';
import { BookOpen, Check, FileText, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Evidence } from '@/lib/world';
import {materials,passages,sourceVersion,type Citation} from '@/lib/learning';

type Props={imported?:boolean;evidence:Evidence|null;collected:boolean;student:boolean;busy:boolean;onClose:()=>void;onCollect:()=>Promise<void>;onUse:(citation:Citation)=>void};
const sourceUrl='https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/17A1*.html';
// A short verified excerpt, never model-generated. The full source stays optional.

export default function EvidenceReader({imported=false,evidence,collected,student,busy,onClose,onCollect,onUse}:Props){
 const [tab,setTab]=useState<'text'|'image'>('text');
 const verified=evidence?.id==='strabo'&&evidence.kind==='source'&&evidence.source.includes(sourceUrl);
 const [choice,setChoice]=useState(''),[relevance,setRelevance]=useState(''),[saving,setSaving]=useState(false),[selectionError,setSelectionError]=useState('');
 const options=evidence?materials(evidence).flatMap(m=>passages(m.text).map(p=>({...p,material:m.id,label:m.label,key:`${m.id}:${p.start}`}))):[];
 async function usePassage(){const selected=options.find(p=>p.key===choice);if(!evidence||!selected)return;setSaving(true);setSelectionError('');try{const version=await sourceVersion(evidence);onUse({evidenceId:evidence.id,material:selected.material,sourceVersion:version,start:selected.start,end:selected.end,quote:selected.quote,relevance:relevance.trim()});onClose();setTab('text');}catch{setSelectionError('Could not select this passage. Please retry.');}finally{setSaving(false);}}
 const citation=evidence?.source.replace(/https?:\/\/\S+/g,'').replace(/·\s*$/,'').trim();
 return <Dialog open={!!evidence} onOpenChange={open=>{if(!open){onClose();setTab('text');}}}>
  <DialogContent className="evidence-reader">
   <div className="reader-heading"><span className="eyebrow">FIELD NOTES / {tab==='image'?'ILLUSTRATIVE SETTING':evidence?.kind==='source'?'SOURCE EXCERPT':evidence?.kind==='assumption'?'SCENARIO ASSUMPTION':'INVENTED TEACHING PROP'}</span><DialogTitle>{evidence?.title}</DialogTitle><DialogDescription>Read the material, consider its limits, then use it in your own explanation.</DialogDescription></div>
   <div className="reader-tabs" role="group" aria-label="Evidence view"><button aria-pressed={tab==='text'} onClick={()=>setTab('text')}><FileText size={16}/> Text & citation</button>{!imported&&<button aria-pressed={tab==='image'} onClick={()=>setTab('image')}><ImageIcon size={16}/> Setting image</button>}</div>
   {tab==='text'||imported?<div className="reader-document">
    {evidence&&materials(evidence).map(m=><section key={m.id}><span className="reader-label">{m.label}</span>{m.id==='excerpt'?<blockquote>“{m.text}”</blockquote>:<p>{m.text}</p>}</section>)}
    <div className="reader-question"><strong>Before you use this</strong><p>{evidence?.kind==='source'?'What does this account support—and what does it leave uncertain?':evidence?.kind==='assumption'?'Your conclusion depends on this assumption. Would it still hold if the assumption changed?':'This is invented for the exercise. It can illustrate a hypothesis, but cannot prove what happened historically.'}</p></div>
    <section className="reader-citation"><h3>Citation & provenance</h3><p>{citation}</p>{verified&&<p>Strabo, <cite>Geography</cite>, Book XVII, chapter 1, section 8. English text hosted by LacusCurtius, University of Chicago. The excerpt and reading note are distinct from the scene illustration.</p>}{evidence?.source.includes('https://')&&<details><summary>Original publication address</summary><p className="citation-url">{evidence.source.slice(evidence.source.indexOf('https://'))}</p></details>}</section>
   </div>:<figure className="reader-figure"><img src="/evidence/alexandria-setting.png" alt="An original model of a colonnaded scholarly building beside a tiered coastal lighthouse"/><figcaption><strong>Illustrative setting—not primary evidence.</strong> Original Blender reconstruction by Counterfactual Worlds, 2026. MIT license. It helps locate the activity; it does not establish the historical appearance or funding of the Museum.</figcaption></figure>}
   {student&&<div className="reader-selection"><label htmlFor="passage-choice">Choose the passage to cite</label><select id="passage-choice" value={choice} onChange={e=>setChoice(e.target.value)}><option value="">Select a passage…</option>{options.map(p=><option key={p.key} value={p.key}>{p.label}: {p.quote}</option>)}</select>{choice&&<blockquote>{options.find(p=>p.key===choice)?.quote}</blockquote>}<label htmlFor="passage-relevance">How does this passage support or challenge your claim?</label><textarea id="passage-relevance" value={relevance} onChange={e=>setRelevance(e.target.value)} maxLength={400}/>{selectionError&&<p role="alert">{selectionError}</p>}<div className="reader-actions"><button className="primary-button" disabled={busy||collected} onClick={onCollect}>{collected?<Check size={17}/>:<BookOpen size={17}/>} {collected?'Saved in your journal':'Save to journal'}</button><button className="text-button" disabled={!collected||busy||saving||!choice||relevance.trim().length<3} onClick={usePassage}>Use selected passage</button></div></div>}

  </DialogContent>
 </Dialog>;
}
