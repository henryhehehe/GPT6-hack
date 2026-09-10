import {prepareCatalogLesson} from '../lib/curriculum';
import {writeFile} from 'node:fs/promises';
import {zodToJsonSchema} from 'zod-to-json-schema';
import {initialWorld} from '../lib/world';
import {sceneDirectorSchema,sceneInstructions,sceneCapabilities,applySceneChange} from '../lib/sceneIntervention';
import assert from 'node:assert/strict';

// One explicit paid verification of the expanded model contract; no classroom writes.
if(!process.argv.includes('--live'))throw new Error('Pass --live for one paid Astra scene-direction request.');
process.loadEnvFile(process.env.ASTRA_ENV_FILE??'.env.local');
const reading=process.argv.includes('--reading'),world=reading?prepareCatalogLesson('austen-letter-01').world!:initialWorld;
const expected={timeOfDay:'sunset',weather:'hazy',water:reading?'calm':'choppy',viewpoint:reading?'market':'harbor'};
const directorSchema=sceneDirectorSchema(world);
const key=process.env.OPENAI_API_KEY;if(!key)throw new Error('The existing local API connection is unavailable.');
const schema=zodToJsonSchema(directorSchema,{$refStrategy:'none'});delete schema.$schema;
const started=Date.now();
const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-6-astra',reasoning:{effort:'medium'},instructions:sceneInstructions(world),input:JSON.stringify({world,sceneCapabilities:sceneCapabilities(world),instruction:reading?'Set hazy sunset lighting, keep water calm, and frame the second reading station (market). Preserve the assigned text, activities and character identities. This is illustrative atmosphere.':'Set a hazy sunset with choppy water and frame the harbor. Keep every current activity value, the intervention, consequences and mechanisms exactly unchanged. This is an appearance-only edit.'}),max_output_tokens:4000,text:{format:{type:'json_schema',name:'scene_appearance',strict:true,schema}}}),signal:AbortSignal.timeout(75000)});
if(!response.ok)throw new Error(`Astra request failed (${response.status}).`);
const data=await response.json() as {id:string;status:string;output:{content?:{type:string;text?:string}[]}[]};
assert.equal(data.status,'completed');
const text=data.output.flatMap(item=>item.content??[]).filter(item=>item.type==='output_text').map(item=>item.text).join('');
const result=directorSchema.parse(JSON.parse(text));
assert.deepEqual(result.scene.appearance,expected);
const changed=applySceneChange(world,result.scene);assert.deepEqual(changed.evidence,world.evidence);assert.deepEqual(changed.nodes,world.nodes);assert.deepEqual(changed.lessonPack,world.lessonPack);
const evidence={passed:true,responseId:data.id,latencyMs:Date.now()-started,appearance:result.scene.appearance,question:result.question};
await writeFile(process.env.ASTRA_PROBE_OUTPUT??'artifacts/astra-scene-appearance-live.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
