import { loadEnvFile } from 'node:process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
loadEnvFile('.env.local');
if (!process.env.OPENAI_API_KEY) throw new Error('Configured OpenAI key is missing');
const output = process.argv[2] || 'output/demo/v2';
await mkdir(output, {recursive:true});
const input = await readFile(process.argv[3] || 'docs/demo/voiceover.txt','utf8');
const started = Date.now();
const response = await fetch('https://api.openai.com/v1/audio/speech', {
 method:'POST', headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
 body:JSON.stringify({model:'gpt-4o-mini-tts',voice:'marin',input,response_format:'wav',speed:1,
 instructions:'Narrate this one-minute hackathon product demo as a thoughtful founder speaking to a small room. Warm, confident, natural American English, conversational phrasing, light genuine curiosity in the opening question. Smooth connected sentences, varied emphasis, brief natural breaths. No announcer voice, no exaggerated enthusiasm, no robotic equal stress. Aim for about 55 to 58 seconds for this complete script, around 140 words per minute. Pronounce Astra as AS-truh and Strabo as STRAY-boh. Read only the supplied script exactly, with no additions.'}),
 signal:AbortSignal.timeout(120000)
});
if(!response.ok){let e=await response.json().catch(()=>({}));throw new Error(`Speech request failed: HTTP ${response.status}, code ${e.error?.code||'unknown'}`);}
const bytes=Buffer.from(await response.arrayBuffer());
if(bytes.length<10000)throw new Error('Speech output unexpectedly short');
await writeFile(`${output}/voiceover-marin.wav`,bytes);
const metadata={model:'gpt-4o-mini-tts',voice:'marin',format:'wav',bytes:bytes.length,latencyMs:Date.now()-started,requestId:response.headers.get('x-request-id'),generatedAt:new Date().toISOString(),disclosure:'AI-generated narration'};
await writeFile(`${output}/voiceover-metadata.json`,JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify(metadata));
