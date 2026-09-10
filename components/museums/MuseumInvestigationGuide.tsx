'use client';
import {useState} from 'react';
import {type MuseumInvestigationPlan,museumInvestigationPath} from '@/lib/museumInvestigations';
import {museumWorksheetHtml} from '@/lib/museumWorksheet';
import {downloadHtml} from '@/lib/download';
export default function MuseumInvestigationGuide({plan,onBack}:{plan:MuseumInvestigationPlan;onBack:()=>void}){
 const [notice,setNotice]=useState('');
 return <section className="museum-guided-study" aria-label="Guided object discussion"><div className="museum-guide-heading"><span>{plan.topic} · {plan.minutes}-minute discussion</span><h3>{plan.title}</h3><p>{plan.summary}</p></div><ol>{plan.steps.map(step=><li key={step.title}><div><strong>{step.title}</strong><span>{step.minutes} min</span></div><p>{step.prompt}</p></li>)}</ol><div className="museum-guide-reading"><strong>Return to the reading</strong><p>{plan.readingBridge}</p></div><div className="museum-guide-actions"><button onClick={()=>{try{downloadHtml(`museum-investigation-${plan.id}.html`,museumWorksheetHtml(plan.id));setNotice('Worksheet downloaded. Open it in your browser to print or save a PDF.');}catch{setNotice('The worksheet could not be downloaded. Please try again.');}}}>Download discussion worksheet</button><a href={museumInvestigationPath(plan.id)} target="_blank" rel="noreferrer">Open shareable link ↗</a><button className="museum-guide-back" onClick={onBack}>Back to objects ↑</button></div><p role="status" className="museum-guide-status">{notice}</p><small>Questions written for this app. No answers are generated or submitted.</small></section>;
}
