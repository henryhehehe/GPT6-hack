type DraftKey=string|null;
type DraftStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type ArgumentDraftSnapshot={text:string;saved:boolean};
export const emptyArgumentDraft:ArgumentDraftSnapshot={text:'',saved:false};
type Entry={snapshot:ArgumentDraftSnapshot;hasStoredText:boolean};
type Update=string|((previous:string)=>string);

/** One mounted writer owns this store; browser keys retain classroom/learner isolation. */
export function createArgumentDraftStore(storage:()=>DraftStorage){
 const entries=new Map<DraftKey,Entry>();
 const listeners=new Map<DraftKey,Set<()=>void>>();
 let activeKey:DraftKey=null;
 function entry(key:DraftKey):Entry{
  const cached=entries.get(key);if(cached)return cached;
  let text:string|null=null,saved=false;
  if(key){try{text=storage().getItem(key);saved=true;}catch{/* Keep writing in memory. */}}
  const result={snapshot:{text:text?.slice(0,1600)??'',saved},hasStoredText:text!==null};
  entries.set(key,result);return result;
 }
 function write(key:DraftKey,update:Update){
  const previous=entry(key),text=(typeof update==='function'?update(previous.snapshot.text):update).slice(0,1600);
  let saved=false;
  if(key){try{if(text)storage().setItem(key,text);else storage().removeItem(key);saved=true;}catch{/* The in-memory draft stays available. */}}
  if(text===previous.snapshot.text&&saved===previous.snapshot.saved)return;
  entries.set(key,{snapshot:{text,saved},hasStoredText:saved&&text!==''});
  for(const notify of listeners.get(key)??[])notify();
 }
 return {
  getSnapshot:(key:DraftKey)=>entry(key).snapshot,
  subscribe(key:DraftKey,notify:()=>void){
   const subscribers=listeners.get(key)??new Set<()=>void>();listeners.set(key,subscribers);subscribers.add(notify);
   // Adopt pre-class writing only when React commits, never while rendering
   // another classroom that might be abandoned.
   const adopting=key&&activeKey===null;activeKey=key;
   if(adopting){
    const unassigned=entry(null),target=entry(key);
    if(unassigned.snapshot.text&&!target.hasStoredText&&!target.snapshot.text){
     write(key,unassigned.snapshot.text);
    }
    entries.set(null,{snapshot:emptyArgumentDraft,hasStoredText:false});
   }
   return()=>{subscribers.delete(notify);};
  },
  setText:(update:Update)=>write(activeKey,update),
 };
}
