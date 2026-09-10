'use client';
import {useEffect,useRef,useState} from 'react';
import {LoaderCircle,RefreshCw} from 'lucide-react';
import {portraitFingerprint,portraitInput} from '@/lib/characterPortrait';
import {worldCharacters} from '@/lib/characters';
import type {BuilderAccess} from '@/lib/lessonBuilder';
import type {World,ZoneId} from '@/lib/world';

export default function CharacterPortrait({access,world,npc}:{access:BuilderAccess|null;world:World;npc:ZoneId}){
 const character=worldCharacters(world)[npc],identity=JSON.stringify(portraitInput(world,npc));
 const [attempt,setAttempt]=useState(0),[state,setState]=useState<{key:string;status:'loading'|'ready'|'error'|'disabled'|'missing';url?:string;message?:string}>();
 const classroomId=access?.id,studentId=access?.studentId,token=access?.teacherToken||access?.studentToken;
 const key=JSON.stringify([classroomId,studentId,token,npc,identity,attempt]);
 const worldRef=useRef(world);useEffect(()=>{worldRef.current=world;},[world]);
 useEffect(()=>{
  if(!classroomId||!token)return;
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined,url:string|undefined,canGenerate=true;
  const headers={Authorization:`Bearer ${token}`};
  async function run(){
   const fingerprint=await portraitFingerprint(worldRef.current,npc);if(controller.signal.aborted)return;
   const endpoint=`/api/character-portrait?${new URLSearchParams({id:classroomId!,studentId:studentId??'',npc,fingerprint})}`;
   async function check(generate=false){
    if(controller.signal.aborted)return;
    const response=await fetch(endpoint,{method:generate?'POST':'GET',headers,signal:controller.signal});if(!response.ok)throw new Error('Portrait unavailable');
    const data=await response.json() as {status:string;error?:string};if(controller.signal.aborted)return;
    if(data.status==='disabled'){setState({key,status:'disabled',message:data.error});return;}
    if(data.status==='ready'){
     const image=await fetch(endpoint+'&image=1',{headers,signal:controller.signal});if(!image.ok)throw new Error('Portrait unavailable');
     const blob=await image.blob();if(controller.signal.aborted)return;url=URL.createObjectURL(blob);const decoded=new Image();decoded.src=url;await decoded.decode();if(!controller.signal.aborted)setState({key,status:'ready',url});
    }else if(canGenerate&&attempt>0&&(data.status==='missing'||data.status==='failed')){canGenerate=false;await check(true);}
    else if(data.status==='missing'){setState({key,status:'missing'});}
    else if(data.status==='generating'){timer=setTimeout(()=>void check().catch(failed),3000);}
    else {throw new Error('Portrait unavailable');}
   }
   await check();
  }
  function failed(){if(!controller.signal.aborted)setState({key,status:'error'});}
  void run().catch(failed);
  return()=>{controller.abort();if(timer)clearTimeout(timer);if(url)URL.revokeObjectURL(url);};
 },[key,classroomId,studentId,token,npc,attempt]);
 const current=state?.key===key?state:undefined;
 return <aside className="dialogue-portrait" aria-label={`Portrait of ${character.name}`}>
  {current?.url?<img src={current.url} alt={`AI-generated interpretation of ${character.name}, ${character.role}`}/>:<div className="portrait-placeholder" style={{'--portrait-accent':character.color} as React.CSSProperties}><span aria-hidden="true">{character.name[0]}</span><p role="status">{!classroomId||!token?'Start a lesson to generate this character’s portrait.':current?.status==='missing'?'Create an illustrated interpretation of this character.':current?.status==='disabled'?current.message??'Portrait generation is paused. You can keep talking.':current?.status==='error'?'Your conversation is ready. The portrait is unavailable.':<><LoaderCircle size={16} className="spin"/> Preparing a portrait…<small>You can start talking now.</small></>}</p>{(current?.status==='error'||current?.status==='missing')&&<button type="button" onClick={()=>setAttempt(n=>n+1)}><RefreshCw size={14}/> {current?.status==='missing'?'Generate portrait':'Retry portrait'}</button>}</div>}
  <div className="portrait-caption"><span>{character.role}</span><strong>{character.name}</strong><small>{current?.status==='ready'?'AI-generated interpretation · appearance may be imagined':'A character from your lesson'}</small></div>
 </aside>;
}
