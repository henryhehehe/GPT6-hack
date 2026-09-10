import WorldAtlas from '@/components/worlds/WorldAtlas';
import catalog from '@/lib/curriculum/catalog.json';
import {prepareCatalogLesson} from '@/lib/curriculum';
export default async function Worlds({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams,lessonId=typeof query.lesson==='string'?query.lesson:undefined;
 return <WorldAtlas initialLessonId={lessonId} entries={catalog.worlds.map(entry=>({id:entry.id,title:entry.title,subject:entry.subject,lessons:entry.lessons.map(lesson=>({id:lesson.id,world:prepareCatalogLesson(lesson.id).world!}))}))}/>;
}
