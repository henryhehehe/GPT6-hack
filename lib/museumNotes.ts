import {z} from 'zod';
import {MuseumObjectIdSchema} from './museums';
import type {MuseumFeedback} from './museumFeedback';
export const MuseumNoteInputSchema=z.object({objectId:MuseumObjectIdSchema,observation:z.string().trim().min(1,'Describe one detail you can observe.').max(500),interpretation:z.string().trim().max(500),question:z.string().trim().max(300)});
export type MuseumNoteInput=z.infer<typeof MuseumNoteInputSchema>;
export type MuseumNote=MuseumNoteInput&{revision:number;updatedAt:string;feedback?:MuseumFeedback};
export function saveMuseumNote(notes:MuseumNote[],input:unknown,baseRevision:unknown,updatedAt:string,sequence=0):{notes:MuseumNote[];note:MuseumNote}{
 const value=MuseumNoteInputSchema.parse(input),base=z.number().int().nonnegative().parse(baseRevision),previous=notes.find(note=>note.objectId===value.objectId);
 // A replay of the same saved content is safe even when the first response was lost.
 if(previous&&previous.observation===value.observation&&previous.interpretation===value.interpretation&&previous.question===value.question)return {notes,note:previous};
 if(base!==(previous?.revision??0))throw new Error('This note changed in another tab. Your draft is kept here. Load the saved note before editing again.');
 if(!previous&&notes.length>=6)throw new Error('This notebook holds up to six museum objects. Remove an earlier note to add another.');
 const note={...value,revision:Math.max(sequence,...notes.map(item=>item.revision),0)+1,updatedAt};return {note,notes:[...notes.filter(item=>item.objectId!==note.objectId),note]};
}
export function removeMuseumNote(notes:MuseumNote[],objectId:unknown,baseRevision:unknown){
 const id=MuseumObjectIdSchema.parse(objectId),base=z.number().int().nonnegative().parse(baseRevision),previous=notes.find(note=>note.objectId===id);
 if(!previous)return notes;
 if(previous.revision!==base)throw new Error('This note changed in another tab. Load the saved note before removing it.');
 return notes.filter(note=>note.objectId!==id);
}
