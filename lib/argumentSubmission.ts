import {z} from 'zod';
import {Zone,type Turn} from './world';

export const ArgumentInputSchema=z.object({claim:z.string().min(3).max(1600),npc:Zone,scenario:z.boolean()});
export const ArgumentRequestSchema=ArgumentInputSchema.extend({requestId:z.string().uuid()});
export type ArgumentInput=z.infer<typeof ArgumentInputSchema>;
export type ArgumentRequest=z.infer<typeof ArgumentRequestSchema>;

function sameArgument(a:ArgumentInput,b:ArgumentInput){return a.claim===b.claim&&a.npc===b.npc&&a.scenario===b.scenario;}

// Replaying a saved request must return the original feedback, even after a world update.
export function findArgumentReplay(turns:Turn[],input:ArgumentInput,requestId?:string){
 if(!requestId)return undefined;
 const previous=turns.find(turn=>turn.requestId===requestId);
 if(previous&&!sameArgument(previous,input))throw new Error('This submission changed. Please send it as a new explanation.');
 return previous;
}

export function prepareArgumentRequest(input:ArgumentInput,previous?:unknown):ArgumentRequest{
 const parsed=ArgumentRequestSchema.safeParse(previous);
 return parsed.success&&sameArgument(parsed.data,input)?parsed.data:{...input,requestId:crypto.randomUUID()};
}

export function pendingArgumentKey(classroomId:string,studentId:string){return `cw-pending-argument:${classroomId}:${studentId}`;}

export function readPendingArgument(storage:Pick<Storage,'getItem'>,key:string):ArgumentRequest|undefined{
 try{const parsed=ArgumentRequestSchema.safeParse(JSON.parse(storage.getItem(key)??'null'));return parsed.success?parsed.data:undefined;}catch{return undefined;}
}

export function savePendingArgument(storage:Pick<Storage,'setItem'>,key:string,request:ArgumentRequest){
 try{storage.setItem(key,JSON.stringify(request));}catch{/* The active tab still retains its request. */}
}

export function clearPendingArgument(storage:Pick<Storage,'getItem'|'removeItem'>,key:string,requestId:string){
 try{if(readPendingArgument(storage,key)?.requestId===requestId)storage.removeItem(key);}catch{}
}
