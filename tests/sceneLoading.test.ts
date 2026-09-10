import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setImmediate} from 'node:timers/promises';
import {trackSceneLoading} from '../components/worlds/scene/sceneLoading';

test('scene loader waits for every model and a frame that displays the result',async()=>{
 let first!:()=>void,second!:()=>void,ready=0;
 const tracker=trackSceneLoading([new Promise<void>(resolve=>{first=resolve;}),new Promise<void>(resolve=>{second=resolve;})],()=>ready++);
 tracker.rendered();assert.equal(ready,0);
 first();await setImmediate();tracker.rendered();assert.equal(ready,0);
 second();await setImmediate();assert.equal(ready,0);
 tracker.rendered();assert.equal(ready,1);tracker.rendered();assert.equal(ready,1);
});
test('failed models settle so a rendered fallback does not leave the widget spinning',async()=>{
 let ready=false;
 const tracker=trackSceneLoading([Promise.reject(new Error('Model unavailable')),Promise.resolve()],()=>{ready=true;});
 await setImmediate();tracker.rendered();assert.equal(ready,true);
});
test('late work from an unmounted scene cannot dismiss the next scene loader',async()=>{
 let finish!:()=>void,oldReady=0,newReady=0;
 const old=trackSceneLoading([new Promise<void>(resolve=>{finish=resolve;})],()=>oldReady++);
 old.dispose();const current=trackSceneLoading([],()=>newReady++);
 finish();await setImmediate();old.rendered();assert.equal(oldReady,0);assert.equal(newReady,0);
 current.rendered();assert.equal(newReady,1);
});

test('the first usable frame is announced once while slower details continue loading',async()=>{
 let finish!:()=>void;const stages:string[]=[];
 const tracker=trackSceneLoading([new Promise<void>(resolve=>{finish=resolve;})],()=>stages.push('ready'),()=>stages.push('first frame'));
 tracker.rendered();tracker.rendered();assert.deepEqual(stages,['first frame']);
 finish();await setImmediate();assert.deepEqual(stages,['first frame']);
 tracker.rendered();assert.deepEqual(stages,['first frame','ready']);
});
test('cached scenes skip waiting after their first frame, and disposed scenes announce nothing',async()=>{
 const stages:string[]=[];
 const tracker=trackSceneLoading([],()=>stages.push('ready'),()=>stages.push('frame'));
 await setImmediate();tracker.rendered();assert.deepEqual(stages,['frame','ready']);
 const disposed=trackSceneLoading([],()=>stages.push('late ready'),()=>stages.push('late frame'));
 disposed.dispose();await setImmediate();disposed.rendered();assert.deepEqual(stages,['frame','ready']);
});
