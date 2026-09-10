'use client';
import {useRef,useState} from 'react';
import {Minus,Plus} from 'lucide-react';
import type {MuseumObject} from '@/lib/museums';
export default function MuseumImageInspector({item}:{item:MuseumObject}){
 const [zoom,setZoom]=useState(1),[failed,setFailed]=useState(false);
 const frame=useRef<HTMLDivElement>(null);
 function reset(){setZoom(1);frame.current?.scrollTo({top:0,left:0});}
 return <div className="museum-image-inspector"><div className="museum-zoom-controls"><span>Look closely</span><button aria-label={`Zoom out: ${item.title}`} disabled={zoom===1||failed} onClick={()=>setZoom(Math.max(1,zoom-.5))}><Minus size={16}/></button><output aria-live="polite">{Math.round(zoom*100)}%</output><button aria-label={`Zoom in: ${item.title}`} disabled={zoom===3||failed} onClick={()=>setZoom(Math.min(3,zoom+.5))}><Plus size={16}/></button><button className="museum-zoom-reset" onClick={reset} disabled={zoom===1} aria-label={`Reset photograph: ${item.title}`}>Reset</button></div><div ref={frame} className="museum-zoom-image" tabIndex={0} role="region" aria-label={`Photograph of ${item.title}; scroll to explore when enlarged`}>{failed?<p>Photograph unavailable. <a href={item.recordUrl} target="_blank" rel="noreferrer">Open the museum record</a>. The record and discussion questions remain available below.</p>:<img src={item.imageUrl} alt={item.title} referrerPolicy="no-referrer" onError={()=>setFailed(true)} style={{width:`${zoom*100}%`,height:`${zoom*100}%`,maxWidth:'none'}}/>}</div><p className="museum-photo-caption">{item.provider} · {item.accession} · <a href={item.licenseUrl} target="_blank" rel="noreferrer">CC0</a><br/>{zoom>1?'Scroll across the photograph to inspect its details.':'Use + to enlarge the museum photograph.'}</p></div>;
}
