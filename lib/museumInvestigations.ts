import {comparisonObjects} from './museumStudy';
import {MuseumSelectionSchema,type MuseumObject} from './museums';

export type MuseumInvestigationPlan={
 id:string;topic:MuseumObject['topic'];title:string;summary:string;
 objectIds:[string,string];minutes:number;
 steps:{title:string;minutes:number;prompt:string}[];
 readingBridge:string;
};
// Editorial prompts, not museum quotations. All objects remain contextual supplements.
export const museumInvestigations:MuseumInvestigationPlan[]=[
 {id:'royal-power',topic:'Alexandria',title:'How does power make itself visible?',summary:'Two coins. Two portraits. Look for the choices behind a public image.',objectIds:['cma-142026','cma-97411'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe one visible detail on each coin. Compare portraits, lettering, and symbols before assigning them a meaning.'},
  {title:'Compare',minutes:3,prompt:'Read the dates and materials. What might the portraits communicate about authority? Separate what the museum record establishes from your interpretation.'},
  {title:'Test the limit',minutes:3,prompt:'Could either coin establish how a scholarly community was funded? Name one additional source you would need.'},
 ],readingBridge:'In the Alexandria lesson, read Strabo’s account of the Mouseion. Distinguish what his account says about support from what the coins show about royal imagery.'},
 {id:'odyssey-retold',topic:'The Odyssey',title:'What changes when a story is retold?',summary:'An ancient flask and a later painting open different windows onto myth.',objectIds:['cma-109558','cma-156420'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe the flask’s form and one visible action in the painting. Keep visual description separate from the identities supplied by their titles.'},
  {title:'Compare',minutes:3,prompt:'Compare their dates, materials, and object types. How might a perfume flask and a painting invite different encounters with a story?'},
  {title:'Test the limit',minutes:3,prompt:'Neither object is an eyewitness account of Odysseus’s travels. What would you need to read before claiming that either illustrates a particular passage?'},
 ],readingBridge:'Return to your assigned Odyssey passage. The Sirens and Calypso belong outside Book IX; use this pair to discuss reception and the limits of a visual analogy, not as illustrations of the Cyclops episode.'},
 {id:'austen-first-impressions',topic:'Jane Austen',title:'What do appearances leave out?',summary:'A dress and a teapot invite questions about first impressions and social encounters.',objectIds:['met-90487','met-192043'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe a detail of the dress and a detail of the teapot. What is visible, and what did you learn only by reading their museum records?'},
  {title:'Compare',minutes:3,prompt:'Imagine the questions an observer might ask about clothing and hospitality. Which assumptions about a person could these objects tempt you to make without enough evidence?'},
  {title:'Test the limit',minutes:3,prompt:'Neither record identifies an Austen character or Austen herself as an owner. What can the objects help you ask, and what can only the reading help you answer?'},
 ],readingBridge:'Return to the assigned Pride and Prejudice passage. Find a judgment about someone, then identify the textual evidence that supports or challenges it. Keep the museum comparison distinct from that evidence.'},
];
export function getMuseumInvestigation(id:unknown){return typeof id==='string'?museumInvestigations.find(plan=>plan.id===id):undefined;}
export function investigationForObjects(items:MuseumObject[]){
 if(items.length!==2||items[0].id===items[1].id)return undefined;
 return museumInvestigations.find(plan=>plan.objectIds.every(id=>items.some(item=>item.id===id)));
}
export function investigationObjects(plan:MuseumInvestigationPlan){return comparisonObjects(plan.objectIds);}
export function suggestedMuseumInvestigations(topic?:MuseumObject['topic'],selected?:string[]){
 return museumInvestigations.filter(plan=>(!topic||plan.topic===topic)&&(selected===undefined||plan.objectIds.every(id=>selected.includes(id)))&&investigationObjects(plan).length===2);
}
// Validate the complete union before saving so a full classroom never receives half a pair.
export function addMuseumInvestigation(current:unknown,id:unknown){
 const selected=MuseumSelectionSchema.parse(current??[]),plan=getMuseumInvestigation(id);
 if(!plan)throw new Error('Choose a reviewed museum investigation.');
 const missing=plan.objectIds.filter(objectId=>!selected.includes(objectId));
 const overflow=selected.length+missing.length-6;
 if(overflow>0)throw new Error(`Remove ${overflow} ${overflow===1?'object':'objects'} from this lesson to make room for the complete investigation.`);
 return MuseumSelectionSchema.parse([...selected,...missing]);
}
export function museumInvestigationPath(id:string){
 const plan=getMuseumInvestigation(id);
 if(!plan)throw new Error('Choose a reviewed museum investigation.');
 return `/collections?study=${encodeURIComponent(plan.id)}`;
}
