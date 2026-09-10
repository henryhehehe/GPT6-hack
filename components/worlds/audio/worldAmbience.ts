export type AmbienceProfile={id:string;label:string;wind:number;windTone:number;surf:number;wavePeriod:number;birds:'garden'|'shore'|null;birdInterval:number;paper:number;hearth:number};
const room={wind:.045,windTone:230,surf:0,wavePeriod:9,birds:null,birdInterval:22,paper:.035,hearth:0} satisfies Omit<AmbienceProfile,'id'|'label'>;
export const AMBIENCE_PROFILES:Record<string,AmbienceProfile>={
 alexandria:{...room,id:'alexandria',label:'Harbor water & distant seabirds',wind:.12,windTone:480,surf:.20,wavePeriod:5.8,birds:'shore',birdInterval:19,paper:0},
 'odyssey-ix':{...room,id:'odyssey-ix',label:'Gentle surf & sea air',wind:.10,windTone:420,surf:.28,wavePeriod:9.5,birds:'shore',birdInterval:27,paper:0},
 'austen-letter':{...room,id:'austen-letter',label:'Garden breeze & birdsong',wind:.12,windTone:850,birds:'garden',birdInterval:12,paper:0},
 macbeth:{...room,id:'macbeth',label:'Low wind across the heath',wind:.30,windTone:340,paper:0},
 frankenstein:{...room,id:'frankenstein',label:'Quiet study & soft hearth',wind:.035,windTone:180,hearth:.09,paper:.025},
 'christmas-carol':{...room,id:'christmas-carol',label:'Winter air & a distant hearth',wind:.19,windTone:620,hearth:.045,paper:0},
 tempest:{...room,id:'tempest',label:'Rolling surf & island wind',wind:.26,windTone:700,surf:.38,wavePeriod:6.7,birds:'shore',birdInterval:35,paper:0},
 declaration:{...room,id:'declaration',label:'Paper rustle & a quiet workshop',wind:.055,paper:.045},
 'douglass-literacy':{...room,id:'douglass-literacy',label:'Courtyard breeze & distant birds',wind:.085,windTone:540,birds:'garden',birdInterval:25,paper:.02},
 'seneca-falls':{...room,id:'seneca-falls',label:'Still room & turning pages',wind:.03,windTone:170,paper:.032},
};
export function ambienceProfile(id:string):AmbienceProfile{return Object.hasOwn(AMBIENCE_PROFILES,id)?AMBIENCE_PROFILES[id]:{...room,id:'custom',label:'Quiet reading ambience'};}
export function safeVolume(value:number){return Number.isFinite(value)?Math.max(0,Math.min(1,value)):.35;}

