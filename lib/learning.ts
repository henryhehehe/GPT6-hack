import { z } from 'zod';
import { type Evidence, type StudentState, type Turn, type World } from './world';

export const CitationSchema=z.object({evidenceId:z.string().min(1).max(60),material:z.enum(['text','excerpt']),sourceVersion:z.string().regex(/^[a-f0-9]{64}$/),start:z.number().int().nonnegative(),end:z.number().int().positive(),quote:z.string().min(1).max(700),relevance:z.string().trim().min(3).max(400)});
export type Citation=z.infer<typeof CitationSchema>;
export const ArgumentSchema=z.object({requestId:z.string().uuid(),claim:z.string().trim().min(3).max(1600),npc:z.enum(['harbor','market','library']),scenario:z.boolean(),citations:z.array(CitationSchema).max(6),revisesTurnId:z.string().min(1).max(80).optional(),reflection:z.string().trim().max(600).default('')});
export type ArgumentInput=z.infer<typeof ArgumentSchema>;
export const predictionSchema=z.string().trim().min(3).max(600);
export const reflectionSchema=z.string().trim().min(10).max(600);
const straboExcerpt='The Museum is also a part of the royal palaces';

export function materials(evidence:Evidence){
 const verified=!evidence.context&&evidence.id==='strabo'&&evidence.kind==='source'&&evidence.source==='Strabo, Geography 17.1.8 · https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/17A1*.html'&&evidence.text==='Strabo describes a shared dining hall and a learned community at the Museum, within the royal palaces. This supports an institutional context; it does not establish trade as its only source of funding.';
 return verified?[{id:'excerpt' as const,label:'Verified source excerpt',text:straboExcerpt},{id:'text' as const,label:'Reading note · paraphrase',text:evidence.text}]:[{id:'text' as const,label:evidence.kind==='source'?'Reviewed source excerpt':evidence.kind==='assumption'?'Scenario assumption':'Invented teaching prop',text:evidence.text}];
}
function contextIdentity(evidence:Evidence){
 const c=evidence.context;
 return c?[c.text,c.locator,c.sourceVersion,c.start,c.end,c.editorialNote??null,c.readingNote??null,(c.references??[]).map(r=>[r.title,r.url])]:null;
}
export async function sourceVersion(evidence:Evidence){
 // Keep previously saved citations valid for unchanged legacy cards.
 const fields:unknown[]=[evidence.id,evidence.title,evidence.text,evidence.kind,evidence.source,evidence.zone,materials(evidence)];
 if(evidence.context)fields.push(contextIdentity(evidence));
 const text=JSON.stringify(fields);
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
}
// Ranges use JS UTF-16 offsets. Sentence choices make passage selection keyboard-operable.
export function passages(text:string){
 return Array.from(text.matchAll(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g),m=>{
  const start=m.index!+m[0].length-m[0].trimStart().length,quote=m[0].trim();
  return {start,end:start+quote.length,quote};
 }).filter(p=>p.quote.length>0);
}
export async function validateCitations(value:unknown,student:StudentState,world:World){
 const citations=z.array(CitationSchema).max(6).parse(value),seen=new Set<string>();
 for(const citation of citations){
  const evidence=world.evidence.find(e=>e.id===citation.evidenceId);
  if(!evidence||!student.evidence.includes(citation.evidenceId))throw new Error('Select evidence saved in your journal.');
  const material=materials(evidence).find(m=>m.id===citation.material);
  if(!material||citation.end>material.text.length||citation.start>=citation.end||material.text.slice(citation.start,citation.end)!==citation.quote)throw new Error('The selected quotation does not match the source. Select it again.');
  if(citation.sourceVersion!==await sourceVersion(evidence))throw new Error('This source changed. Reopen it and select a passage again.');
  const key=JSON.stringify([citation.evidenceId,citation.material,citation.start,citation.end]);
  if(seen.has(key))throw new Error('This passage is selected twice.');seen.add(key);
 }
 return citations;
}
export const turnId=(turn:Turn,index:number)=>turn.id??`legacy-${index}`;
export const normalizedAnswer=(text:string)=>text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function revisionStatus(input:ArgumentInput,student:StudentState){
 if(!input.revisesTurnId){if(input.reflection)throw new Error('Select the explanation you are revising.');return false;}
 const prior=student.turns.find((t,i)=>turnId(t,i)===input.revisesTurnId);
 if(!prior)throw new Error('The original explanation was not found in your work.');
 reflectionSchema.parse(input.reflection);
 return normalizedAnswer(prior.claim)!==normalizedAnswer(input.claim);
}
export function previousSubmission(input:ArgumentInput,student:StudentState){
 const previous=student.turns.find(t=>t.id===input.requestId);if(!previous)return;
 if(previous.submission!==JSON.stringify(input))throw new Error('This submission ID was already used for different work.');
 return previous;
}
export function preserveReviewedSources(generated:World,reviewed:World){
 const required=reviewed.evidence.filter(e=>e.kind==='source');
 for(const old of required){const e=generated.evidence.find(e=>e.id===old.id);if(!e||(['id','title','text','kind','source','zone'] as const).some(k=>e[k]!==old[k])||JSON.stringify(contextIdentity(e))!==JSON.stringify(contextIdentity(old)))throw new Error('Every reviewed source must remain present and unchanged.');}
 if(generated.evidence.some(e=>e.kind==='source'&&!required.some(old=>old.id===e.id)))throw new Error('Unreviewed source material cannot be added by generation.');
 return generated;
}
