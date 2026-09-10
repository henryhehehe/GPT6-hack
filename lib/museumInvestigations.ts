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
 ],readingBridge:'Return to your assigned Odyssey passage. The Sirens encounter is outside Book IX. Calypso is recalled in Book IX, including the saved introduction context, but the painting interprets the release episode in Book V. Neither object illustrates the Cyclops episode; keep later reception distinct from the assigned text.'},
 {id:'austen-first-impressions',topic:'Jane Austen',title:'What do appearances leave out?',summary:'A dress and a teapot invite questions about first impressions and social encounters.',objectIds:['met-90487','met-192043'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe a detail of the dress and a detail of the teapot. What is visible, and what did you learn only by reading their museum records?'},
  {title:'Compare',minutes:3,prompt:'Imagine the questions an observer might ask about clothing and hospitality. Which assumptions about a person could these objects tempt you to make without enough evidence?'},
  {title:'Test the limit',minutes:3,prompt:'Neither record identifies an Austen character or Austen herself as an owner. What can the objects help you ask, and what can only the reading help you answer?'},
 ],readingBridge:'Return to the assigned Pride and Prejudice passage. Find a judgment about someone, then identify the textual evidence that supports or challenges it. Keep the museum comparison distinct from that evidence.'},
 {id:'macbeth-performance',topic:'Macbeth',title:'Who shapes our judgment of a character?',summary:'A letter-reading scene and a theatrical satire reveal the choices behind a performance.',objectIds:['met-707811','met-713071'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe the letter and pose in the Lady Macbeth print. Then find a detail that reveals how the country performance is being made.'},
  {title:'Compare',minutes:3,prompt:'Compare how each print directs attention: toward one character’s response, or toward performers and an audience. How might those choices change a viewer’s judgment?'},
  {title:'Test the limit',minutes:3,prompt:'Read the dates and the satire’s description. Neither print records Shakespeare’s original staging. Identify one interpretation you must test against the play’s words.'},
 ],readingBridge:'Return to the assigned Macbeth passage. Identify a speaker’s attempt to influence another person, quote the relevant words, and explain what the print adds or leaves out. Act 1, Scene 5 is the letter scene; do not treat it as an illustration of every assigned scene.'},
 {id:'tempest-perspectives',topic:'The Tempest',title:'Who gets the viewer’s sympathy?',summary:'A portrait-like Miranda and a grouped encounter frame the island’s story differently.',objectIds:['met-431240','met-407873'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe Miranda’s pose in the single-figure print and the distances between figures in the grouped scene. Separate visible detail from names supplied by the records.'},
  {title:'Compare',minutes:3,prompt:'Which figure does each composition invite you to identify with? Identify a visual choice behind that response, including how Caliban is framed.'},
  {title:'Test the limit',minutes:3,prompt:'These are later interpretations. Explain why an artist’s threatening or sympathetic portrayal cannot settle the competing claims made by the play’s speakers.'},
 ],readingBridge:'Return to your assigned Tempest passage. If it contains competing accounts of the island’s past, compare their speakers and words. If your packet contains the opening storm instead, examine the language of authority there. Keep the later artists’ judgments separate and do not require a passage absent from your packet.'},
 {id:'declaration-paper',topic:'Declaration of Independence',title:'How does an argument become a public memory?',summary:'A writing tool and a retrospective print connect making an argument with remembering it.',objectIds:['met-4435','cma-100166'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe a practical feature of the inkstand and the arrangement of people and papers in the etching.'},
  {title:'Compare',minutes:3,prompt:'One object supports writing; the other represents a political event. What can each help you ask about the work and presentation of public argument?'},
  {title:'Test the limit',minutes:3,prompt:'The inkstand’s date and place are broad, and the etching is from 1823. Explain why neither establishes the signing date of a particular person or equal access to political rights.'},
 ],readingBridge:'Return to the Declaration’s assigned claims and grievances. Distinguish the argument it makes from evidence about its drafting, signing, or later implementation; the two museum objects do not supply all three.'},
 {id:'frankenstein-models',topic:'Frankenstein',title:'Does understanding a system mean controlling it?',summary:'An orrery and an anatomical drawing invite a distinction between representing and creating.',objectIds:['met-785846','met-384401'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe a feature of the orrery’s arrangement and a choice of line or shading in the anatomical drawing.'},
  {title:'Compare',minutes:3,prompt:'What does a mechanical model or a drawing make easier to study? Name something each representation leaves out of the system it depicts.'},
  {title:'Test the limit',minutes:3,prompt:'Neither object is documented as Shelley’s or Victor’s. Explain why representing bodily form or celestial motion does not demonstrate an ability to create life.'},
 ],readingBridge:'Return to the assigned Frankenstein passage. Identify a claim about knowledge, ambition, or responsibility and test it with the speaker’s words. Use the objects as a comparison, not as proof that the fictional experiment could work.'},
 {id:'dickens-second-life',topic:'Charles Dickens',title:'What does a second look reveal?',summary:'A preserved dress and a later clothes shop shift attention from appearance to reuse.',objectIds:['met-108064','cma-325422'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe one feature of the dress and one visible detail of the shop photograph without inventing a wearer’s or shopper’s biography.'},
  {title:'Compare',minutes:3,prompt:'How does looking at a garment in isolation differ from looking at clothes among people and goods? Which initial assumptions become less secure?'},
  {title:'Test the limit',minutes:3,prompt:'Read the dates: the dress is 1840–45 and the photograph is 1877. Neither links the two objects to one owner or documents a scene from A Christmas Carol.'},
 ],readingBridge:'Return to the assigned A Christmas Carol passage. Find a moment when a person is judged or reconsidered, and explain the textual detail that changes the judgment. The later photograph is a comparison, not a picture of Dickens’s fictional event.'},
 {id:'douglass-public-image',topic:'Frederick Douglass',title:'What can a portrait say that testimony cannot?',summary:'Two portraits of Douglass invite close comparison with his account of learning to read.',objectIds:['met-282066','met-286586'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe a detail of pose, clothing, or framing in each portrait. Read the records to separate observation from the sitter’s identification.'},
  {title:'Compare',minutes:3,prompt:'What changes between the ca. 1855 daguerreotype and the 1876 photograph? What questions about audience and public identity do the differences invite?'},
  {title:'Test the limit',minutes:3,prompt:'Both portraits postdate the 1845 Narrative. Name a claim about Douglass’s literacy experience or thoughts that neither portrait can establish.'},
 ],readingBridge:'Return to Douglass’s assigned account of literacy. Explain what his first-person testimony contributes that a portrait cannot, using a specific passage rather than treating expression as evidence of thought.'},
 {id:'seneca-learning',topic:'Seneca Falls',title:'What does one learner’s work prove?',summary:'Two named makers’ samplers make skill visible while leaving broader opportunity open to investigation.',objectIds:['met-14094','met-19997'],minutes:8,steps:[
  {title:'Observe',minutes:2,prompt:'Describe lettering, repeated stitches, or imagery in each sampler. Identify each maker and date from the museum records.'},
  {title:'Compare',minutes:3,prompt:'Compare what Mary Ann Stauffer’s 1830 work and Mariah Boil’s 1844 work reveal about practiced skills. Keep their different individual and community contexts visible.'},
  {title:'Test the limit',minutes:3,prompt:'Explain why evidence that these makers learned particular skills neither proves nor disproves a national claim about access to higher education.'},
 ],readingBridge:'If your assigned Declaration of Sentiments packet includes the education grievance, state its scope and identify an additional source that could test it. Otherwise, examine a rights claim or demand in the supplied passage and explain what further evidence about education would be needed. Neither sampler documents participation at the convention.'},
{
 "id": "odyssey-cave-retellings",
 "topic": "The Odyssey",
 "title": "Whose Cyclops story are we seeing?",
 "summary": "A later Ovid illustration and an ancient cup invite a careful return to Homer.",
 "objectIds": [
  "met-401167",
  "cma-108536"
 ],
 "minutes": 8,
 "steps": [
  {
   "title": "Observe",
   "minutes": 2,
   "prompt": "Describe the etching and the ram on the cup. Use the titles to distinguish depicted violence from a scene of sacrifice."
  },
  {
   "title": "Compare",
   "minutes": 3,
   "prompt": "Read both dates and titles. The etching names Ovid and Achaemides; the cup depicts a warrior sacrificing a ram. What would go wrong if both were labelled illustrations of Homer’s escape?"
  },
  {
   "title": "Test the limit",
   "minutes": 3,
   "prompt": "Choose one claim about the cave encounter and find its support in the assigned reading. Identify a detail in either object that cannot establish that claim."
  }
 ],
 "readingBridge": "Return to the assigned Odyssey Book IX packet: the cave encounter, assumed name, escape, or shouted identity. Ovid’s later telling and the unrelated sacrificial cup are comparisons, not substitutes for Homer’s narrative. The etching depicts violence."
},{
 "id": "austen-letter-evidence",
 "topic": "Jane Austen",
 "title": "What makes a letter convincing?",
 "summary": "A writing table and an inkstand separate the act of writing from the truth of a claim.",
 "objectIds": [
  "met-197364",
  "met-191270"
 ],
 "minutes": 8,
 "steps": [
  {
   "title": "Observe",
   "minutes": 2,
   "prompt": "Describe one practical feature of each object. Separate what is visible from the function supplied by its title."
  },
  {
   "title": "Compare",
   "minutes": 3,
   "prompt": "What do these objects help you imagine about composing a letter? What do they leave unknown about the writer, recipient, and claims?"
  },
  {
   "title": "Test the limit",
   "minutes": 3,
   "prompt": "Choose a judgment in the assigned passage and identify how it is supported or revised. Explain why the objects cannot authenticate the letter or settle its truth."
  }
 ],
 "readingBridge": "Use the assigned Pride and Prejudice packet only: Chapter 35, Chapter 36, or the bounded comparison of both. The Chapter 36 lesson contains no direct Chapter 35 letter passage; do not require absent quotations or later corroborating events."
},{
 "id": "macbeth-prediction-choice",
 "topic": "Macbeth",
 "title": "Does a prediction explain a choice?",
 "summary": "The Weird Sisters and a portrait of an actor as Macbeth frame influence and responsibility.",
 "objectIds": [
  "met-395662",
  "met-742432"
 ],
 "minutes": 8,
 "steps": [
  {
   "title": "Observe",
   "minutes": 2,
   "prompt": "Compare gesture, expression, and framing. Read the records to distinguish a representation of the witches from a portrait of Edmund Kean acting Macbeth."
  },
  {
   "title": "Compare",
   "minutes": 3,
   "prompt": "Which image directs attention to an outside influence, and which to a character’s response? Describe an artistic choice without treating expression as direct access to thought."
  },
  {
   "title": "Test the limit",
   "minutes": 3,
   "prompt": "Test a claim about responsibility using the assigned lines. Could either later image establish that Macbeth had no choice? State what the passage actually supports."
  }
 ],
 "readingBridge": "Use the assigned Macbeth packet: Act 1, Scene 3 for hearing the prophecy, or Scenes 5 and 7 for persuasion and deliberation. The 1785 print explicitly names Scene 3; the 1814 actor portrait is not assigned to a particular line. Do not require an unassigned scene."
},{
 "id": "frankenstein-imagined-destination",
 "topic": "Frankenstein",
 "title": "What does ambition put outside the frame?",
 "summary": "A late photograph of icebergs and a mountain painting offer two bounded views of nature.",
 "objectIds": [
  "met-285979",
  "met-367715"
 ],
 "minutes": 8,
 "steps": [
  {
   "title": "Observe",
   "minutes": 2,
   "prompt": "Describe how each image frames its landscape. Identify what lies inside the view and what you cannot see beyond it."
  },
  {
   "title": "Compare",
   "minutes": 3,
   "prompt": "Compare what a photograph and a painting might encourage a viewer to imagine. Distinguish an impression of scale or remoteness from evidence about an expedition."
  },
  {
   "title": "Test the limit",
   "minutes": 3,
   "prompt": "In Walton’s assigned letters, find an ambition and a qualification or uncertainty. Explain what neither landscape can establish about his fictional journey."
  }
 ],
 "readingBridge": "Return to Frankenstein Letters I–II in the Ambition in a letter lesson. These 1874 and 1893–95 images postdate the novel; neither depicts Walton’s voyage or illustrates the Chapters 4–5 creation packet. Other Frankenstein lessons can use the separate anatomical-model investigation."
},{
 "id": "dickens-work-and-attention",
 "topic": "Charles Dickens",
 "title": "Who becomes visible when we look again?",
 "summary": "Two Covent Garden photographs redirect attention toward people at work.",
 "objectIds": [
  "cma-325424",
  "cma-325420"
 ],
 "minutes": 8,
 "steps": [
  {
   "title": "Observe",
   "minutes": 2,
   "prompt": "Describe where people, goods, and the surrounding setting appear in each photograph. Avoid assigning an income or biography from clothing."
  },
  {
   "title": "Compare",
   "minutes": 3,
   "prompt": "Compare the kinds of work named by the records and how each photograph directs attention. What might a quick first glance overlook?"
  },
  {
   "title": "Test the limit",
   "minutes": 3,
   "prompt": "Choose a narrative detail from the assigned passage that makes a person visible or invites reconsideration. Explain why a later photograph cannot prove a fictional character’s circumstances."
  }
 ],
 "readingBridge": "Return to the assigned A Christmas Carol packet: Stave 1, Staves 1–2, or Stave 3 with its selected Stave 1 comparison. Both photographs date to 1877 and are contextual comparisons, not images of the Cratchits or of events in the 1843 novella."
},{
 "id": "tempest-service-voices",
 "topic": "The Tempest",
 "title": "Can a composition settle a competing claim?",
 "summary": "Two later illustrations arrange Prospero, Miranda, Caliban, Ferdinand, and Ariel differently.",
 "objectIds": [
  "met-364060",
  "met-407873"
 ],
 "minutes": 8,
 "steps": [
  {
   "title": "Observe",
   "minutes": 2,
   "prompt": "Read the titles to identify the figures named in each illustration. Describe a distance, pose, or grouping before interpreting a relationship."
  },
  {
   "title": "Compare",
   "minutes": 3,
   "prompt": "Compare who is present or absent. How could that choice direct sympathy or attention toward one character’s account?"
  },
  {
   "title": "Test the limit",
   "minutes": 3,
   "prompt": "Choose one statement about service, freedom, or the island’s past from the assigned dialogue. Separate the speaker’s claim from the artist’s later interpretation."
  }
 ],
 "readingBridge": "Use the approved Tempest Act 1, Scene 2 exchanges for the A story with a listener or Competing claims lessons. The Selous title does not prove a shared conversation among all three named figures. For the Act 1, Scene 1 storm lesson, return to the storm passage rather than requiring these later exchanges."
},{
 "id": "douglass-authorship",
 "topic": "Frederick Douglass",
 "title": "What makes an author visible?",
 "summary": "An attributed Wheatley portrait and a later Douglass portrait prompt questions about voice and evidence.",
 "objectIds": [
  "met-396463",
  "met-282066"
 ],
 "minutes": 8,
 "steps": [
  {
   "title": "Observe",
   "minutes": 2,
   "prompt": "Describe a detail of pose or framing in each portrait. Read the records to distinguish the sitters and preserve the attribution of the Wheatley print."
  },
  {
   "title": "Compare",
   "minutes": 3,
   "prompt": "What might an author’s portrait communicate to a reader? Identify something about learning or composing a text that neither image can establish."
  },
  {
   "title": "Test the limit",
   "minutes": 3,
   "prompt": "Use a specific moment from Douglass’s account of literacy to distinguish his testimony from your interpretation of a portrait. Keep Wheatley’s separate life outside claims about his experience."
  }
 ],
 "readingBridge": "Return to the assigned Narrative of the Life of Frederick Douglass, Chapters VI–VII. The 1773 Wheatley portrait is attributed to Scipio Moorhead; the Douglass daguerreotype is ca. 1855. Neither documents the childhood literacy episodes, and Wheatley’s experience cannot stand in for Douglass’s first-person account."
},
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
