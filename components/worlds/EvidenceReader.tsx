'use client';
import { useRef, useState } from 'react';
import { BookOpen, Check, FileText, Image as ImageIcon, LoaderCircle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Evidence } from '@/lib/world';
import SourceNoteReferences from './SourceNoteReferences';

type Props={remainingCharacters?:number;error?:string;saving?:boolean;settingImageUrl?:string|null;imported?:boolean;evidence:Evidence|null;collected:boolean;student:boolean;busy:boolean;onClose:()=>void;onCollect:()=>Promise<void>;onUse:(citation:string)=>void;onArgument?:()=>void};
const sourceUrl='https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/17A1*.html';
// A short verified excerpt, never model-generated. The full source stays optional.
const straboExcerpt='The Museum is also a part of the royal palaces';

export default function EvidenceReader({remainingCharacters=1600,error='',saving=false,settingImageUrl,imported=false,evidence,collected,student,busy,onClose,onCollect,onUse,onArgument}:Props){
 const [tab,setTab]=useState<'text'|'image'>('text');
 const excerptRef=useRef<HTMLElement>(null);
 const verified=evidence?.id==='strabo'&&evidence.kind==='source'&&evidence.source.includes(sourceUrl);
 const legacyStrabo=verified&&!evidence?.context;
 const publicationUrl=evidence?.source.match(/https:\/\/[^\s]+/)?.[0];
 const citation=evidence?.source.replace(/https?:\/\/\S+/g,'').replace(/·\s*$/,'').trim();
 const citationText=` [${citation||evidence?.title}] `;
 const citationFits=citationText.length<=remainingCharacters;
 const context=evidence?.context;
 const exactContext=!!context&&context.start>=0&&context.end>context.start&&context.end<=context.text.length&&context.text.slice(context.start,context.end)===evidence?.text;
 return <Dialog open={!!evidence} onOpenChange={open=>{if(!open){onClose();setTab('text');}}}>
  <DialogContent className="evidence-reader">
   <div className="reader-heading"><span className="eyebrow">FIELD NOTES / {tab==='image'?'ILLUSTRATIVE SETTING':evidence?.kind==='source'?'SOURCE EXCERPT':evidence?.kind==='assumption'?'SCENARIO ASSUMPTION':'INVENTED TEACHING PROP'}</span><DialogTitle>{evidence?.title}</DialogTitle><DialogDescription>Read the material, consider its limits, then use it in your own explanation.</DialogDescription></div>
   <div className="reader-tabs" role="group" aria-label="Evidence view"><button aria-pressed={tab==='text'} onClick={()=>setTab('text')}><FileText size={16}/> Text & citation</button>{(!imported||settingImageUrl)&&<button aria-pressed={tab==='image'} onClick={()=>setTab('image')}><ImageIcon size={16}/> Setting image</button>}</div>
   {tab==='text'||(imported&&!settingImageUrl)?<div className="reader-document">
    {legacyStrabo&&<><span className="reader-label">EXCERPT · STRABO, GEOGRAPHY 17.1.8</span><blockquote>“{straboExcerpt}”</blockquote></>}
    <span className="reader-label">{legacyStrabo?'READING NOTE · PARAPHRASE':evidence?.kind==='source'&&(imported||!!evidence.context)?'SOURCE EXCERPT · CHECK CITATION BELOW':'MATERIAL FOR THIS EXERCISE'}</span><p>{evidence?.text}</p>
    {evidence?.context?.editorialNote&&<p className="curriculum-teaching-note"><strong>Editorial context: </strong>{evidence.context.editorialNote}</p>}
    {evidence?.context?.readingNote&&<section className="curriculum-teaching-note"><strong>Reading note · context, not a quotation</strong><p>{evidence.context.readingNote}</p><SourceNoteReferences references={evidence.context.references}/></section>}
    {context&&<details className="reader-context"><summary>Read in context</summary>{exactContext&&<div className="context-navigation"><p>The highlighted words are the excerpt on this card.</p><button type="button" className="text-button" onClick={()=>{excerptRef.current?.focus({preventScroll:true});excerptRef.current?.scrollIntoView({block:'nearest',behavior:'instant'});}}>Jump to the excerpt</button></div>}<p className="curriculum-context">{exactContext?<>{context.text.slice(0,context.start)}<mark ref={excerptRef} tabIndex={-1} aria-label="Excerpt from this evidence card">{context.text.slice(context.start,context.end)}</mark>{context.text.slice(context.end)}</>:context.text}</p><small>{context.locator}. This is a bounded selection, not the complete chapter.</small></details>}
    <div className="reader-question"><strong>Before you use this</strong><p>{evidence?.kind==='source'?'What does this account support—and what does it leave uncertain?':evidence?.kind==='assumption'?'Your conclusion depends on this assumption. Would it still hold if the assumption changed?':'This is invented for the exercise. It can illustrate a hypothesis, but cannot prove what happened historically.'}</p></div>
    <section className="reader-citation"><h3>Citation & provenance</h3><p>{citation}</p>{verified&&<p>Strabo, <cite>Geography</cite>, Book XVII, chapter 1, section 8. English text hosted by LacusCurtius, University of Chicago. The excerpt and reading note are distinct from the scene illustration.</p>}{publicationUrl&&<a className="publication-link" href={publicationUrl} target="_blank" rel="noreferrer">Open original publication <ExternalLink size={14}/></a>}</section>
   </div>:<figure className="reader-figure"><img src={settingImageUrl??"/evidence/alexandria-setting.png"} alt={imported?"AI-generated interpretation of the reading setting":"An original model of a colonnaded scholarly building beside a tiered coastal lighthouse"}/><figcaption><strong>Illustrative setting—not primary evidence.</strong> {imported?'Generated through Astra’s image tool from the reading. Visual details may be invented. Use the cited text as evidence.':'Original Blender reconstruction by Counterfactual Worlds, 2026. MIT license. It helps locate the activity; it does not establish the historical appearance or funding of the Museum.'}</figcaption></figure>}
   {student&&<div className="reader-actions">{error&&<p className="reader-error" role="alert">{error}</p>}<button className="primary-button" disabled={busy||collected} onClick={onCollect}>{saving?<LoaderCircle className="spin" size={17}/>:collected?<Check size={17}/>:<BookOpen size={17}/>} {saving?'Saving evidence…':collected?'Saved in your journal':'Save to journal'}</button><button className="text-button" disabled={!collected||busy||!citationFits} aria-describedby="citation-help" onClick={()=>{onUse(citationText);onClose();setTab('text');}}>Add citation to my explanation</button>{collected&&!citationFits&&onArgument&&<button type="button" className="text-button" onClick={()=>{onClose();setTab('text');onArgument();}}>Return to my draft to make room</button>}<p id="citation-help" className="citation-help">{!collected?'Save this card to your journal to use its citation.':!citationFits?`This citation needs ${citationText.length} characters; your draft has ${remainingCharacters} left. Shorten your draft before adding it.`:'Add the citation, then explain what this evidence supports in your own words.'}</p></div>}
  </DialogContent>
 </Dialog>;
}
