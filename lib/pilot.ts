import {env} from 'cloudflare:workers';
import {reserveQuotaSql,quotaLimit,aiDisabledMessage,pilotFeatures} from './pilotPolicy';
const settings=()=>env as unknown as Record<string,string>&{DB:D1Database};
export async function reserveQuota(id:string,limit:number,message:string){
 const result=await settings().DB.prepare(reserveQuotaSql).bind(id,limit,limit).first();
 if(!result)throw new Error(message);
}
export async function reserveAi(){
 const limit=quotaLimit(settings().PILOT_AI_REQUEST_LIMIT);
 if(!limit)throw new Error(aiDisabledMessage);
 await reserveQuota('ai:pilot-v1',limit,aiDisabledMessage);
}
export async function reserveClassAi(id:string){await reserveQuota(`ai:class:${id}`,6,'This classroom has used its six pilot AI requests. Your work is saved; you can keep exploring.');}
export function requireImages(){if(!pilotFeatures.settingImages)throw new Error('New image generation is turned off for this pilot. Existing illustrations remain available.');}
async function digest(text:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function teacherSession(code:string){return digest(`teacher-session:${code}`);}
export async function teacherAuthorized(request:Request){
 const code=settings().PILOT_TEACHER_CODE;if(!code)return false;
 const cookie=request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('cw-teacher='))?.slice(11);
 return cookie===await teacherSession(code);
}
export async function requireTeacher(request:Request){if(!await teacherAuthorized(request))throw new Error('Enter the private teacher access code in the studio to create a classroom.');}
export async function validTeacherCode(code:unknown){const expected=settings().PILOT_TEACHER_CODE;return !!expected&&typeof code==='string'&&await digest(code)===await digest(expected);}
export async function limitVisitor(request:Request,kind:string,limit=8){
 const day=new Date().toISOString().slice(0,10);
 // Only trust Cloudflare's edge-provided client address, never caller-supplied forwarded headers.
 const hash=await digest(`${day}:${request.headers.get('CF-Connecting-IP')??'local'}`);
 await reserveQuota(`${kind}:${day}:${hash}`,limit,'This connection has reached today’s pilot limit. Please try again tomorrow.');
}
export function requireSameOrigin(request:Request){const origin=request.headers.get('Origin');if(origin&&origin!==new URL(request.url).origin)throw new Error('Please use the app directly to make this request.');}
