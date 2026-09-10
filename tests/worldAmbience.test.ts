import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD_THEMES} from '../lib/worldThemes';
import {AMBIENCE_PROFILES,ambienceProfile,safeVolume,createAmbienceLayer,createWorldAmbience} from '../components/worlds/audio/worldAmbience';

test('every reading world has a distinct bounded ambience and safe unknown fallback',()=>{
 for(const id of Object.keys(WORLD_THEMES)){
  const p=ambienceProfile(id);assert.equal(p.id,id);
  for(const gain of [p.wind,p.surf,p.hearth,p.paper])assert.ok(gain>=0&&gain<=.4);
  assert.ok(p.birdInterval>=12);assert.ok(p.wavePeriod>=5);
 }
 assert.equal(new Set(Object.values(AMBIENCE_PROFILES).map(p=>p.label)).size,10);
 for(const id of ['unlisted','constructor','__proto__'])assert.equal(ambienceProfile(id).id,'custom');
 assert.equal(safeVolume(NaN),.35);assert.equal(safeVolume(Infinity),.35);assert.equal(safeVolume(-1),0);assert.equal(safeVolume(4),1);
});

function audioFixture(){
 const nodes:{disconnected:number;stopped:number;onended:(()=>void)|null;[key:string]:any}[]=[];
 const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
 function node(){const n={disconnected:0,stopped:0,onended:null,connect(){},disconnect(){n.disconnected++;},start(){},stop(){n.stopped++;},gain:param(),frequency:param(),Q:param(),playbackRate:param(),pan:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()};nodes.push(n);return n;}
 const ctx={currentTime:0,sampleRate:100,state:'running',destination:node(),createGain:node,createBufferSource:node,createBiquadFilter:node,createOscillator:node,createStereoPanner:node,createDynamicsCompressor:node,createBuffer:(channels:number,length:number)=>{const arrays=Array.from({length:channels},()=>new Float32Array(length));return {getChannelData:(channel:number)=>arrays[channel]};}} as unknown as AudioContext;
 return {ctx,nodes};
}

test('layer event scheduling is bounded and disposal releases sources and connections exactly once',()=>{
 const {ctx,nodes}=audioFixture(),layer=createAmbienceLayer(ctx,ambienceProfile('frankenstein'),ctx.destination);
 layer.schedule(1e8);assert.ok(nodes.length<250,'lookahead must remain bounded');
 layer.dispose();const disconnected=nodes.map(n=>n.disconnected),count=nodes.length;
 assert.ok(nodes.slice(1).every(n=>n.disconnected===1));assert.ok(nodes.some(n=>n.stopped===1));
 layer.dispose();layer.schedule(1e8);assert.equal(nodes.length,count);assert.deepEqual(nodes.map(n=>n.disconnected),disconnected);
});

test('rapid world changes and unmount clean up retiring layers and all timers',t=>{
 t.mock.timers.enable({apis:['setInterval','setTimeout']});
 const {ctx,nodes}=audioFixture(),engine=createWorldAmbience(ctx,'austen-letter');
 engine.setWorld('tempest');engine.setWorld('frankenstein');engine.setVolume(8);
 t.mock.timers.tick(2000);engine.dispose();const count=nodes.length,disconnected=nodes.map(n=>n.disconnected);
 assert.ok(nodes.slice(1).every(n=>n.disconnected===1));
 t.mock.timers.tick(60000);engine.dispose();engine.setWorld('macbeth');assert.equal(nodes.length,count);assert.deepEqual(nodes.map(n=>n.disconnected),disconnected);
});
