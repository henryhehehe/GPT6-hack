'use client';

import {useRef,useState} from 'react';
import {Check,Copy,LoaderCircle} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import './invitation-sharing.css';

type Props={url:string;lessonTitle:string;onClose:()=>void};

export default function InviteStudents({url,lessonTitle,onClose}:Props){
 const [copyState,setCopyState]=useState<'idle'|'copying'|'copied'|'manual'>('idle');
 const trigger=useRef<HTMLElement|null>(null);
 const linkInput=useRef<HTMLInputElement>(null);
 const copyButton=useRef<HTMLButtonElement>(null);

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
  <DialogContent className="invitation-dialog share-invitation" onOpenAutoFocus={event=>{
   event.preventDefault();
   trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
   setCopyState('idle');
   copyButton.current?.focus();
  }} onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}>
   <DialogTitle>Invite students</DialogTitle>
   <DialogDescription>Share the link with your class. Students join with a name or nickname.</DialogDescription>
   <div className="invited-lesson"><span>Lesson</span><strong>{lessonTitle}</strong></div>
   <label htmlFor="student-invitation-link">Student invitation link</label>
   <div className="invitation-link-row"><input ref={linkInput} id="student-invitation-link" value={url} readOnly onFocus={event=>event.currentTarget.select()} aria-describedby="invitation-copy-status" spellCheck={false}/>
   <button ref={copyButton} className="primary-button" disabled={copyState==='copying'} onClick={copyLink}>
    {copyState==='copying'?<LoaderCircle size={17} className="spin"/>:copyState==='copied'?<Check size={17}/>:<Copy size={17}/>}
    {copyState==='copying'?'Copying…':copyState==='copied'?'Copied':'Copy link'}
   </button></div>
   <p id="invitation-copy-status" className={`invitation-copy-status ${copyState==='manual'?'manual':''}`} role="status">
    {copyState==='manual'?'Automatic copying is unavailable. The link is selected above—use your device’s Copy command.':copyState==='copied'?'Copied. Paste it into your class chat or learning platform.':'Each student gets their own journal and argument.'}
   </p>
   <p className="invitation-next">Follow students’ evidence and arguments in <strong>Live classroom</strong>.</p>
  </DialogContent>
 </Dialog>;
}
