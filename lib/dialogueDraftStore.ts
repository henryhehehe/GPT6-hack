type PendingQuestion={id:string;message:string};
type Snapshot={message:string;pending?:PendingQuestion;warning:string};
type Storage=Pick<globalThis.Storage,'getItem'|'setItem'>;

/** A single saved record keeps the question and retry identity together. */
export function createDialogueDraftStore(key:string,sourceIdentity:string,storage:()=>Storage){
 const initial:Snapshot={message:'',warning:''};let snapshot=initial,loaded=false,lastSaved:string|null=null;
 const listeners=new Set<()=>void>();
 const notify=()=>listeners.forEach(listener=>listener());
 function load(){
  if(loaded)return;loaded=true;
  try{
   const saved=storage().getItem(key+':v2');lastSaved=saved;
   if(saved){
    const value=JSON.parse(saved);
    if(value.sourceIdentity===sourceIdentity&&typeof value.message==='string'){
     const pending=value.pending;
     snapshot={message:value.message,warning:'',pending:typeof pending?.id==='string'&&typeof pending?.message==='string'?pending:undefined};
    }else if(value.sourceIdentity!==sourceIdentity)snapshot={message:'',warning:'The source material changed. Start a new question for this version of the lesson.'};
   }else{
    // Preserve pre-upgrade work and lost-response retries, with an explicit source-check notice.
    const legacy=storage().getItem(key);
    if(legacy){
     snapshot={message:legacy,warning:'Recovered question from an earlier visit. Check it against the current sources before sending.'};
     const savedPending=storage().getItem(key+':pending'),pending=savedPending?JSON.parse(savedPending):undefined;
     if(typeof pending?.id==='string'&&pending.message===legacy.trim())snapshot.pending=pending;
    }
   }
  }catch{snapshot={...snapshot,warning:'Local recovery is unavailable. Keep this tab open until your question is sent.'};}
 }
 function save(next:Snapshot){
  snapshot=next;
  try{const record=JSON.stringify({sourceIdentity,message:next.message,pending:next.pending});storage().setItem(key+':v2',record);lastSaved=record;}
  catch{snapshot={...snapshot,warning:'This question could not be saved on this device. Keep this tab open and retry sending.'};}
  notify();
 }
 return {
  subscribe(listener:()=>void){listeners.add(listener);load();notify();return()=>{listeners.delete(listener);};},
  getSnapshot:()=>snapshot,getServerSnapshot:()=>initial,
  read(){load();return snapshot;},
  edit(message:string){load();save({...snapshot,message});},
  prepare(id:()=>string){load();const message=snapshot.message.trim();const pending=snapshot.pending?.message===message?snapshot.pending:{id:id(),message};save({...snapshot,pending});return pending;},
  complete(sent:PendingQuestion){
   load();
   // An obsolete conversation must not replace a draft written for the next source version.
   try{const saved=storage().getItem(key+':v2');if(saved!==lastSaved||(saved&&JSON.parse(saved).sourceIdentity!==sourceIdentity))return;}catch{snapshot={...snapshot,warning:'The response arrived, but local recovery could not be checked. Your question is kept.'};notify();return;}
   save({...snapshot,message:snapshot.message.trim()===sent.message?'':snapshot.message,pending:snapshot.pending?.id===sent.id?undefined:snapshot.pending});
  },
 };
}
