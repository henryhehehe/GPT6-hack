'use client';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,LoaderCircle,Search,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {rememberedTeacherClasses,type SavedWorldGroup,type SavedWorldSummary,type SavedDraftSelection} from '@/lib/savedWorlds';
import type {ClassroomAccess} from '@/lib/classroomAccess';
import './saved-worlds.css';
type Entry=SavedWorldSummary&{kind:'classroom'|'draft';access:ClassroomAccess};
type Props={open:boolean;current:ClassroomAccess|null;onClose:()=>void;onResume:(access:ClassroomAccess)=>Promise<void>;onDraft:(selection:SavedDraftSelection)=>void};
export default function SavedWorldLibrary({open,current,onClose,onResume,onDraft}:Props){
 const [entries,setEntries]=useState<Entry[]>([]),[busy,setBusy]=useState(''),[error,setError]=useState(''),[query,setQuery]=useState(''),[retry,setRetry]=useState(0);
 const copies=useRef(new Map<string,string>());
 const trigger=useRef<HTMLElement|null>(null);
 const search=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!open)return;let active=true;setBusy('loading');setError('');setEntries([]);
  const access=rememberedTeacherClasses(localStorage,current);
  Promise.allSettled(access.map(async c=>{const r=await fetch(`/api/saved-worlds?id=${encodeURIComponent(c.id)}`,{headers:{Authorization:`Bearer ${c.teacherToken}`}});const d=await r.json() as SavedWorldGroup&{error?:string};if(!r.ok)throw new Error(d.error);return {access:c,data:d};})).then(results=>{
   if(!active)return;const found=new Map<string,Entry>();let failures=0;
   for(const result of results){if(result.status==='rejected'){failures++;continue;}const {access,data}=result.value;found.set(`classroom:${data.classroom.id}`,{...data.classroom,kind:'classroom',access});for(const d of data.drafts)if(!found.has(`draft:${d.id}`))found.set(`draft:${d.id}`,{...d,kind:'draft',access});}
   setEntries([...found.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));if(failures)setError(`${failures} saved classroom${failures===1?' could':'s could'} not be loaded. Your other worlds are available.`);setBusy('');
  });return()=>{active=false;};
 },[open,current?.id,retry]);
 async function choose(entry:Entry,reuse=false){const key=`${entry.kind}:${entry.id}`;setBusy(`${reuse?'copy':'open'}:${key}`);setError('');try{
  if(!reuse){if(entry.kind==='classroom'){await onResume(entry.access);onClose();}else onDraft({id:entry.id,access:entry.access});return;}
  if(!copies.current.has(key))copies.current.set(key,crypto.randomUUID());
  const r=await fetch(`/api/saved-worlds?id=${entry.access.id}`,{method:'POST',headers:{Authorization:`Bearer ${entry.access.teacherToken}`,'Content-Type':'application/json'},body:JSON.stringify({kind:entry.kind,sourceId:entry.id,requestId:copies.current.get(key)})});const d=await r.json() as {draftId:string;error?:string};if(!r.ok)throw new Error(d.error);copies.current.delete(key);onDraft({id:d.draftId,access:entry.access,isCopy:true});
 }catch(e){setError(e instanceof Error?e.message:'Unable to open this world.');}finally{setBusy('');}}
 const filtered=entries.filter(e=>`${e.title} ${e.sourceTitle} ${e.objective}`.toLowerCase().includes(query.trim().toLowerCase()));
 const saving=!!busy&&busy!=='loading';
 function clearSearch(){setQuery('');search.current?.focus();}
 return <Dialog open={open} onOpenChange={v=>{if(!v&&!saving)onClose();}}><DialogContent className="saved-world-library" showCloseButton={!saving} onOpenAutoFocus={()=>{trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;}} onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}>
  <header><DialogTitle>Saved worlds</DialogTitle><DialogDescription>Pick up where you left off, or reuse a world with a new class.</DialogDescription></header>
  <div className="saved-world-filter">
   <div className="saved-world-search-label"><label htmlFor="saved-world-search">Find a world</label>{busy!=='loading'&&<span role="status">{query.trim()?`${filtered.length} of ${entries.length}`:entries.length} saved</span>}</div>
   <div className="saved-world-search"><Search size={17} aria-hidden="true"/><input ref={search} id="saved-world-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by title or reading…"/>{query&&<button aria-label="Clear search" onClick={clearSearch}><X size={16}/></button>}</div>
  </div>
  {error&&<div className="saved-world-error" role="alert"><p>{error}</p><button className="text-button" disabled={!!busy} onClick={()=>setRetry(v=>v+1)}>Reload library</button></div>}
  {busy==='loading'?<p className="saved-world-loading" role="status"><LoaderCircle className="spin" size={18}/> Loading your saved worlds…</p>:<div className="saved-world-list">
   {!entries.length?<div className="saved-world-empty"><BookOpen size={24} aria-hidden="true"/><h3>No saved worlds yet</h3><p>Create a classroom or build from a reading. Your work will be saved here automatically.</p></div>:!filtered.length?<div className="saved-world-empty"><h3>No matching worlds</h3><p>Try a different title or reading.</p><button className="text-button" onClick={clearSearch}>Clear search</button></div>:filtered.map(e=>{
    const key=`${e.kind}:${e.id}`,opening=busy===`open:${key}`,copying=busy===`copy:${key}`;
    return <article key={key} aria-labelledby={`saved-${key}`} aria-busy={opening||copying}>
     <div className="saved-world-meta"><span>{e.kind==='classroom'?'Classroom':e.ready?'Prepared world':'Unfinished draft'}{e.kind==='classroom'&&e.id===current?.id?' · Current':''}</span><time dateTime={e.createdAt}>{new Date(e.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</time></div>
     <h3 id={`saved-${key}`}>{e.title}</h3><p>{e.objective}</p>{e.sourceTitle!==e.title&&<small>{e.sourceTitle}</small>}
     <div className="saved-world-actions"><button className="primary-button small" disabled={!!busy} onClick={()=>choose(e)}>{opening&&<LoaderCircle className="spin" size={15}/>} {opening?'Opening…':e.kind==='classroom'?'Reopen classroom':e.ready?'Review saved world':'Continue draft'}</button>{e.ready&&<button className="text-button" disabled={!!busy} onClick={()=>choose(e,true)}>{copying&&<LoaderCircle className="spin" size={15}/>} {copying?'Preparing copy…':'Use for a new class'}</button>}</div>
    </article>;
   })}
  </div>}
  <p className="saved-world-footnote">New classes start with empty student progress. Access is remembered in this browser; keep its data to reopen your worlds.</p>
 </DialogContent></Dialog>;
}