/** Original filtered noise and small synthesized events; no recordings or asset requests. */
export function createAmbienceLayer(context:BaseAudioContext,profile:AmbienceProfile,destination:AudioNode){
 const nodes=new Set<AudioNode>(),sources=new Set<AudioScheduledSourceNode>();let disposed=false,seed=91;
 for(const c of profile.id)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function own<T extends AudioNode>(node:T){nodes.add(node);return node;}
 function start<T extends AudioScheduledSourceNode>(source:T,time=context.currentTime,stop?:number){
  sources.add(source);source.onended=()=>{source.disconnect();sources.delete(source);nodes.delete(source);};source.start(time);if(stop!==undefined)source.stop(stop);return source;
 }
 const mix=own(context.createGain());mix.gain.value=0;mix.connect(destination);
 const noise=context.createBuffer(2,Math.ceil(context.sampleRate*12),context.sampleRate);
 for(let channel=0;channel<2;channel++){
  const data=noise.getChannelData(channel);let low=0;
  for(let i=0;i<data.length;i++){low=(low+(random()*2-1)*.045)/1.045;data[i]=low*3.2;}
  // Blend the last 100ms into the beginning for a quiet, continuous buffer seam.
  const seam=Math.floor(context.sampleRate*.1),drift=data[0]-data[data.length-1];
  for(let i=0;i<seam;i++)data[data.length-seam+i]+=drift*i/(seam-1);
 }
 function noiseVoice(level:number,frequency:number,rate=1){
  const source=own(context.createBufferSource()),filter=own(context.createBiquadFilter()),gain=own(context.createGain());
  source.buffer=noise;source.loop=true;source.playbackRate.value=rate;filter.type='lowpass';filter.frequency.value=frequency;filter.Q.value=.45;gain.gain.value=level;
  source.connect(filter);filter.connect(gain);gain.connect(mix);start(source);return gain;
 }
 function swell(gain:GainNode,depth:number,period:number){
  const lfo=own(context.createOscillator()),amount=own(context.createGain());lfo.frequency.value=1/period;amount.gain.value=depth;lfo.connect(amount);amount.connect(gain.gain);start(lfo);
 }
 const wind=noiseVoice(profile.wind,profile.windTone,.82);swell(wind,profile.wind*.28,13.2);swell(wind,profile.wind*.13,5.3);
 if(profile.surf){const surf=noiseVoice(profile.surf,1600,1.19);swell(surf,profile.surf*.72,profile.wavePeriod);}
 if(profile.hearth)noiseVoice(profile.hearth,980,1.5);
 let nextBird=context.currentTime+3+random()*4,nextPaper=context.currentTime+6+random()*5,nextCrackle=context.currentTime+.4;
 function transient(time:number,duration:number,level:number,frequency:number){
  const source=own(context.createBufferSource()),filter=own(context.createBiquadFilter()),gain=own(context.createGain());
  source.buffer=noise;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.55;
  gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(level,time+duration*.2);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
  source.connect(filter);filter.connect(gain);gain.connect(mix);start(source,time,time+duration+.02);
  source.onended=()=>{for(const node of [source,filter,gain]){node.disconnect();nodes.delete(node);}sources.delete(source);};
 }
 function bird(time:number){
  const shore=profile.birds==='shore',count=shore?2:3+Math.floor(random()*2),pan=own(context.createStereoPanner());pan.pan.value=(random()-.5)*1.2;pan.connect(mix);
  let remaining=count;
  for(let i=0;i<count;i++){
   const at=time+i*(shore?.37:.19),duration=shore?.42:.13,base=shore?750+random()*130:1750+random()*800;
   const oscillator=own(context.createOscillator()),gain=own(context.createGain());oscillator.type='sine';
   oscillator.frequency.setValueAtTime(base,at);oscillator.frequency.exponentialRampToValueAtTime(base*(shore?1.35:1.55),at+duration*.3);oscillator.frequency.exponentialRampToValueAtTime(base*.85,at+duration);
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(shore?.022:.033,at+.035);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
   oscillator.connect(gain);gain.connect(pan);start(oscillator,at,at+duration+.03);
   oscillator.onended=()=>{for(const node of [oscillator,gain]){node.disconnect();nodes.delete(node);}sources.delete(oscillator);if(--remaining===0){pan.disconnect();nodes.delete(pan);}};
  }
 }
 return {
  gain:mix.gain,
  schedule(until:number){
   if(disposed)return;
   const limit=Math.min(until,context.currentTime+30);
   // Skip stale events after suspension or a background timer delay.
   nextBird=Math.max(nextBird,context.currentTime+.05);nextPaper=Math.max(nextPaper,context.currentTime+.05);nextCrackle=Math.max(nextCrackle,context.currentTime+.05);
   while(profile.birds&&nextBird<limit){bird(nextBird);nextBird+=profile.birdInterval*(.8+random()*.5);}
   while(profile.paper&&nextPaper<limit){transient(nextPaper,.4+random()*.35,profile.paper,1600);nextPaper+=15+random()*16;}
   while(profile.hearth&&nextCrackle<limit){transient(nextCrackle,.025+random()*.07,profile.hearth*.3,1400+random()*1600);nextCrackle+=.4+random()*2;}
  },
  dispose(){if(disposed)return;disposed=true;for(const source of sources){source.onended=null;try{source.stop();}catch{/* Already ended. */}}for(const node of nodes)node.disconnect();sources.clear();nodes.clear();},
 };
}

export function createWorldAmbience(context:AudioContext,id:string,volume=.35){
 const master=context.createGain(),limiter=context.createDynamicsCompressor();master.gain.value=safeVolume(volume)*.65;
 limiter.threshold.value=-14;limiter.knee.value=12;limiter.ratio.value=4;limiter.attack.value=.015;limiter.release.value=.3;master.connect(limiter);limiter.connect(context.destination);
 let disposed=false,current=createAmbienceLayer(context,ambienceProfile(id),master);const retiring=new Map<ReturnType<typeof setTimeout>,ReturnType<typeof createAmbienceLayer>>();
 current.gain.setTargetAtTime(1,context.currentTime,.45);
 const timer=setInterval(()=>{if(context.state==='running')current.schedule(context.currentTime+4);},1000);current.schedule(context.currentTime+4);
 return {
  setVolume(value:number){if(!disposed)master.gain.setTargetAtTime(safeVolume(value)*.65,context.currentTime,.12);},
  setWorld(next:string){
   if(disposed)return;
   if(retiring.size>=2){const [timeout,layer]=retiring.entries().next().value!;clearTimeout(timeout);layer.dispose();retiring.delete(timeout);}
   const old=current;old.gain.cancelScheduledValues(context.currentTime);old.gain.setTargetAtTime(0,context.currentTime,.25);
   current=createAmbienceLayer(context,ambienceProfile(next),master);current.gain.setTargetAtTime(1,context.currentTime,.35);current.schedule(context.currentTime+4);
   const timeout=setTimeout(()=>{old.dispose();retiring.delete(timeout);},1800);retiring.set(timeout,old);
  },
  dispose(){if(disposed)return;disposed=true;clearInterval(timer);current.dispose();for(const [timeout,layer] of retiring){clearTimeout(timeout);layer.dispose();}retiring.clear();master.disconnect();limiter.disconnect();},
 };
}
