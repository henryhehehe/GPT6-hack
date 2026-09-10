'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Volume2,VolumeX} from 'lucide-react';
import {ambienceProfile,createWorldAmbience,safeVolume} from './audio/worldAmbience';
import './world-ambience.css';

/** Sound is opt-in for this visit. Only the volume preference is stored. */
export default function WorldAmbience({worldId}:{worldId:string}){
 const [enabled,setEnabled]=useState(false),[volume,setVolume]=useState(.35),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const context=useRef<AudioContext|null>(null),engine=useRef<ReturnType<typeof createWorldAmbience>|null>(null),wanted=useRef(false),alive=useRef(true),volumeId=useId();
 const profile=ambienceProfile(worldId);
 useEffect(()=>{try{const stored=localStorage.getItem('world-ambience-volume');if(stored!==null)setVolume(safeVolume(Number(stored)));}catch{/* Storage is optional. */}},[]);
 useEffect(()=>{engine.current?.setWorld(worldId);},[worldId]);
 useEffect(()=>{engine.current?.setVolume(volume);},[volume]);
 useEffect(()=>{
  alive.current=true;
  const visibility=()=>{const audio=context.current;if(!audio)return;if(document.hidden){void audio.suspend().catch(()=>{});}else if(wanted.current){void audio.resume().catch(()=>{if(alive.current){wanted.current=false;setEnabled(false);setError('Select sound to listen again.');}});}};
  document.addEventListener('visibilitychange',visibility);
  return()=>{alive.current=false;wanted.current=false;document.removeEventListener('visibilitychange',visibility);engine.current?.dispose();engine.current=null;const audio=context.current;context.current=null;if(audio&&audio.state!=='closed')void audio.close().catch(()=>{});};
 },[]);
 async function toggle(){
  if(busy)return;setBusy(true);setError('');
  try{
   if(wanted.current){wanted.current=false;await context.current?.suspend();if(alive.current)setEnabled(false);return;}
   if(!context.current){
    if(typeof window.AudioContext==='undefined')throw new Error('unsupported');
    context.current=new AudioContext();engine.current=createWorldAmbience(context.current,worldId,volume);
   }
   await context.current.resume();
   if(!alive.current)return;
   if(context.current.state!=='running')throw new Error('suspended');
   wanted.current=true;setEnabled(true);
  }catch{wanted.current=false;if(!engine.current&&context.current){const audio=context.current;context.current=null;void audio.close().catch(()=>{});}if(alive.current){setEnabled(false);setError('Sound is unavailable in this browser.');}}
  finally{if(alive.current)setBusy(false);}
 }
 return <div className="world-ambience" role="group" aria-label="Scene ambience">
  <button type="button" onClick={()=>void toggle()} aria-pressed={enabled} disabled={busy} title={profile.label}>
   {enabled?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>{enabled?'Sound on':'Sound off'}</span>
  </button>
  {enabled&&<div className="world-ambience-level"><span>{profile.label}</span><label htmlFor={volumeId}>Volume <output>{Math.round(volume*100)}%</output></label><input id={volumeId} aria-label="Ambient sound volume" type="range" min="0" max="100" step="1" value={Math.round(volume*100)} onChange={event=>{const next=Number(event.target.value)/100;setVolume(next);try{localStorage.setItem('world-ambience-volume',String(next));}catch{/* Storage is optional. */}}}/></div>}
  {error&&<p role="status">{error}</p>}
 </div>;
}
