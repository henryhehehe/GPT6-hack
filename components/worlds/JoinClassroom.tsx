'use client';

import {ArrowRight,Compass,LoaderCircle} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';

type Props={open:boolean;name:string;busy:boolean;error:string;returningName?:string;onResume?:()=>void;onName:(name:string)=>void;onJoin:()=>void};

export default function JoinClassroom({open,name,busy,error,returningName,onResume,onName,onJoin}:Props){
 const message=onResume&&/student access denied/i.test(error)?'Your saved student profile could not be verified. Ask your teacher for help finding your earlier work, or join with your name below to start a new journal.':/^[\[{]|unauthorized|invalid|not found/i.test(error.trim())?'This invitation could not be verified. Ask your teacher to send a new link.':/fetch|network/i.test(error)?'We couldn’t reach the classroom. Check your connection and try again.':error;
 return <Dialog open={open}>
  <DialogContent className="join-card invitation-dialog" showCloseButton={false} onEscapeKeyDown={event=>event.preventDefault()} onInteractOutside={event=>event.preventDefault()}>
   <span className="invitation-mark"><Compass size={30}/></span>
   <span className="eyebrow">YOUR INVITATION TO EXPLORE</span>
   <DialogTitle>Join your teacher’s world</DialogTitle>
   <DialogDescription>Choose a first name or nickname. Your teacher will see it alongside your evidence and ideas.</DialogDescription>
   {onResume&&<section className="returning-student"><strong>Welcome back{returningName?`, ${returningName}`:''}</strong><p>This browser has a student profile for this classroom. Continue to keep its journal, conversations, and answers.</p><button type="button" className="primary-button" disabled={busy} onClick={onResume}><ArrowRight size={18}/> {busy?'Opening classroom…':returningName?`Continue as ${returningName}`:'Continue saved progress'}</button><p>Sharing this device? Join with your own name below to start a separate journal.</p></section>}
   {error&&<div id="invitation-error" className="invitation-error" role="alert"><strong>We couldn’t open this classroom</strong><p>{message}</p></div>}
   <form onSubmit={event=>{event.preventDefault();if(name.trim()&&!busy)onJoin();}}>
    <label htmlFor="explorer-name">Your name or nickname</label>
    <input id="explorer-name" placeholder="e.g. Alex" autoComplete="given-name" value={name} maxLength={35} required disabled={busy} onChange={event=>onName(event.target.value)} aria-describedby={error?'invitation-error':undefined}/>
    <button type="submit" className="primary-button" disabled={!name.trim()||busy}>{busy?<LoaderCircle className="spin" size={18}/>:<ArrowRight size={18}/>} {busy?'Joining your classroom…':onResume?'Start a new journal':'Enter the world'}</button>
   </form>
  </DialogContent>
 </Dialog>;
}
