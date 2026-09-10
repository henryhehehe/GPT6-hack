import type {World} from './world';
import {museumObjects,type MuseumObject} from './museums';
export function relatedMuseumTopic(world:World):MuseumObject['topic']|undefined{
 const id=world.lessonPack?.curriculum?.worldId;
 if(id==='alexandria'||(!world.lessonPack&&world.evidence.some(card=>card.id==='strabo'&&card.kind==='source')))return 'Alexandria';
 const topics:Record<string,MuseumObject['topic']>={
  'odyssey-ix':'The Odyssey','austen-letter':'Jane Austen',macbeth:'Macbeth',tempest:'The Tempest',
  declaration:'Declaration of Independence',frankenstein:'Frankenstein','christmas-carol':'Charles Dickens',
  'douglass-literacy':'Frederick Douglass','seneca-falls':'Seneca Falls',
 };
 return id?topics[id]:undefined;
}
export function comparisonObjects(ids:string[]){
 if(ids.length!==2||new Set(ids).size!==2)return [];
 const objects=ids.map(id=>museumObjects.find(item=>item.id===id));
 return objects.every((item):item is MuseumObject=>!!item)?objects:[];
}
export const alexandriaCoinPair=['cma-142026','cma-97411'];
