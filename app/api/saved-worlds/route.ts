import {z} from 'zod';
import {db} from '@/lib/server';
import {copyLibraryDraft,draftSummary,type StoredLibraryDraft} from '@/lib/savedWorlds';
import {validateWorld} from '@/lib/world';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const token=()=>crypto.randomUUID()+crypto.randomUUID();
async function owner(request:Request){
 const id=z.string().uuid().parse(new URL(request.url).searchParams.get('id'));
 const row=await db().prepare('SELECT id,world,lesson,created_at FROM classrooms WHERE id=? AND teacher_token=?').bind(id,request.headers.get('Authorization')?.replace('Bearer ','')??'').first<{id:string;world:string;lesson:string;created_at:string}>();
 if(!row)throw new Error('Only this classroom’s teacher can open its saved worlds.');return row;
}
export async function GET(request:Request){try{
 const c=await owner(request),world=validateWorld(JSON.parse(c.world));
 const rows=await db().prepare("SELECT state,created_at FROM lesson_drafts WHERE class_id=? OR json_extract(state,'$.launch.id')=? ORDER BY created_at DESC").bind(c.id,c.id).all<{state:string;created_at:string}>();
 return json({classroom:{id:c.id,title:world.title,objective:world.objective,sourceTitle:world.lessonPack?.sourceTitle??'Alexandria',createdAt:c.created_at,ready:true},drafts:rows.results.map(row=>draftSummary(JSON.parse(row.state),row.created_at))});
 }catch(e){return json({error:e instanceof Error?e.message:'Unable to load saved worlds.'},403);}}
export async function POST(request:Request){try{
 const origin=request.headers.get('Origin');if(origin&&origin!==new URL(request.url).origin)throw new Error('Please use the app directly to make this request.');const c=await owner(request);
 const raw=await request.text();if(raw.length>2000)return json({error:'Request too large.'},413);
 const b=z.object({kind:z.enum(['classroom','draft']),sourceId:z.string().uuid(),requestId:z.string().uuid()}).parse(JSON.parse(raw));
 const copiedFrom=`${b.kind}:${b.sourceId}`;
 const existing=await db().prepare('SELECT class_id,state FROM lesson_drafts WHERE id=?').bind(b.requestId).first<{class_id:string;state:string}>();
 if(existing){if(existing.class_id!==c.id||JSON.parse(existing.state).copiedFrom!==copiedFrom)throw new Error('This reuse request belongs to another world. Please reopen the library.');return json({draftId:b.requestId});}
 let source:StoredLibraryDraft;
 if(b.kind==='draft'){
  const row=await db().prepare("SELECT state FROM lesson_drafts WHERE id=? AND (class_id=? OR json_extract(state,'$.launch.id')=?)").bind(b.sourceId,c.id,c.id).first<{state:string}>();
  if(!row)throw new Error('Saved world not found in this classroom.');source=JSON.parse(row.state);
 }else{
  if(b.sourceId!==c.id)throw new Error('Classroom access denied.');const world=validateWorld(JSON.parse(c.world));
  const row=await db().prepare("SELECT state FROM lesson_drafts WHERE json_extract(state,'$.launch.id')=? ORDER BY created_at DESC LIMIT 1").bind(c.id).first<{state:string}>();
  if(row)source={...JSON.parse(row.state),world};
  else {if(world.settingImage)throw new Error('The saved illustration source could not be found.');source={id:c.id,title:world.lessonPack?.sourceTitle??world.title,range:world.lessonPack?.readingRange??'',objective:world.objective,format:'text',sourceUrl:null,hasUpload:false,passages:world.evidence.map(e=>({id:e.id,text:e.text,locator:e.source})),world,run:null,blobKey:null,launch:{id:'',studentId:'',studentToken:''}};}
 }
 if(b.kind==='classroom')source.savedLesson=c.lesson;
 if(!source.world)throw new Error('Finish preparing this draft before starting a new classroom.');
 const launch={id:crypto.randomUUID(),teacherToken:token(),inviteToken:token(),studentId:crypto.randomUUID(),studentToken:token()};
 const copy=copyLibraryDraft(source,b.requestId,launch,copiedFrom);
 await db().prepare("INSERT OR IGNORE INTO lesson_drafts (id,class_id,state,created_at) SELECT ?,?,?,? WHERE (SELECT count(*) FROM lesson_drafts WHERE class_id=? AND created_at>=? AND json_extract(state,'$.copiedFrom') IS NOT NULL)<30").bind(copy.id,c.id,JSON.stringify(copy),new Date().toISOString(),c.id,new Date(Date.now()-86400000).toISOString()).run();
 const stored=await db().prepare('SELECT class_id,state FROM lesson_drafts WHERE id=?').bind(copy.id).first<{class_id:string;state:string}>();
 if(!stored)throw new Error('This classroom has reached its 30 saved-world copies for today. Reopen an existing copy.');
 if(stored.class_id!==c.id||JSON.parse(stored.state).copiedFrom!==copiedFrom)throw new Error('This request changed. Please reopen the library.');
 return json({draftId:copy.id});
 }catch(e){return json({error:e instanceof Error?e.message:'Unable to reuse this world.'},400);}}
