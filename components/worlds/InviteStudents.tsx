'use client';

import {useRef,useState} from 'react';
import {Check,Copy,Link2,LoaderCircle} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';

type Props={url:string;lessonTitle:string;onClose:()=>void};

export default function InviteStudents({url,lessonTitle,onClose}:Props){
 const [copyState,setCopyState]=useState<'idle'|'copying'|'copied'|'manual'>('idle');
 const trigger=useRef<HTMLElement|null>(null);
 const linkInput=useRef<HTMLInputElement>(null);

 async function copyLink(){
  setCopyState('copying');
  try{
   await navigator.clipboard.writeText(url);
   setCopyState('copied');
  }catch{
   setCopyState('manual');
   linkInput.current?.focus();
   linkInput.current?.select();
  }
 }

 return <Dialog open={!!url} onOpenChange={open=>{if(!open)onClose();}}>
  <DialogContent className="invitation-dialog share-invitation" onOpenAutoFocus={()=>{
   trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
   setCopyState('idle');
  }} onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}>
   <span className="invitation-mark"><Link2 size={28}/></span>
   <span className="eyebrow">BRING YOUR CLASS INTO THE WORLD</span>
   <DialogTitle>Invite your students</DialogTitle>
   <DialogDescription>Share this link in your class chat or learning platform. Each student joins with a name or nickname.</DialogDescription>
   <div className="invited-lesson"><span>Joining this lesson</span><strong>{lessonTitle}</strong></div>
   <label htmlFor="student-invitation-link">Student invitation link</label>
   <input ref={linkInput} id="student-invitation-link" value={url} readOnly onFocus={event=>event.currentTarget.select()} aria-describedby="invitation-copy-status" spellCheck={false}/>
   <button className="primary-button" disabled={copyState==='copying'} onClick={copyLink}>
    {copyState==='copying'?<LoaderCircle size={17} className="spin"/>:copyState==='copied'?<Check size={17}/>:<Copy size={17}/>}
    {copyState==='copying'?'Copying…':copyState==='copied'?'Link copied':'Copy invitation link'}
   </button>
   <p id="invitation-copy-status" className={`invitation-copy-status ${copyState==='manual'?'manual':''}`} role="status">
    {copyState==='manual'?'Automatic copying is unavailable. The link is selected above—use your device’s Copy command.':copyState==='copied'?'Ready to paste. Students can open this link on their own devices.':'Students enter the current classroom, with their own journal and argument.'}
   </p>
   <div className="invitation-next"><strong>Once students join</strong><p>Open Live classroom to follow their evidence and arguments.</p></div>
  </DialogContent>
 </Dialog>;
}
