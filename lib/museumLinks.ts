import {getMuseumInvestigation} from './museumInvestigations';
import {getMuseumBook} from './museumBooks';
import {MuseumObjectIdSchema,museumObjects} from './museums';

export function museumObjectPath(id:string,compareId?:string){
 const object= MuseumObjectIdSchema.parse(id);
 const query=new URLSearchParams({object});
 if(compareId!==undefined){
  const compare=MuseumObjectIdSchema.parse(compareId);
  if(object===compare)throw new Error('Choose two different museum objects.');
  query.set('compare',compare);
 }
 return `/collections?${query.toString()}`;
}

// Share only reviewed public IDs. Repeated, partial and invented selections are ignored.
export function museumStudyFromQuery(query:{study?:unknown;object?:unknown;compare?:unknown;book?:unknown}){
 if(query.study!==undefined){
  const plan=getMuseumInvestigation(query.study);
 return plan?{objectIds:[...plan.objectIds],topic:plan.topic,studyId:plan.id}:undefined;
 }
 if(query.object===undefined&&query.compare===undefined){
  const book=getMuseumBook(query.book);
  return book?{objectIds:[],topic:book.topic,studyId:undefined}:undefined;
 }
 const object=MuseumObjectIdSchema.safeParse(query.object);
 if(!object.success)return undefined;
 const ids=[object.data];
 if(query.compare!==undefined){
  const compare=MuseumObjectIdSchema.safeParse(query.compare);
  if(!compare.success||compare.data===object.data)return undefined;
  ids.push(compare.data);
 }
 const items=ids.map(id=>museumObjects.find(item=>item.id===id)!);
 return {objectIds:ids,topic:items.every(item=>item.topic===items[0].topic)?items[0].topic:undefined,studyId:undefined};
}
