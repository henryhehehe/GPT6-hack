import {env} from 'cloudflare:workers';
import {db} from '@/lib/server';
export async function GET(request:Request){try{
 const u=new URL(request.url),id=u.searchParams.get('id')??'',draftId=u.searchParams.get('draftId')??'',token=request.headers.get('Authorization')?.replace('Bearer ','')??'';
 const c=await db().prepare('SELECT teacher_token,world FROM classrooms WHERE id=?').bind(id).first<{teacher_token:string;world:string}>();if(!c)throw new Error('Access denied');const teacher=c.teacher_token===token;
 if(!teacher){const student=await db().prepare('SELECT id FROM students WHERE class_id=? AND id=? AND token=?').bind(id,u.searchParams.get('studentId')??'',token).first();if(!student||JSON.parse(c.world).settingImage?.draftId!==draftId)throw new Error('Access denied');}
 const row=await db().prepare("SELECT state,class_id FROM lesson_drafts WHERE id=? AND (class_id=? OR json_extract(state,'$.launch.id')=?)").bind(draftId,id,id).first<{state:string;class_id:string}>();if(!row)throw new Error('Access denied');const d=JSON.parse(row.state);if(!teacher&&d.launch.id!==id)throw new Error('Access denied');if(d.imageStatus!=='ready'||!d.imageBlobKey)throw new Error('Image not ready');
 const image=await(env as unknown as {BUCKET:R2Bucket}).BUCKET.get(d.imageBlobKey);if(!image)throw new Error('Image unavailable');return new Response(image.body,{headers:{'Content-Type':'image/png','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return Response.json({error:'This illustration is unavailable for this classroom.'},{status:403,headers:{'Cache-Control':'no-store'}});}}
