import {test} from 'node:test';
import assert from 'node:assert/strict';
import {museumObjects,MuseumObjectSchema,MuseumSelectionSchema,toggleMuseumObject,normalizeClevelandRecord,museumCitation} from '../lib/museums';
import {initialWorld,validateWorld} from '../lib/world';
import {GeneratedLessonSchema} from '../lib/lessonBuilder';

test('approved objects retain provider identity, exact dates, CC0 rights and teaching limits',()=>{
 assert.equal(new Set(museumObjects.map(item=>item.id)).size,5);
 for(const item of museumObjects){assert.equal(item.id,`cma-${item.providerId}`);assert.equal(item.license,'CC0');assert.ok(item.limits.length>60);assert.ok(museumCitation(item).includes(item.accession));}
 assert.equal(museumObjects.find(item=>item.id==='cma-142026')!.date,'205–145 BCE');
});
test('selection is bounded, idempotent, rejects invented objects, and survives world parsing',()=>{
 const id=museumObjects[0].id;assert.deepEqual(toggleMuseumObject([],id,true),[id]);assert.deepEqual(toggleMuseumObject([id],id,true),[id]);assert.deepEqual(toggleMuseumObject([id],id,false),[]);
 assert.throws(()=>toggleMuseumObject([],'cma-999999',true));assert.throws(()=>toggleMuseumObject([],id,'true'));assert.equal(MuseumSelectionSchema.safeParse([id,id]).success,false);
 assert.deepEqual(validateWorld({...initialWorld,museumObjectIds:[id]}).museumObjectIds,[id]);
 assert.equal('museumObjectIds' in GeneratedLessonSchema.shape,false);
});
test('normalization refuses restricted images, missing images, and untrusted URL hosts',()=>{
 const item=museumObjects[0],editorial={topic:item.topic,connection:item.connection,prompt:item.prompt,limits:item.limits};
 const raw={id:item.providerId,accession_number:item.accession,title:item.title,creation_date:item.date,culture:[item.culture],technique:item.medium,measurements:item.dimensions,creditline:item.credit,url:item.recordUrl,images:{web:{url:item.imageUrl}},share_license_status:'CC0',updated_at:item.sourceUpdatedAt};
 assert.equal(normalizeClevelandRecord(raw,editorial,'2026-09-10').date,item.date);
 for(const patch of [{share_license_status:'Copyrighted'},{share_license_status:'Other'},{images:null},{url:'https://clevelandart.org.evil.test/art/1'},{images:{web:{url:'http://127.0.0.1/private'}}}])assert.throws(()=>normalizeClevelandRecord({...raw,...patch},editorial,'2026-09-10'));
 assert.equal(MuseumObjectSchema.safeParse({...item,imageUrl:'https://openaccess-cdn.clevelandart.org:8443/a.jpg'}).success,false);
});
