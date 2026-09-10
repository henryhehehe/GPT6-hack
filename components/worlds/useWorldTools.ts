'use client';
import {useEffect,useRef} from 'react';
import {Zone,type ZoneId} from '@/lib/world';
type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown|Promise<unknown>};
type ModelContext={registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>};
export function useWorldTools(actions:{read:()=>unknown;inspect:(zone:ZoneId)=>void;collect:(id:string)=>Promise<void>;evidenceIds:()=>string[]}){
 const current=useRef(actions);
 useEffect(()=>{current.current=actions;},[actions]);
 useEffect(()=>{const context=(document as Document&{modelContext?:ModelContext}).modelContext;if(!context)return;const lifecycle=new AbortController();
 const tools:Tool[]=[
  {name:'read_world_state',description:'Read the displayed world, scenario, selected place, and current student evidence. Contains no access credentials.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>current.current.read()},
  {name:'inspect_world_place',description:'Navigate the visible 3D world and open evidence at harbor, market, or library. Does not collect evidence or submit an argument.',inputSchema:{type:'object',properties:{zone:{type:'string',enum:['harbor','market','library']}},required:['zone'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async input=>{const zone=Zone.parse((input as {zone?:unknown}).zone);current.current.inspect(zone);await new Promise(requestAnimationFrame);return {selected:zone};}},
  {name:'collect_world_evidence',description:'Add an existing evidence card to the current student inventory and update the visible classroom. May start a classroom if none exists.',inputSchema:{type:'object',properties:{evidenceId:{type:'string'}},required:['evidenceId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async input=>{const id=(input as {evidenceId?:unknown}).evidenceId;if(typeof id!=='string'||!current.current.evidenceIds().includes(id))throw new Error('Unknown evidence ID');await current.current.collect(id);await new Promise(requestAnimationFrame);return {collected:id};}},
 ];
 for(const tool of tools)try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}
 return()=>lifecycle.abort();
 },[]);
}
