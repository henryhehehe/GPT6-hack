import {env} from 'cloudflare:workers';
import {astraPortraitImage,db} from '@/lib/server';
import {WorldSchema,type ZoneId} from '@/lib/world';
import {claimPortraitSql,finishPortraitSql,portraitFingerprint,portraitLeaseMs} from '@/lib/characterPortrait';

import {requireSameOrigin} from '@/lib/pilot';

type Portrait={status:string;updated_at:number;blob_key:string|null;response_id:string|null};
const bucket=()=>(env as unknown as {BUCKET:R2Bucket}).BUCKET;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function context(request:Request){
 const u=new URL(request.url),classId=u.searchParams.get('id')??'',npc=u.searchParams.get('npc') as ZoneId,token=request.headers.get('Authorization')?.replace('Bearer ','')??'';
 if(!['harbor','market','library'].includes(npc)||!token)throw new Error('Access denied');
 const row=await db().prepare('SELECT teacher_token,world FROM classrooms WHERE id=?').bind(classId).first<{teacher_token:string;world:string}>();
 if(!row)throw new Error('Access denied');
 if(row.teacher_token!==token){const student=await db().prepare('SELECT id FROM students WHERE class_id=? AND id=? AND token=?').bind(classId,u.searchParams.get('studentId')??'',token).first();if(!student)throw new Error('Access denied');}
 const world=WorldSchema.parse(JSON.parse(row.world)),fingerprint=await portraitFingerprint(world,npc);
 // Clients must identify the version they are viewing; a late response never represents a new character.
 if(u.searchParams.get('fingerprint')!==fingerprint)throw new Error('Character changed');
 return {id:`${classId}:${npc}:${fingerprint}`,classId,npc,world,u};
}
async function read(id:string){return db().prepare('SELECT status,updated_at,blob_key,response_id FROM character_portraits WHERE id=?').bind(id).first<Portrait>();}
function status(row:Portrait|null){return {status:!row?'missing':row.status==='generating'&&row.updated_at<Date.now()-portraitLeaseMs?'failed':row.status,responseId:row?.response_id??null};}
export async function GET(request:Request){
 try{const c=await context(request),row=await read(c.id);if(c.u.searchParams.get('image')!=='1')return json(status(row));
  if(row?.status!=='ready'||!row.blob_key)return json({error:'Portrait is not ready.'},404);
  const image=await bucket().get(row.blob_key);if(!image){await db().prepare("UPDATE character_portraits SET status='failed',updated_at=? WHERE id=? AND status='ready' AND blob_key=?").bind(Date.now(),c.id,row.blob_key).run();return json({error:'Portrait is unavailable. Retry to prepare it again.'},404);}
  return new Response(image.body,{headers:{'Content-Type':'image/png','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return json({error:'This portrait is unavailable for this classroom.'},403);}
}
export async function POST(request:Request){
 let c:Awaited<ReturnType<typeof context>>;try{requireSameOrigin(request);c=await context(request);}catch{return json({error:'This portrait is unavailable for this classroom.'},403);}
 const lease=crypto.randomUUID(),now=Date.now();
 try{const claim=await db().prepare(claimPortraitSql).bind(c.id,c.classId,lease,now,now-portraitLeaseMs).run();if(!claim.meta.changes)return json(status(await read(c.id)));
  const result=await astraPortraitImage(c.world,c.npc,c.classId),blobKey=`character-portraits/${c.classId}/${lease}.png`;
  await bucket().put(blobKey,result.bytes,{httpMetadata:{contentType:'image/png'}});
  const saved=await db().prepare(finishPortraitSql).bind(blobKey,result.responseId,result.model,Date.now(),c.id,lease).run();if(!saved.meta.changes)await bucket().delete(blobKey);
  return json(status(await read(c.id)));
 }catch(error){await db().prepare("UPDATE character_portraits SET status='failed',updated_at=? WHERE id=? AND lease=? AND status='generating'").bind(Date.now(),c.id,lease).run().catch(()=>{});
  const message=error instanceof Error?error.message:'';
  // Only quota/config messages are safe and useful to expose; upstream/storage details stay private.
  const limited=/^(New portraits are paused|This classroom has used its three portrait attempts|The pilot portrait allowance has been used)/.test(message);
  return json({status:limited?'disabled':'failed',error:limited?message:'The portrait could not be prepared. You can keep talking and retry it later.'});
 }
}
