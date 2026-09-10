"use client";

import PageHeader from "@/components/PageHeader";
import {useState} from "react";
import {ArrowRight,ArrowUpRight} from "lucide-react";
import LessonCatalog from "@/components/worlds/LessonCatalog";
import catalog from "@/lib/curriculum/catalog.json";
import "./landing.css";

const featured = [
 {id:"alexandria",title:"Alexandria",subject:"History",question:"What keeps a city of knowledge alive?"},
 {id:"odyssey-ix",title:"The Odyssey",subject:"Literature · Homer",question:"When does cleverness become a risk?"},
 {id:"austen-letter",title:"Pride and Prejudice",subject:"Literature · Jane Austen",question:"What makes us reconsider a judgment?"},
];

export default function LandingPage(){
 const [catalogOpen,setCatalogOpen]=useState(false);
 const [catalogWorld,setCatalogWorld]=useState("alexandria");
 const lessonCount=catalog.worlds.reduce((count,world)=>count+world.lessons.length,0);
 function browse(id:string){setCatalogWorld(id);setCatalogOpen(true);}
 return <div className="landing">
  <a className="lp-skip" href="#main">Skip to content</a>
  <PageHeader />
  <main id="main" className="home-main">
   <section className="home-intro" aria-labelledby="home-title">
    <div className="home-intro-copy">
     <h1 id="home-title">Investigate<br/>history &<br/><span>literature.</span></h1>
     <p>Choose a reading, explore its world, and build an argument from the evidence.</p>
     <div className="home-actions"><a className="home-primary" href="/try">Step into Alexandria <ArrowUpRight size={18}/></a><button onClick={()=>setCatalogOpen(true)}>Browse lessons</button></div>
    </div>
    <div className="home-feature">
     <a href="/try" className="home-world-preview" aria-label="Step into Alexandria: preview the student world">
      <img
       src="/landing/alexandria-library-current-1920.webp"
       srcSet="/landing/alexandria-library-current-960.webp 960w, /landing/alexandria-library-current-1920.webp 1920w"
       sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 900px) calc((100vw - 84px) / 2), (max-width: 1256px) calc((100vw - 160px) / 2), 548px"
       width={1920} height={1080}
       alt="Current student view of Alexandria, with detailed library columns, tiled rooftops, palm trees, and characters gathered on the library steps"
       fetchPriority="high"
      />
      <span className="home-preview-caption"><span><strong>Inside Alexandria</strong><small>Captured in the current student world</small></span><span className="home-preview-arrow"><ArrowUpRight size={19}/></span></span>
     </a>
    </div>
    <aside className="home-teacher-note" aria-label="For teachers">
     <h2>For your classroom</h2>
     <p>Review the sources and teaching guide, then invite your students. Follow their evidence and written arguments as they work.</p>
     <a href="/studio">Prepare a lesson <ArrowRight size={15}/></a>
    </aside>
   </section>
   <section className="home-lessons" aria-labelledby="lessons-title">
    <div className="home-section-heading"><h2 id="lessons-title">Start with a reading</h2><button onClick={()=>setCatalogOpen(true)}>All {lessonCount} lessons <ArrowRight size={15}/></button></div>
    <div className="home-lesson-list">{featured.map((world,index)=><button key={world.id} className="home-lesson-row" onClick={()=>browse(world.id)} aria-label={"Browse "+world.title+" lessons"}><span className="home-lesson-index" aria-hidden="true">{String(index+1).padStart(2,"0")}</span><span className="home-lesson-name"><strong>{world.title}</strong><small>{world.subject}</small></span><span className="home-lesson-question">{world.question}</span><ArrowUpRight size={22}/></button>)}</div>
   </section>
   <a className="home-museum-link" href="/collections"><span>From the museum collection</span><strong>Real objects. New questions.</strong><ArrowUpRight size={22}/></a>
  </main>
  <footer className="home-footer"><p>Source-based lessons. Teacher-guided discussion.</p><details><summary>About this prototype</summary><div><p>Students explore interpretive settings and receive AI-assisted feedback. Illustrations and simulated dialogue are distinct from source evidence. Teachers review prepared lessons and feedback before using them.</p><p>This is an early research prototype. Learning gains have not been established. School-wide rostering, data retention and deletion controls, and accessibility and device validation still need work. Test access on a student device before a lesson; an invitation does not grant access to private hosting.</p></div></details></footer>
  <LessonCatalog key={catalogWorld} initialWorldId={catalogWorld} open={catalogOpen} onClose={()=>setCatalogOpen(false)} onChoose={lessonId=>{window.location.assign("/studio?lesson="+encodeURIComponent(lessonId));}}/>
 </div>;
}
