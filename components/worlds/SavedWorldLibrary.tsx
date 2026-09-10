'use client';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,LoaderCircle} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {rememberedTeacherClasses,type SavedWorldGroup,type SavedWorldSummary,type SavedDraftSelection} from '@/lib/savedWorlds';
import type {ClassroomAccess} from '@/lib/classroomAccess';
import './saved-worlds.css';
type Entry=SavedWorldSummary&{kind:'classroom'|'draft';access:ClassroomAccess};
type Props={open:boolean;current:ClassroomAccess|null;onClose:()=>void;onResume:(access:ClassroomAccess)=>Promise<void>;onDraft:(selection:SavedDraftSelection)=>void};
export default function SavedWorldLibrary({open,current,onClose,onResume,onDraft}:Props){
 const [entries,setEntries]=useState<Entry[]>([]),[busy,setBusy]=useState(''),[error,setError]=useState(''),[query,setQuery]=useState(''),[retry,setRetry]=useState(0);
 const copies=useRef(new Map<string,string>());
 useEffect(()=>{if(!open)return;let active=true;setBusy('loading');setError('');setEntries([]);
  const access=rememberedTeacherClasses(localStorage,current);
  Promise.allSettled(access.map(async c=>{const r=await fetch(`/api/saved-worlds?id=${encodeURIComponent(c.id)}`,{headers:{Authorization:`Bearer ${c.teacherToken}`}});const d=await r.json() as SavedWorldGroup&{error?:string};if(!r.ok)throw new Error(d.error);return {access:c,data:d};})).then(results=>{
   if(!active)return;const found=new Map<string,Entry>();let failures=0;
   for(const result of results){if(result.status==='rejected'){failures++;continue;}const {access,data}=result.value;found.set(`classroom:${data.classroom.id}`,{...data.classroom,kind:'classroom',access});for(const d of data.drafts)if(!found.has(`draft:${d.id}`))found.set(`draft:${d.id}`,{...d,kind:'draft',access});}
   setEntries([...found.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));if(failures)setError(`${failures} saved classroom${failures===1?' could':'s could'} not be loaded. Your other worlds are available.`);setBusy('');
  });return()=>{active=false;};
 },[open,current?.id,retry]);
 async function choose(entry:Entry,reuse=false){const key=`${entry.kind}:${entry.id}`;setBusy(key);setError('');try{
  if(!reuse){if(entry.kind==='classroom'){await onResume(entry.access);onClose();}else onDraft({id:entry.id,access:entry.access});return;}
  if(!copies.current.has(key))copies.current.set(key,crypto.randomUUID());
  const r=await fetch(`/api/saved-worlds?id=${entry.access.id}`,{method:'POST',headers:{Authorization:`Bearer ${entry.access.teacherToken}`,'Content-Type':'application/json'},body:JSON.stringify({kind:entry.kind,sourceId:entry.id,requestId:copies.current.get(key)})});const d=await r.json() as {draftId:string;error?:string};if(!r.ok)throw new Error(d.error);copies.current.delete(key);onDraft({id:d.draftId,access:entry.access,isCopy:true});
 }catch(e){setError(e instanceof Error?e.message:'Unable to open this world.');}finally{setBusy('');}}
 const filtered=entries.filter(e=>`${e.title} ${e.sourceTitle} ${e.objective}`.toLowerCase().includes(query.toLowerCase()));
 return <Dialog open={open} onOpenChange={v=>{if(!v&&!busy)onClose();}}><DialogContent className="saved-world-library" showCloseButton={!busy}><header><DialogTitle>Saved worlds</DialogTitle><DialogDescription>Reopen a classroom or use its world with a new group. Sources and generated worlds are saved automatically.</DialogDescription></header>
 <label className="saved-world-search">Find a world<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by title or reading…"/></label>
 {error&&<p role="alert">{error} <button className="text-button" disabled={!!busy} onClick={()=>setRetry(v=>v+1)}>Reload library</button></p>}
 {busy==='loading'?<p role="status"><LoaderCircle className="spin" size={18}/> Loading your saved worlds…</p>:<div className="saved-world-list">{!entries.length?<p>Your saved worlds will appear here after you create a classroom or build from a source.</p>:!filtered.length?<p>No worlds match this search.</p>:filtered.map(e=><article key={`${e.kind}:${e.id}`}><div><span className="eyebrow">{e.kind==='classroom'?'Classroom':e.ready?'Prepared world':'Unfinished draft'} · {new Date(e.createdAt).toLocaleDateString()}</span><h3>{e.title}</h3><p>{e.objective}</p>{e.sourceTitle!==e.title&&<small>{e.sourceTitle}</small>}</div><div className="saved-world-actions"><button className="quiet-button" disabled={!!busy} onClick={()=>choose(e)}>{e.kind==='classroom'?'Reopen classroom':e.ready?'Review saved world':'Continue draft'}</button>{e.ready&&<button className="primary-button small" disabled={!!busy} onClick={()=>choose(e,true)}>{busy===`${e.kind}:${e.id}`?<LoaderCircle className="spin" size={15}/>:<BookOpen size={15}/>} Use for a new class</button>}</div></article>)}</div>}
 <p className="helper">New classes start with empty student progress. This library shows teacher access remembered in this browser; keep browser data to retain access.</p></DialogContent></Dialog>;
}
