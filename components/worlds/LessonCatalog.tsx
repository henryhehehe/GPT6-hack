'use client';

import {useMemo,useState} from 'react';
import {BookOpen,ArrowRight,Search,Clock3} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import catalog from '@/lib/curriculum/catalog.json';
import './lesson-catalog.css';

type Props={open:boolean;initialWorldId?:string;onClose:()=>void;onChoose:(lessonId:string)=>void};

export default function LessonCatalog({open,initialWorldId,onClose,onChoose}:Props){
 const [query,setQuery]=useState('');
 const [subject,setSubject]=useState('all');
 const [selected,setSelected]=useState(initialWorldId??catalog.worlds[0].id);
 const matches=useMemo(()=>catalog.worlds.filter(world=>(subject==='all'||world.subject===subject)&&
  `${world.title} ${world.lessons.map(l=>`${l.title} ${l.inquiry}`).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())),[query,subject]);
 const world=matches.find(w=>w.id===selected)??matches[0];
 return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}>
  <DialogContent className="lesson-catalog">
   <header className="catalog-header"><span className="eyebrow">THE WORLD LIBRARY</span><DialogTitle>Choose a world. Find your question.</DialogTitle><DialogDescription>10 worlds, 30 investigations. Review a prepared source packet before opening a new classroom.</DialogDescription></header>
   <div className="catalog-filters"><label className="catalog-search"><Search size={18}/><span className="sr-only">Search worlds and lessons</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search a book, world, or question"/></label><div role="group" aria-label="Subject">{[['all','All subjects'],['history','History'],['literature','Literature']].map(([value,label])=><button key={value} aria-pressed={subject===value} onClick={()=>setSubject(value)}>{label}</button>)}</div></div>
   <div className="catalog-layout"><nav className="catalog-worlds" aria-label="Worlds"><p className="catalog-count" role="status">{matches.length} {matches.length===1?'world':'worlds'}</p>{matches.map(w=><button key={w.id} aria-pressed={world?.id===w.id} onClick={()=>setSelected(w.id)}><span className="catalog-number">{String(w.priority).padStart(2,'0')}</span><span><small>{w.subject}</small><strong>{w.title}</strong><span>3 lessons</span></span></button>)}</nav>
   {world?<section className="catalog-detail" aria-label={world.title}><span className="eyebrow">{world.subject} · SOURCE-GROUNDED INVESTIGATION</span><h2>{world.title}</h2><p className="catalog-boundary">{world.readingBoundary}</p><ol className="catalog-stops">{world.places.map(place=><li key={place}><BookOpen size={15}/>{place}</li>)}</ol><p className="catalog-setting">{world.id==='alexandria'?'Alexandria setting':'Symbolic learning setting'} · Read, explore, and defend an interpretation.</p>
    <div className="catalog-lessons">{world.lessons.map((lesson,i)=><article key={lesson.id}><div className="catalog-lesson-meta"><span>LESSON {i+1}</span><span><Clock3 size={14}/> About {lesson.durationMinutes} min</span></div><h3>{lesson.title}</h3><p className="catalog-inquiry">{lesson.inquiry}</p><details><summary>Teaching sequence & source boundary</summary><dl><dt>Assigned selection</dt><dd>{lesson.sourceRange}</dd><dt>Evidence activity</dt><dd>{lesson.evidenceActivity}</dd><dt>Teacher challenge</dt><dd>{lesson.teacherChallenge}</dd><dt>Revision</dt><dd>{lesson.revisionTask}</dd></dl></details><button className="primary-button" onClick={()=>onChoose(lesson.id)}>Review this lesson <ArrowRight size={16}/></button></article>)}</div>
    <details className="catalog-source"><summary>Edition, source, and teaching notes</summary><p>{world.source.edition}</p><a href={world.source.url} target="_blank" rel="noreferrer">Open original source (may include later material)</a><ul>{world.cautions.map(note=><li key={note}>{note}</li>)}</ul><p>Prepared lessons require your source review. Timing is a planning estimate; these lessons have not been classroom-tested.</p></details>
   </section>:<div className="catalog-empty"><BookOpen size={32}/><h2>No matching worlds</h2><p>Try a book title, a different question, or all subjects.</p><button className="text-button" onClick={()=>{setQuery('');setSubject('all');}}>Show all worlds</button></div>}</div>
  </DialogContent>
 </Dialog>;
}
