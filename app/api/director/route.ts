import {reserveAi,reserveClassAi,requireSameOrigin} from '@/lib/pilot';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { db,serverEnv,boundary } from '@/lib/server';
import { HintSchema,validateWorld } from '@/lib/world';

export async function GET(request:Request){
 try{requireSameOrigin(request);}catch{return new Response('Access denied',{status:403});}
 if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
 const pair=new WebSocketPair();const [client,server]=Object.values(pair);server.accept();
 let classroomId='',upstream:WebSocket|null=null,activeId='',originalId='',started=false,steered=false,baseVersion=0,instruction='',start=0,closed=false;
 const send=(data:unknown)=>{if(!closed)try{server.send(JSON.stringify(data))}catch{}};
 const close=()=>{closed=true;try{upstream?.close()}catch{}try{server.close()}catch{}};
 const fail=(error:string)=>{send({type:'error',error});close()};
 const timeout=setTimeout(()=>fail('The intervention timed out. Use a standard request or try again.'),70000);
 server.addEventListener('close',()=>{clearTimeout(timeout);close()});server.addEventListener('error',()=>{clearTimeout(timeout);close()});
 server.addEventListener('message',async event=>{
  try{
   if(typeof event.data!=='string'||event.data.length>20000)throw new Error('Invalid message');const msg=JSON.parse(event.data);
   if(msg.type==='steer'){
    if(steered)throw new Error('One correction is allowed per pilot request.');if(!upstream||!activeId)throw new Error('Wait until Astra begins before adding a correction.');const input=z.string().min(1).max(1000).parse(msg.input);steered=true;await reserveClassAi(classroomId);await reserveAi();upstream.send(JSON.stringify({type:'response.steer',previous_response_id:activeId,input}));return;
   }
   if(msg.type!=='start'||started)throw new Error('This connection has already started');started=true;
   const row=await db().prepare('SELECT teacher_token, world, version FROM classrooms WHERE id = ?').bind(z.string().uuid().parse(msg.id)).first<{teacher_token:string;world:string;version:number}>();
   if(!row||msg.token!==row.teacher_token)throw new Error('Only the teacher can direct this classroom');const key=serverEnv('OPENAI_API_KEY');if(!key)throw new Error('Astra key is not configured');
   instruction=z.string().min(5).max(1200).parse(msg.instruction);baseVersion=row.version;start=Date.now();
   classroomId=msg.id;await reserveClassAi(classroomId);await reserveAi();
   const upstreamResponse=await fetch('https://api.openai.com/v1/responses',{headers:{Upgrade:'websocket',Authorization:`Bearer ${key}`}});upstream=upstreamResponse.webSocket;
   if(!upstream)throw new Error(`Astra steering connection unavailable (${upstreamResponse.status}). Use the standard request.`);
   upstream.accept();
   upstream.addEventListener('message',e=>{try{
    const data=JSON.parse(String(e.data));
    if(data.type==='response.created'){activeId=data.response.id;if(!originalId)originalId=activeId;send({type:'ready'});}
    if(data.type==='response.steer.accepted'){steered=true;send({type:'steered'});}
    if(data.type==='response.steer.failed')fail('Astra could not apply the correction. Retry with a standard request.');
    if(data.type==='error'||data.type==='response.failed')fail('Astra could not complete the intervention. Use the standard request.');
    if(data.type==='response.incomplete'&&data.response?.incomplete_details?.reason!=='steered')fail('The intervention did not finish. Please retry.');
    if(data.type==='response.completed'){
     // A steered original may complete first. Only the current successor is a final result.
     if(data.response.id!==activeId||(steered&&activeId===originalId))return;
     const text=data.response.output?.flatMap((i:{content?:{type:string;text?:string}[]})=>i.content??[]).filter((c:{type:string})=>c.type==='output_text').map((c:{text:string})=>c.text).join('');
     if(!text)return;
     const value=HintSchema.parse(JSON.parse(text));send({type:'result',steered,result:{baseVersion,patch:{id:crypto.randomUUID(),...value,responseId:data.response.id,latencyMs:Date.now()-start,request:instruction,kind:'teaching-prop'}}});clearTimeout(timeout);close();
    }
   }catch{fail('Astra returned an invalid intervention. No world changes were applied.');}});
   upstream.addEventListener('error',()=>fail('Astra connection failed. Your classroom is unchanged.'));
   const schema=zodToJsonSchema(HintSchema,{$refStrategy:'none'});delete schema.$schema;
   upstream.send(JSON.stringify({type:'response.create',model:serverEnv('OPENAI_MODEL')||'gpt-6-astra',reasoning:{effort:'medium'},instructions:boundary+' Create one teaching intervention with a concrete visual comparison and a guiding question. Do not reveal a complete answer or award points. Return concise copy for a prop in the world. Incorporate teacher corrections. Follow the lesson subject and mode: literature needs textual analysis and alternative readings; documentary inquiry needs source evaluation; counterfactual history needs conditional causal reasoning. Use only supplied evidence and bounded context, never later chapters or unprovided corroboration.',input:JSON.stringify({instruction,world:validateWorld(JSON.parse(row.world)),student:msg.student??null}),max_output_tokens:2500,text:{format:{type:'json_schema',name:'intervention',strict:true,schema}}}));
  }catch(e){fail(e instanceof Error?e.message:'Intervention failed');}
 });
 return new Response(null,{status:101,webSocket:client});
}
