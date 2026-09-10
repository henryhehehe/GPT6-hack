// Test-only: run the actual built Worker with Node handling local outbound TLS.
// No model fixtures or production endpoint changes. Uses existing Miniflare via Wrangler.
import {Miniflare,Response as WorkerResponse,WebSocketPair,coupleWebSocket} from 'miniflare';
import NodeWebSocket from 'ws';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {loadEnvFile} from 'node:process';
loadEnvFile('.dev.vars');
const root=path.resolve('dist/server');
const files=await readdir(root,{recursive:true});
const paths=['index.js',...files.filter(f=>f.endsWith('.js')&&f!=='index.js')];
const modules=await Promise.all(paths.map(async f=>({type:'ESModule',path:path.join(root,f),contents:await readFile(path.join(root,f),'utf8')})));
const mf=new Miniflare({name:'review-live-check',modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],host:'127.0.0.1',port:5193,bindings:{OPENAI_API_KEY:process.env.OPENAI_API_KEY,OPENAI_MODEL:process.env.OPENAI_MODEL||'gpt-6-astra'},d1Databases:{DB:'review-live-db'},r2Buckets:['BUCKET'],assets:{directory:path.resolve('dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},outboundService:async request=>{
 const url=new URL(request.url);if(url.hostname!=='api.openai.com')return new WorkerResponse('Unexpected outbound origin in test harness',{status:502});
 if(request.headers.get('Upgrade')?.toLowerCase()==='websocket'){
  const socket=new NodeWebSocket(request.url.replace(/^https:/,'wss:'),{headers:{Authorization:request.headers.get('Authorization')},handshakeTimeout:15000});
  const pair=new WebSocketPair();await coupleWebSocket(socket,pair[1]);return new WorkerResponse(null,{status:101,webSocket:pair[0]});
 }
 const response=await fetch(request.url,{method:request.method,headers:Object.fromEntries(request.headers),body:['GET','HEAD'].includes(request.method)?undefined:await request.arrayBuffer(),signal:AbortSignal.timeout(180000)});
 const bytes=await response.arrayBuffer();try{const data=JSON.parse(new TextDecoder().decode(bytes));if(data.status&&data.status!=='completed')console.log(JSON.stringify({upstreamStatus:data.status,responseId:data.id,reason:data.incomplete_details?.reason,outputTokens:data.usage?.output_tokens}));}catch{}
 return new WorkerResponse(bytes,{status:response.status,headers:Object.fromEntries(response.headers)});
}});
await mf.ready;const database=await mf.getD1Database('DB');
for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort()){const sql=await readFile(path.join('drizzle',file),'utf8');for(const statement of sql.replace(/--[^\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean))await database.prepare(statement).run();}
console.log('Local model-check Worker ready on http://127.0.0.1:5193 (real Astra through Node egress; ephemeral database).');
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>void mf.dispose().then(()=>process.exit(0)));
