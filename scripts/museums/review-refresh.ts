/** Run with npx tsx scripts/museums/review-refresh.ts. Produces a review candidate; never silently replaces approved records. */
import {writeFile} from 'node:fs/promises';
import {museumObjects,normalizeClevelandRecord} from '../../lib/museums';
const candidate=[];
for(const item of museumObjects){
 const response=await fetch(`https://openaccess-api.clevelandart.org/api/artworks/${item.providerId}`,{signal:AbortSignal.timeout(15000),redirect:'error'});
 if(!response.ok)throw new Error(`Museum request failed: ${response.status}`);
 const result=await response.json() as {data:unknown};
 const updated=normalizeClevelandRecord(result.data,{topic:item.topic,connection:item.connection,prompt:item.prompt,limits:item.limits},new Date().toISOString().slice(0,10));
 if(updated.id!==item.id||updated.accession!==item.accession)throw new Error('Provider identity changed; review the source record manually.');
 candidate.push(updated);
}
await writeFile('/private/tmp/cw-museum-review.json',JSON.stringify(candidate,null,2)+'\n');
console.log('Review candidate written to /private/tmp/cw-museum-review.json. Check changed dates, attribution and rights before replacing the approved collection.');
