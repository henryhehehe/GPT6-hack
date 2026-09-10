// Offline integration regression against the actual built Worker. No real keys or network egress.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {Miniflare,Response as WorkerResponse} from 'miniflare';
const root=path.resolve('dist/server');
const files=await readdir(root,{recursive:true});
const modules=await Promise.all(['index.js',...files.filter(f=>f.endsWith('.js')&&f!=='index.js')].map(async f=>({type:'ESModule',path:path.join(root,f),contents:await readFile(path.join(root,f),'utf8')})));
let intercepted=0,fail=false;
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
const mf=new Miniflare({name:'portrait-regression',modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],host:'127.0.0.1',port:0,bindings:{PILOT_PORTRAIT_REQUEST_LIMIT:'5',OPENAI_API_KEY:'offline-test-key'},d1Databases:{DB:'portrait-regression'},r2Buckets:['BUCKET'],assets:{directory:path.resolve('dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},outboundService:async request=>{
 intercepted++;const input=await request.json();assert.equal(input.tools[0].type,'image_generation');assert.equal(input.tools[0].size,'1024x1536');
 await new Promise(r=>setTimeout(r,100));
 return new WorkerResponse(JSON.stringify(fail?{}:{id:`image-${intercepted}`,status:'completed',output:[{type:'image_generation_call',result:png}]}),{status:fail?503:200,headers:{'Content-Type':'application/json'}});
}});
try{
 await mf.ready;const db=await mf.getD1Database('DB');
 for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile(path.join('drizzle',file),'utf8')).replace(/--[^\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();
 const {initialWorld}=await import('../lib/world.ts'),{portraitFingerprint}=await import('../lib/characterPortrait.ts');
 const world=JSON.stringify(initialWorld);
 for(const id of ['one','two','three']){
 await db.prepare('INSERT INTO classrooms (id,teacher_token,invite_token,world,state,lesson,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,`teacher-${id}`,'invite',world,'{}','lesson','now').run();
 await db.prepare('INSERT INTO students (id,class_id,token,state) VALUES (?,?,?,?)').bind(`student-${id}`,id,`token-${id}`,'{}').run();
 }
 const endpoint=async(id,npc)=>`/api/character-portrait?${new URLSearchParams({id,studentId:`student-${id}`,npc,fingerprint:await portraitFingerprint(initialWorld,npc)})}`;
 const request=async(url,method='POST',token='token-one',origin='http://localhost')=>mf.dispatchFetch(`http://localhost${url}`,{method,headers:{Origin:origin,...(token?{Authorization:`Bearer ${token}`}:{})}});
 const used=async id=>(await db.prepare('SELECT used FROM pilot_usage WHERE id=?').bind(id).first())?.used??0;
 const first=await endpoint('one','harbor');
 for(const [url,token,origin] of [[first,'','http://localhost'],[first,'token-two','http://localhost'],[first,'token-one','https://foreign.example'],[first.replace(/fingerprint=[^&]+/,'fingerprint=wrong'),'token-one','http://localhost']])assert.equal((await request(url,'POST',token,origin)).status,403);
 assert.equal(intercepted,0);assert.equal(await used('portraits:pilot-v1'),0);
 assert.equal((await (await request(first,'GET')).json()).status,'missing');assert.equal(intercepted,0);
 const pair=await Promise.all([request(first),request(first)]);const data=await Promise.all(pair.map(r=>r.json()));assert.ok(data.some(d=>d.status==='ready'));assert.ok(data.every(d=>['generating','ready'].includes(d.status)));assert.equal(intercepted,1);
 const cached=await (await request(first)).json();assert.equal(cached.status,'ready');assert.equal(intercepted,1);
 const image=await request(first+'&image=1','GET');assert.equal(image.status,200);assert.equal(image.headers.get('Content-Type'),'image/png');assert.equal(Buffer.from(await image.arrayBuffer()).toString('base64'),png);
 assert.equal((await request(first+'&image=1','GET','teacher-one')).status,200);assert.equal((await request(first+'&image=1','GET','token-two')).status,403);
 fail=true;const second=await endpoint('one','market');
 for(let i=0;i<2;i++)assert.equal((await (await request(second)).json()).status,'failed');
 assert.equal((await (await request(second)).json()).status,'disabled');assert.equal(await used('portraits:class:one'),3);assert.equal(intercepted,3);
 fail=false;
 for(const npc of ['harbor','market'])assert.equal((await (await request(await endpoint('two',npc),'POST','token-two')).json()).status,'ready');
 assert.equal((await (await request(await endpoint('three','library'),'POST','token-three')).json()).status,'disabled');assert.equal(intercepted,5);assert.equal(await used('portraits:pilot-v1'),5);
 assert.equal((await (await request(first)).json()).status,'ready');assert.equal(intercepted,5);assert.equal(await used('ai:pilot-v1'),0);
 console.log('PASS built Worker: learner/teacher authentication, stale fingerprints, origin protection, explicit generation, duplicate lease, R2 caching, failed-attempt/class/global caps, cached access after exhaustion, independent text budget. All image calls intercepted locally.');
}finally{await mf.dispose();}
