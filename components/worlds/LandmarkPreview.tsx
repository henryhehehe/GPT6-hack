'use client';
import { useState } from 'react';
import { X, Pin } from 'lucide-react';
import { landmarkReferences, type LandmarkId } from '@/lib/landmarkReferences';

export default function LandmarkPreview({id,pinned,onPin,onClose,onEnter,onLeave}:{id:LandmarkId;pinned:boolean;onPin:()=>void;onClose:()=>void;onEnter:()=>void;onLeave:()=>void}){
 const reference=landmarkReferences[id];
 const [failed,setFailed]=useState(false),[loaded,setLoaded]=useState(false);
 return <aside id="landmark-reference" className="landmark-reference" aria-label={`${reference.title} reference`} onPointerEnter={onEnter} onPointerLeave={onLeave} onFocus={onEnter} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))onLeave();}}>
  <header><span className="eyebrow">{reference.photo?'REAL PLACE / PHOTOGRAPH':'ARCHITECTURAL CONTEXT'}</span><button aria-label="Close landmark reference" onClick={onClose}><X size={16}/></button></header>
  <h3>{reference.title}</h3>
  {reference.photo&&!failed&&<>{!loaded&&<p role="status">Loading photograph…</p>}<img src={reference.photo.url} alt={reference.photo.alt} width={640} height={480} referrerPolicy="no-referrer" onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}/></>}
  {failed&&<p className="landmark-image-error">The photograph could not load. Its description and source are available below.</p>}
  <p>{reference.description}</p>
  {reference.photo&&<p className="landmark-credit">Photo: {reference.photo.creator} · {reference.photo.date}. <a href={reference.photo.source} target="_blank" rel="noreferrer">Wikimedia Commons</a> · <a href={reference.photo.licenseUrl} target="_blank" rel="noreferrer">{reference.photo.license}</a>. Unmodified image.</p>}
  <p className="landmark-credit"><a href={reference.contextUrl} target="_blank" rel="noreferrer">Historical context</a> · The 3D building is an interpretive reconstruction.</p>
  <button className="landmark-pin" onClick={onPin} aria-pressed={pinned}><Pin size={14}/>{pinned?'Pinned · move freely':'Keep this open'}</button>
 </aside>;
}
