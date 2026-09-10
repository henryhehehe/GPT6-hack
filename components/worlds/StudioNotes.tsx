'use client';

import {useRef,type ReactNode} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';

export default function StudioNotes({open,onClose,children}:{open:boolean;onClose:()=>void;children:ReactNode}){
 const trigger=useRef<HTMLElement|null>(null);
 return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}><DialogContent className="studio-notes" onOpenAutoFocus={()=>{trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;}} onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();}}><DialogTitle>Lesson notes</DialogTitle><DialogDescription>Review the connections in this lesson or prepare guidance for your students.</DialogDescription>{children}</DialogContent></Dialog>;
}
