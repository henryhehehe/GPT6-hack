import {z} from 'zod';
import records from './museums/collection.json';

function trustedUrl(hosts:string[]){return z.string().url().refine(value=>{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&hosts.includes(u.hostname);},'Untrusted museum URL');}
export const MuseumObjectSchema=z.object({
 id:z.string().regex(/^cma-\d+$/),provider:z.literal('Cleveland Museum of Art'),providerId:z.number().int().positive(),
 accession:z.string().min(1),title:z.string().min(1),date:z.string(),culture:z.string(),medium:z.string(),dimensions:z.string(),creator:z.string(),credit:z.string(),
 recordUrl:trustedUrl(['clevelandart.org','www.clevelandart.org']),imageUrl:trustedUrl(['openaccess-cdn.clevelandart.org']),
 license:z.literal('CC0'),licenseUrl:z.literal('https://creativecommons.org/publicdomain/zero/1.0/'),retrievedAt:z.string(),sourceUpdatedAt:z.string(),
 topic:z.enum(['Alexandria','The Odyssey']),connection:z.string(),prompt:z.string(),limits:z.string(),
});
export type MuseumObject=z.infer<typeof MuseumObjectSchema>;
export const museumObjects=z.array(MuseumObjectSchema).parse(records);
export const MuseumObjectIdSchema=z.string().refine(id=>museumObjects.some(item=>item.id===id),'Choose an object from the reviewed museum collection.');
export const MuseumSelectionSchema=z.array(MuseumObjectIdSchema).max(6).refine(ids=>new Set(ids).size===ids.length,'Duplicate museum objects');
export function toggleMuseumObject(current:unknown,id:unknown,included:unknown){
 const ids=MuseumSelectionSchema.parse(current??[]),objectId=MuseumObjectIdSchema.parse(id),add=z.boolean().parse(included);
 return MuseumSelectionSchema.parse(add?[...new Set([...ids,objectId])]:ids.filter(value=>value!==objectId));
}
export function museumCitation(item:MuseumObject){return `${item.title}. ${item.date}. ${item.provider}, accession ${item.accession}. ${item.credit}. Image: CC0. ${item.recordUrl} (record retrieved ${item.retrievedAt}).`;}
// Keep provider HTML out of the rendered collection. Editorial teaching notes are separately maintained.
export function normalizeClevelandRecord(value:unknown,editorial:Pick<MuseumObject,'topic'|'connection'|'prompt'|'limits'>,retrievedAt:string):MuseumObject{
 const record=z.object({id:z.number().int().positive(),accession_number:z.string(),title:z.string(),creation_date:z.string(),culture:z.array(z.string()),technique:z.string(),measurements:z.string(),creators:z.array(z.object({description:z.string()})).default([]),creditline:z.string(),url:z.string(),images:z.object({web:z.object({url:z.string()})}),share_license_status:z.literal('CC0'),updated_at:z.string()}).parse(value);
 return MuseumObjectSchema.parse({id:`cma-${record.id}`,provider:'Cleveland Museum of Art',providerId:record.id,accession:record.accession_number,title:record.title,date:record.creation_date,culture:record.culture.join('; '),medium:record.technique,dimensions:record.measurements,creator:record.creators.map(c=>c.description).join('; ')||'Maker not identified in this record',credit:record.creditline,recordUrl:record.url,imageUrl:record.images.web.url,license:record.share_license_status,licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',retrievedAt,sourceUpdatedAt:record.updated_at,...editorial});
}
