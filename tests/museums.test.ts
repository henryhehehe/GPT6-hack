import {test} from 'node:test';
import assert from 'node:assert/strict';
import {museumObjects,MuseumObjectSchema,MuseumSelectionSchema,toggleMuseumObject,normalizeClevelandRecord,normalizeMetRecord,museumCitation} from '../lib/museums';
import {initialWorld,validateWorld} from '../lib/world';
import {GeneratedLessonSchema} from '../lib/lessonBuilder';

test('approved objects retain provider identity, exact dates, CC0 rights and teaching limits',()=>{
 assert.equal(new Set(museumObjects.map(item=>item.id)).size,museumObjects.length);
 for(const item of museumObjects){assert.equal(item.id,`${item.provider==='Cleveland Museum of Art'?'cma':'met'}-${item.providerId}`);assert.equal(item.license,'CC0');assert.ok(item.limits.length>60);assert.ok(museumCitation(item).includes(item.accession));}
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

test('Met normalization verifies public-domain images, identity and attribution qualifiers',()=>{
 const item=museumObjects.find(item=>item.id==='met-90487')!;
 const editorial={topic:item.topic,connection:item.connection,prompt:item.prompt,limits:item.limits};
 const raw={objectID:item.providerId,isPublicDomain:true,accessionNumber:item.accession,title:item.title,objectDate:item.date,culture:item.culture,medium:item.medium,dimensions:'',artistDisplayName:'Example maker',artistPrefix:'Attributed to',artistSuffix:'and workshop',artistRole:'Designer',artistDisplayBio:'British',creditLine:item.credit,objectURL:item.recordUrl,primaryImageSmall:item.imageUrl,metadataDate:item.sourceUpdatedAt};
 const normalized=normalizeMetRecord(raw,editorial,'2026-09-10');
 assert.equal(normalized.creator,'Designer: Attributed to Example maker and workshop; British');
 assert.equal(normalized.dimensions,'Not specified in the API record');
 assert.equal(normalized.date,'ca. 1810');
 for(const patch of [{isPublicDomain:false},{isPublicDomain:undefined},{isPublicDomain:'true'},{primaryImageSmall:''},{primaryImageSmall:'https://images.metmuseum.org.evil.test/a.jpg'},{primaryImageSmall:museumObjects[0].imageUrl},{objectURL:museumObjects[0].recordUrl},{objectURL:'https://www.metmuseum.org/art/collection/search/192043'}])assert.throws(()=>normalizeMetRecord({...raw,...patch},editorial,'2026-09-10'));
 for(const patch of [{providerId:999},{id:'cma-90487'},{provider:'Cleveland Museum of Art'}])assert.equal(MuseumObjectSchema.safeParse({...item,...patch}).success,false);
 const ids=museumObjects.map(item=>item.id);
 assert.equal(MuseumSelectionSchema.safeParse(ids.slice(0,6)).success,true);
 assert.equal(MuseumSelectionSchema.safeParse(ids).success,false);
 assert.deepEqual(validateWorld({...initialWorld,museumObjectIds:['cma-142026',item.id]}).museumObjectIds,['cma-142026',item.id]);
});
