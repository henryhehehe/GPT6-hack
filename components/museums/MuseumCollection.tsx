'use client';
import {useState} from 'react';
import {ArrowUpRight,Check,Plus,Search} from 'lucide-react';
import {museumObjects,museumCitation,type MuseumObject} from '@/lib/museums';
import './museum.css';
import MuseumStudyDialog from './MuseumStudyDialog';
import {comparisonObjects} from '@/lib/museumStudy';

function ObjectImage({item}:{item:MuseumObject}){
 const [failed,setFailed]=useState(false);
 return <div className="museum-image">{failed?<p>Photograph unavailable.<br/><a href={item.recordUrl} target="_blank" rel="noreferrer">View the museum record ↗</a></p>:<img src={item.imageUrl} alt={`Museum photograph: ${item.title}`} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>}</div>;
}
export default function MuseumCollection({selected=[],onToggle,onlySelected=false,initialTopic}:{initialTopic?:MuseumObject['topic'];selected?:string[];onToggle?:(id:string,included:boolean)=>Promise<void>;onlySelected?:boolean}){
 const [topic,setTopic]=useState(onlySelected?'All objects':initialTopic??'All objects'),[query,setQuery]=useState(''),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [compareIds,setCompareIds]=useState<string[]>([]),[studyIds,setStudyIds]=useState<string[]>([]);
 const studyItems=studyIds.length===2?comparisonObjects(studyIds):museumObjects.filter(item=>studyIds.includes(item.id));
 const visible=museumObjects.filter(item=>(!onlySelected||selected.includes(item.id))&&(topic==='All objects'||item.topic===topic)&&`${item.title} ${item.culture} ${item.date} ${item.medium} ${item.accession}`.toLowerCase().includes(query.toLowerCase().trim()));
 async function toggle(item:MuseumObject){if(!onToggle)return;setBusy(item.id);setError('');setNotice('');const adding=!selected.includes(item.id);try{await onToggle(item.id,adding);setNotice(`${adding?'Added to':'Removed from'} this lesson: ${item.title}`);}catch(e){setError(e instanceof Error?e.message:'Could not save. Please retry.');}finally{setBusy('');}}
 return <div className="museum-collection">
  <p className="museum-introduction">Look closely at objects held in real museum collections. Compare what you can observe with what the museum record tells you.</p>
  <p className="museum-context">{onToggle?'Add up to six objects to this classroom. Selections are saved immediately and shared with its learners.':'Objects for observation and discussion.'} These contextual objects are separate from the source cards used for argument feedback.</p>
  {initialTopic&&!onlySelected&&<p className="museum-related">Related to this lesson: <strong>{initialTopic}</strong>. Review the date and reading limits before adding an object.</p>}
  {!onlySelected&&<><div className="museum-toolbar"><label><Search size={16}/><span className="sr-only">Search the curated objects</span><input type="search" placeholder="Search these five objects" maxLength={100} value={query} onChange={e=>setQuery(e.target.value)}/></label><span>{visible.length} objects · Cleveland</span></div><div className="museum-filters" role="group" aria-label="Collection topic">{['All objects','Alexandria','The Odyssey'].map(value=><button key={value} aria-pressed={topic===value} onClick={()=>setTopic(value)}>{value}</button>)}</div></>}
  {!!compareIds.length&&<aside className="museum-compare-tray" aria-label="Comparison selection"><div><strong>{compareIds.length} of 2 objects to compare</strong><p>{compareIds.map(id=>museumObjects.find(item=>item.id===id)?.title).join(' + ')}</p><small>Comparison only; this does not change the lesson’s saved objects.</small></div><button disabled={compareIds.length!==2} onClick={()=>setStudyIds([...compareIds])}>Compare objects</button><button onClick={()=>setCompareIds([])}>Clear comparison</button></aside>}
  <div role="status" className="museum-notice">{notice}</div>{error&&<p role="alert" className="museum-error">{error}</p>}
  <div className="museum-grid">{visible.map((item,index)=><article key={item.id} className="museum-object">
   <ObjectImage item={item}/><div className="museum-object-body"><div className="museum-object-kicker"><span>{item.topic}</span><span>Object {String(index+1).padStart(2,'0')}</span></div><h2>{item.title}</h2><p className="museum-date">{item.date} · {item.medium}</p><p className="museum-credit">{item.provider} · {item.accession}</p>
   <details><summary>Look closer & read the record</summary><dl><dt>Culture / place</dt><dd>{item.culture}</dd><dt>Maker</dt><dd>{item.creator}</dd><dt>Dimensions</dt><dd>{item.dimensions}</dd><dt>Credit</dt><dd>{item.credit}</dd></dl><div className="museum-teaching"><span>Discussion prompt · written for this lesson collection</span><h3>{item.connection}</h3><p>{item.prompt}</p><strong>What this object cannot establish</strong><p>{item.limits}</p></div><label className="museum-citation">Citation<textarea readOnly value={museumCitation(item)} rows={4} onFocus={event=>event.currentTarget.select()}/></label><p className="museum-record-date">Record retrieved {item.retrievedAt}. <a href={item.licenseUrl} target="_blank" rel="noreferrer">Image and metadata: CC0</a>.</p></details>
   <div className="museum-study-actions"><button aria-label={`Inspect ${item.title}`} onClick={()=>setStudyIds([item.id])}>Inspect & zoom ↗</button><button aria-label={`Compare ${item.title}`} aria-pressed={compareIds.includes(item.id)} disabled={!compareIds.includes(item.id)&&compareIds.length===2} onClick={()=>setCompareIds(ids=>ids.includes(item.id)?ids.filter(id=>id!==item.id):ids.length<2?[...ids,item.id]:ids)}>{compareIds.includes(item.id)?'✓ In comparison':'+ Compare'}</button></div>
   <div className="museum-object-actions"><a href={item.recordUrl} target="_blank" rel="noreferrer">Museum record <ArrowUpRight size={15}/></a>{onToggle&&<button disabled={!!busy||(!selected.includes(item.id)&&selected.length>=6)} aria-pressed={selected.includes(item.id)} onClick={()=>void toggle(item)}>{selected.includes(item.id)?<Check size={15}/>:<Plus size={15}/>} {busy===item.id?'Saving…':selected.includes(item.id)?'Remove from lesson':'Add to lesson'}</button>}</div>
  </div></article>)}</div>
  {!visible.length&&<p className="museum-empty">{onlySelected?'Your teacher has not added museum objects to this lesson yet.':'No objects match. Try a different word or collection.'}</p>}
  <MuseumStudyDialog key={studyIds.join('-')} items={studyItems} onClose={()=>setStudyIds([])}/>
  <p className="museum-endnote">A curated first collection, using the Cleveland Museum of Art’s open-access records. Museum photographs are distinct from the app’s generated settings. No museum partnership is implied.</p>
 </div>;
}
