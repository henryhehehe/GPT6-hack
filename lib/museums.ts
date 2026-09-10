import {z} from 'zod';
import records from './museums/collection.json';

function trustedUrl(hosts:string[]){return z.string().url().refine(value=>{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&hosts.includes(u.hostname);},'Untrusted museum URL');}
const commonFields={
 providerId:z.number().int().positive(),
 accession:z.string().min(1),title:z.string().min(1),date:z.string(),culture:z.string(),medium:z.string(),dimensions:z.string(),creator:z.string(),credit:z.string(),
 license:z.literal('CC0'),licenseUrl:z.literal('https://creativecommons.org/publicdomain/zero/1.0/'),retrievedAt:z.string(),sourceUpdatedAt:z.string(),
 topic:z.enum(['Alexandria','The Odyssey','Jane Austen']),connection:z.string(),prompt:z.string(),limits:z.string(),
};
export const MuseumObjectSchema=z.discriminatedUnion('provider',[
 z.object({...commonFields,id:z.string().regex(/^cma-\d+$/),provider:z.literal('Cleveland Museum of Art'),recordUrl:trustedUrl(['clevelandart.org','www.clevelandart.org']),imageUrl:trustedUrl(['openaccess-cdn.clevelandart.org'])}),
 z.object({...commonFields,id:z.string().regex(/^met-\d+$/),provider:z.literal('The Metropolitan Museum of Art'),recordUrl:trustedUrl(['www.metmuseum.org','metmuseum.org']),imageUrl:trustedUrl(['images.metmuseum.org'])}),
]).refine(item=>item.id===`${item.provider==='Cleveland Museum of Art'?'cma':'met'}-${item.providerId}`,'Museum identity mismatch')
 .refine(item=>item.provider!=='The Metropolitan Museum of Art'||new URL(item.recordUrl).pathname===`/art/collection/search/${item.providerId}`,'Museum record identity mismatch');
export type MuseumObject=z.infer<typeof MuseumObjectSchema>;
export const museumObjects=z.array(MuseumObjectSchema).parse(records);
export const museumTopics=[...new Set(museumObjects.map(item=>item.topic))];
export const museumProviders=[...new Set(museumObjects.map(item=>item.provider))];
export const MuseumObjectIdSchema=z.string().refine(id=>museumObjects.some(item=>item.id===id),'Choose an object from the reviewed museum collection.');
export const MuseumSelectionSchema=z.array(MuseumObjectIdSchema).max(6).refine(ids=>new Set(ids).size===ids.length,'Duplicate museum objects');
export function toggleMuseumObject(current:unknown,id:unknown,included:unknown){
 const ids=MuseumSelectionSchema.parse(current??[]),objectId=MuseumObjectIdSchema.parse(id),add=z.boolean().parse(included);
 return MuseumSelectionSchema.parse(add?[...new Set([...ids,objectId])]:ids.filter(value=>value!==objectId));
}
export function normalizeMetRecord(value:unknown,editorial:Pick<MuseumObject,'topic'|'connection'|'prompt'|'limits'>,retrievedAt:string):MuseumObject{
 const record=z.object({objectID:z.number().int().positive(),isPublicDomain:z.literal(true),accessionNumber:z.string(),title:z.string(),objectDate:z.string(),culture:z.string(),medium:z.string(),dimensions:z.string(),artistDisplayName:z.string(),artistPrefix:z.string(),artistSuffix:z.string(),artistRole:z.string(),artistDisplayBio:z.string(),creditLine:z.string(),objectURL:z.string(),primaryImageSmall:z.string().min(1),metadataDate:z.string()}).parse(value);
 const artist=[record.artistPrefix,record.artistDisplayName,record.artistSuffix].filter(Boolean).join(' ');
 const creator=record.artistDisplayName?[record.artistRole?`${record.artistRole}: ${artist}`:artist,record.artistDisplayBio].filter(Boolean).join('; '):'Maker not identified in this record';
 return MuseumObjectSchema.parse({id:`met-${record.objectID}`,provider:'The Metropolitan Museum of Art',providerId:record.objectID,accession:record.accessionNumber,title:record.title,date:record.objectDate,culture:record.culture||'Not specified in the API record; see the museum record',medium:record.medium,dimensions:record.dimensions||'Not specified in the API record',creator,credit:record.creditLine,recordUrl:record.objectURL,imageUrl:record.primaryImageSmall,license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',retrievedAt,sourceUpdatedAt:record.metadataDate,...editorial});
}
export function museumCitation(item:MuseumObject){return `${item.title}. ${item.date}. ${item.provider}, accession ${item.accession}. ${item.credit}. Image: CC0. ${item.recordUrl} (record retrieved ${item.retrievedAt}).`;}
// Keep provider HTML out of the rendered collection. Editorial teaching notes are separately maintained.
export function normalizeClevelandRecord(value:unknown,editorial:Pick<MuseumObject,'topic'|'connection'|'prompt'|'limits'>,retrievedAt:string):MuseumObject{
 const record=z.object({id:z.number().int().positive(),accession_number:z.string(),title:z.string(),creation_date:z.string(),culture:z.array(z.string()),technique:z.string(),measurements:z.string(),creators:z.array(z.object({description:z.string()})).default([]),creditline:z.string(),url:z.string(),images:z.object({web:z.object({url:z.string()})}),share_license_status:z.literal('CC0'),updated_at:z.string()}).parse(value);
 return MuseumObjectSchema.parse({id:`cma-${record.id}`,provider:'Cleveland Museum of Art',providerId:record.id,accession:record.accession_number,title:record.title,date:record.creation_date,culture:record.culture.join('; '),medium:record.technique,dimensions:record.measurements,creator:record.creators.map(c=>c.description).join('; ')||'Maker not identified in this record',credit:record.creditline,recordUrl:record.url,imageUrl:record.images.web.url,license:record.share_license_status,licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',retrievedAt,sourceUpdatedAt:record.updated_at,...editorial});
}
