import {env} from 'cloudflare:workers';
import {db} from '@/lib/server';
import {WorldSchema,type ZoneId} from '@/lib/world';
import {portraitFingerprint,portraitLeaseMs} from '@/lib/characterPortrait';

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
 let c:Awaited<ReturnType<typeof context>>;try{c=await context(request);}catch{return json({error:'This portrait is unavailable for this classroom.'},403);}
 return json({status:'disabled',error:'New portraits are turned off for this pilot.'});

}
