import {museumStudyFromQuery} from '@/lib/museumLinks';
import {museumObjects,museumProviders} from '@/lib/museums';
import PageHeader from "@/components/PageHeader";
import MuseumCollection from '@/components/museums/MuseumCollection';
export const metadata={title:'Museum objects | Counterfactual Worlds',description:'Explore a curated collection of open-access museum objects, with original records, attribution, and questions for classroom discussion.'};
export default async function Collections({searchParams}:{searchParams:Promise<{study?:string|string[];object?:string|string[];compare?:string|string[]}>}){
 const selection=museumStudyFromQuery(await searchParams);
 return <main className="museum-page"><PageHeader/><section className="museum-page-heading"><p>THE OBJECT COLLECTION / 001</p><h1>The past,<br/><span>in the details.</span></h1><p>{museumObjects.length} objects. {museumProviders.length} museums. Thousands of questions.<br/>Start with what you can see.</p><a className="museum-try-link" href="/try?museum=1">Try the museum demo →</a></section><MuseumCollection key={selection?.objectIds.join(':')??'browse'} initialStudy={selection?.studyId} initialTopic={selection?.topic} initialObjectIds={selection?.objectIds}/><footer>To add objects to a classroom, open <a href="/studio">Teacher studio</a> and choose Museum objects in your lesson.</footer></main>;
}
