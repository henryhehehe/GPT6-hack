import {CitationSchema,type Citation} from './learning';
export type LearningDraft={claim:string;prediction:string;citations:Citation[];reflection:string;revisesTurnId?:string;archive:string;pending?:{id:string;content:string}};
export const emptyDraft=():LearningDraft=>({claim:'',prediction:'',citations:[],reflection:'',archive:''});
type Storage=Pick<globalThis.Storage,'getItem'|'setItem'>;
export function createDraftStore(key:string|null,sourceIdentity:string,storage:()=>Storage){
 const initial={draft:emptyDraft(),warning:''};let snapshot=initial,loaded=false;
 const listeners=new Set<()=>void>();const notify=()=>listeners.forEach(listener=>listener());
 function load(){
  if(loaded)return;loaded=true;if(!key)return;
  try{const saved=storage().getItem(key);if(saved){const parsed=JSON.parse(saved),d=parsed.value;if(parsed.sourceIdentity===sourceIdentity&&typeof d?.claim==='string'&&typeof d?.prediction==='string'&&Array.isArray(d.citations)&&d.citations.every((c:unknown)=>CitationSchema.safeParse(c).success)&&typeof d?.reflection==='string'&&typeof d?.archive==='string')snapshot={draft:d,warning:''};}}
  catch{snapshot={...snapshot,warning:'Local recovery is unavailable. Keep this tab open until your work is submitted.'};}
 }
 return {
  subscribe(listener:()=>void){listeners.add(listener);load();notify();return()=>{listeners.delete(listener);};},
  getSnapshot:()=>snapshot,getServerSnapshot:()=>initial,read:()=>snapshot.draft,
  update(change:(draft:LearningDraft)=>LearningDraft){load();snapshot={...snapshot,draft:change(snapshot.draft)};if(key)try{storage().setItem(key,JSON.stringify({sourceIdentity,value:snapshot.draft}));}catch{snapshot={...snapshot,warning:'This draft could not be saved on this device. Keep this tab open and retry submission.'};}notify();},
 };
}
