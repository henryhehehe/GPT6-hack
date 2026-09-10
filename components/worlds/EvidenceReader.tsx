'use client';
import { useState } from 'react';
import { BookOpen, Check, FileText, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Evidence } from '@/lib/world';

type Props={settingImageUrl?:string|null;imported?:boolean;evidence:Evidence|null;collected:boolean;student:boolean;busy:boolean;onClose:()=>void;onCollect:()=>Promise<void>;onUse:(citation:string)=>void};
const sourceUrl='https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/17A1*.html';
// A short verified excerpt, never model-generated. The full source stays optional.
const straboExcerpt='The Museum is also a part of the royal palaces';

export default function EvidenceReader({settingImageUrl,imported=false,evidence,collected,student,busy,onClose,onCollect,onUse}:Props){
 const [tab,setTab]=useState<'text'|'image'>('text');
 const verified=evidence?.id==='strabo'&&evidence.kind==='source'&&evidence.source.includes(sourceUrl);
 const citation=evidence?.source.replace(/https?:\/\/\S+/g,'').replace(/·\s*$/,'').trim();
 return <Dialog open={!!evidence} onOpenChange={open=>{if(!open){onClose();setTab('text');}}}>
  <DialogContent className="evidence-reader">
   <div className="reader-heading"><span className="eyebrow">FIELD NOTES / {tab==='image'?'ILLUSTRATIVE SETTING':evidence?.kind==='source'?'SOURCE EXCERPT':evidence?.kind==='assumption'?'SCENARIO ASSUMPTION':'INVENTED TEACHING PROP'}</span><DialogTitle>{evidence?.title}</DialogTitle><DialogDescription>Read the material, consider its limits, then use it in your own explanation.</DialogDescription></div>
   <div className="reader-tabs" role="group" aria-label="Evidence view"><button aria-pressed={tab==='text'} onClick={()=>setTab('text')}><FileText size={16}/> Text & citation</button>{(!imported||settingImageUrl)&&<button aria-pressed={tab==='image'} onClick={()=>setTab('image')}><ImageIcon size={16}/> Setting image</button>}</div>
   {tab==='text'||(imported&&!settingImageUrl)?<div className="reader-document">
    {verified&&<><span className="reader-label">EXCERPT · STRABO, GEOGRAPHY 17.1.8</span><blockquote>“{straboExcerpt}”</blockquote></>}
    <span className="reader-label">{verified?'READING NOTE · PARAPHRASE':imported?'SOURCE EXCERPT · CHECK CITATION BELOW':'MATERIAL FOR THIS EXERCISE'}</span><p>{evidence?.text}</p>
    <div className="reader-question"><strong>Before you use this</strong><p>{evidence?.kind==='source'?'What does this account support—and what does it leave uncertain?':evidence?.kind==='assumption'?'Your conclusion depends on this assumption. Would it still hold if the assumption changed?':'This is invented for the exercise. It can illustrate a hypothesis, but cannot prove what happened historically.'}</p></div>
    <section className="reader-citation"><h3>Citation & provenance</h3><p>{citation}</p>{verified&&<p>Strabo, <cite>Geography</cite>, Book XVII, chapter 1, section 8. English text hosted by LacusCurtius, University of Chicago. The excerpt and reading note are distinct from the scene illustration.</p>}{evidence?.source.includes('https://')&&<details><summary>Original publication address</summary><p className="citation-url">{evidence.source.slice(evidence.source.indexOf('https://'))}</p></details>}</section>
   </div>:<figure className="reader-figure"><img src={settingImageUrl??"/evidence/alexandria-setting.png"} alt={imported?"AI-generated interpretation of the reading setting":"An original model of a colonnaded scholarly building beside a tiered coastal lighthouse"}/><figcaption><strong>Illustrative setting—not primary evidence.</strong> {imported?'Generated through Astra’s image tool from the reading. Visual details may be invented. Use the cited text as evidence.':'Original Blender reconstruction by Counterfactual Worlds, 2026. MIT license. It helps locate the activity; it does not establish the historical appearance or funding of the Museum.'}</figcaption></figure>}
   {student&&<div className="reader-actions"><button className="primary-button" disabled={busy||collected} onClick={onCollect}>{collected?<Check size={17}/>:<BookOpen size={17}/>} {collected?'Saved in your journal':'Save to journal'}</button><button className="text-button" disabled={!collected||busy} onClick={()=>{onUse(` [${citation||evidence?.title}] `);onClose();setTab('text');}}>Use citation in my claim</button></div>}
  </DialogContent>
 </Dialog>;
}
