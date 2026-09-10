import {db} from '@/lib/server';
export async function GET(){try{await db().prepare('SELECT used FROM pilot_usage LIMIT 1').all();return Response.json({status:'ok'},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({status:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}}
