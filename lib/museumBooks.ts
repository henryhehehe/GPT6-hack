import catalog from './curriculum/catalog.json';
import type {MuseumObject} from './museums';

// Keep saved topic IDs stable while presenting the books readers know.
const books:{worldId:string;topic:MuseumObject['topic'];title:string;investigation:string}[]=[
 {worldId:'odyssey-ix',topic:'The Odyssey',title:'The Odyssey',investigation:'odyssey-cave-retellings'},
 {worldId:'austen-letter',topic:'Jane Austen',title:'Pride and Prejudice',investigation:'austen-letter-evidence'},
 {worldId:'macbeth',topic:'Macbeth',title:'Macbeth',investigation:'macbeth-prediction-choice'},
 {worldId:'frankenstein',topic:'Frankenstein',title:'Frankenstein',investigation:'frankenstein-imagined-destination'},
 {worldId:'christmas-carol',topic:'Charles Dickens',title:'A Christmas Carol',investigation:'dickens-work-and-attention'},
 {worldId:'tempest',topic:'The Tempest',title:'The Tempest',investigation:'tempest-service-voices'},
 {worldId:'douglass-literacy',topic:'Frederick Douglass',title:'Narrative of the Life of Frederick Douglass',investigation:'douglass-authorship'},
 {worldId:'alexandria',topic:'Alexandria',title:'Geography · Alexandria',investigation:'royal-power'},
 {worldId:'declaration',topic:'Declaration of Independence',title:'Declaration of Independence',investigation:'declaration-paper'},
 {worldId:'seneca-falls',topic:'Seneca Falls',title:'Declaration of Sentiments',investigation:'seneca-learning'},
];
export const museumBooks=books.map(book=>{
 const world=catalog.worlds.find(world=>world.id===book.worldId);
 if(!world)throw new Error(`Missing curriculum book: ${book.worldId}`);
 return {...book,sourceTitle:world.source.title,lessons:world.lessons.map(lesson=>({id:lesson.id,title:lesson.title,range:lesson.sourceRange,inquiry:lesson.inquiry}))};
});
export function getMuseumBook(id:unknown){return typeof id==='string'?museumBooks.find(book=>book.worldId===id):undefined;}
export function museumBookForTopic(topic:string){return museumBooks.find(book=>book.topic===topic);}
export function museumBookTitle(topic:string){return museumBookForTopic(topic)?.title??topic;}
export function museumObjectMatchesQuery(item:MuseumObject,query:string){
 const book=museumBookForTopic(item.topic);
 return `${item.title} ${item.culture} ${item.date} ${item.medium} ${item.accession} ${item.provider} ${item.creator} ${item.topic} ${item.connection} ${item.prompt} ${book?.title??''} ${book?.sourceTitle??''}`.toLowerCase().includes(query.toLowerCase().trim());
}
