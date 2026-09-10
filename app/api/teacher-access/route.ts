import {limitVisitor,requireSameOrigin,teacherAuthorized,teacherSession,validTeacherCode} from '@/lib/pilot';
export async function GET(request:Request){return Response.json({authorized:await teacherAuthorized(request)},{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){try{
 requireSameOrigin(request);await limitVisitor(request,'teacher-login',12);
 const text=await request.text();if(text.length>512)throw new Error('Invalid access code.');
 const {code}=JSON.parse(text);if(!await validTeacherCode(code))throw new Error('That teacher access code is not valid.');
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':`cw-teacher=${await teacherSession(code)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${new URL(request.url).protocol==='https:'?'; Secure':''}`}});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to sign in.'},{status:403});}}
