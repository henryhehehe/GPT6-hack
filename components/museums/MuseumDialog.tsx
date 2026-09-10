'use client';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import type {MuseumObject} from '@/lib/museums';
import MuseumCollection from './MuseumCollection';
export default function MuseumDialog({open,onClose,selected,onToggle,relatedTopic,onNote,onAddInvestigation}:{onAddInvestigation?:(id:string)=>Promise<void>;onNote?:(id:string)=>void;relatedTopic?:MuseumObject['topic'];open:boolean;onClose:()=>void;selected:string[];onToggle?:(id:string,included:boolean)=>Promise<void>}){
 return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}><DialogContent className="museum-dialog"><DialogTitle>Museum objects</DialogTitle><DialogDescription>{onToggle?'Bring material culture into your lesson.':'Selected by your teacher for this lesson.'}</DialogDescription><MuseumCollection onAddInvestigation={onAddInvestigation} onNote={onNote} initialTopic={relatedTopic} selected={selected} onToggle={onToggle} onlySelected={!onToggle}/></DialogContent></Dialog>;
}
