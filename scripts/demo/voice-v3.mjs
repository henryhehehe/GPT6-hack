import {loadEnvFile} from 'node:process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
loadEnvFile('.env.local');
if(!process.env.OPENAI_API_KEY)throw new Error('Configured OpenAI key is missing');
const out='output/demo/v3';await mkdir(out,{recursive:true});
const mode=process.argv[2],closing=mode.endsWith('-closing'),speech=mode.startsWith('narrate'),stem=closing?'closing':'voiceover';let url,body,headers={Authorization:`Bearer ${process.env.OPENAI_API_KEY}`};
if(speech){
 const script=await readFile('docs/demo/v3/voiceover.txt','utf8');
 const input=closing?script.trim().split(/\n\s*\n/).at(-1):script;
 url='https://api.openai.com/v1/audio/speech';headers['Content-Type']='application/json';
 body=JSON.stringify({model:'gpt-4o-mini-tts',voice:'marin',input,response_format:'wav',speed:1,
 instructions:closing?'Read every word of this closing line exactly. Warm, confident, conversational, relaxed founder voice. Let the final word land clearly. Match a thoughtful product demo, no announcer voice. Pronounce Step clearly with a final P, rhyming with pep.':'Read this complete 60-second hackathon demo script exactly, without additions. Speak like a thoughtful founder showing one surprising interaction to a judge: warm, clear, confident, conversational American English. Aim for 54 to 57 seconds, with brief natural pauses between the seven paragraphs. Give the opening quote quiet confidence, then a small pause. Emphasize could in the teacher question and possible, not inevitable in the revision. Let the final sentence breathe. Smooth connected speech, no announcer voice. Pronounce Astra AS-truh and Strabo STRAY-boh.'});
}else if(mode.startsWith('transcribe')){
 url='https://api.openai.com/v1/audio/transcriptions';body=new FormData();
 body.set('file',new Blob([await readFile(`${out}/${stem}-natural.wav`)],{type:'audio/wav'}),'voiceover.wav');
 body.set('model','whisper-1');body.set('response_format','verbose_json');body.set('language','en');
 body.append('timestamp_granularities[]','word');body.append('timestamp_granularities[]','segment');
}else throw new Error('Use narrate or transcribe');
const started=Date.now();
const response=await fetch(url,{method:'POST',headers,body,signal:AbortSignal.timeout(120000)});
if(!response.ok)throw new Error(`Audio ${mode} failed: HTTP ${response.status}`);
if(speech){
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<10000)throw new Error('Speech output unexpectedly short');
 await writeFile(`${out}/${stem}-marin.wav`,bytes);
 const metadata={model:'gpt-4o-mini-tts',voice:'marin',bytes:bytes.length,latencyMs:Date.now()-started,generatedAt:new Date().toISOString(),disclosure:'AI-generated narration'};
 await writeFile(`${out}/${stem}-metadata.json`,JSON.stringify(metadata,null,2)+'\n');console.log(metadata);
}else{
 const data=await response.json();await writeFile(`${out}/${closing?'closing-transcript':'transcript'}.json`,JSON.stringify(data,null,2)+'\n');
 console.log(JSON.stringify({duration:data.duration,text:data.text,segments:data.segments}));
}
