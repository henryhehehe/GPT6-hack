"use client";

import {useState} from "react";
import {ArrowRight,ArrowUpRight,Landmark,Ship,Feather} from "lucide-react";
import LessonCatalog from "@/components/worlds/LessonCatalog";
import catalog from "@/lib/curriculum/catalog.json";
import "./landing.css";

const featured = [
 {id:"alexandria",title:"Alexandria",subject:"History",question:"What keeps a city of knowledge alive?",Icon:Landmark,tone:"harbor"},
 {id:"odyssey-ix",title:"The Odyssey",subject:"Literature · Homer",question:"When does cleverness become a risk?",Icon:Ship,tone:"sea"},
 {id:"austen-letter",title:"Pride and Prejudice",subject:"Literature · Jane Austen",question:"What makes us reconsider a judgment?",Icon:Feather,tone:"letter"},
];

export default function LandingPage(){
 const [catalogOpen,setCatalogOpen]=useState(false);
 const [catalogWorld,setCatalogWorld]=useState("alexandria");
 const lessonCount=catalog.worlds.reduce((count,world)=>count+world.lessons.length,0);
 function browse(id:string){setCatalogWorld(id);setCatalogOpen(true);}
 return <div className="landing">
  <a className="lp-skip" href="#main">Skip to content</a>
  <header className="home-header">
   <a href="/" className="home-brand" aria-label="Counterfactual Worlds home">Counterfactual <span>Worlds</span></a>
   <a href="/studio">Teacher studio <ArrowRight size={16}/></a>
  </header>
  <main id="main" className="home-main">
   <section className="home-intro" aria-labelledby="home-title">
    <div className="home-intro-copy">
     <h1 id="home-title">Investigate history<br/><em>and literature.</em></h1>
     <p>Choose a reading, explore its world, and build an argument from the evidence.</p>
     <div className="home-actions"><a className="home-primary" href="/try">Step into Alexandria <ArrowUpRight size={18}/></a><button onClick={()=>setCatalogOpen(true)}>Browse lessons</button></div>
    </div>
    <div className="home-feature">
     <a href="/try" className="home-world-preview" aria-label="Step into Alexandria: preview the student world">
      <img src="/landing/alexandria-student-view.webp" width={1200} height={594} alt="Recorded student view of Alexandria: walkable library steps, classical columns, and characters to talk to" fetchPriority="high"/>
      <span className="home-preview-caption"><span><strong>Inside Alexandria</strong><small>Recorded student view</small></span><span className="home-preview-arrow"><ArrowUpRight size={19}/></span></span>
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
    <div className="home-lesson-list">{featured.map(world=><button key={world.id} className="home-lesson-row" onClick={()=>browse(world.id)} aria-label={"Browse "+world.title+" lessons"}><span className={"home-subject-icon home-subject-"+world.tone} aria-hidden="true"><world.Icon size={23} strokeWidth={1.35}/></span><span className="home-lesson-name"><strong>{world.title}</strong><small>{world.subject}</small></span><span className="home-lesson-question">{world.question}</span><ArrowRight size={18}/></button>)}</div>
   </section>
  </main>
  <footer className="home-footer"><p>Source-based lessons. Teacher-guided discussion.</p><details><summary>About this prototype</summary><div><p>Students explore interpretive settings and receive AI-assisted feedback. Illustrations and simulated dialogue are distinct from source evidence. Teachers review prepared lessons and feedback before using them.</p><p>This is an early research prototype. Learning gains have not been established. School-wide rostering, data retention and deletion controls, and accessibility and device validation still need work. Test access on a student device before a lesson; an invitation does not grant access to private hosting.</p></div></details></footer>
  <LessonCatalog key={catalogWorld} initialWorldId={catalogWorld} open={catalogOpen} onClose={()=>setCatalogOpen(false)} onChoose={lessonId=>{window.location.assign("/studio?lesson="+encodeURIComponent(lessonId));}}/>
 </div>;
}
