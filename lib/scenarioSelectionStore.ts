import {readScenarioSelection,saveScenarioSelection} from './scenarioSelection';

type ScenarioStorage=Pick<Storage,'getItem'|'setItem'>;
type Context={key:string|null;teacherScenario?:boolean;allowed:boolean};

/** A subscription commits a teacher change; an abandoned render never writes it. */
export function createScenarioSelectionStore(context:Context,storage:()=>ScenarioStorage){
 let value:boolean|undefined;
 const listeners=new Set<()=>void>();
 function read(){
  if(value!==undefined)return value;
  let restored=context.teacherScenario??false;
  if(context.key&&context.teacherScenario!==undefined){try{restored=readScenarioSelection(storage(),context.key,context.teacherScenario);}catch{/* Exploration works without storage. */}}
  value=context.allowed&&restored;return value;
 }
 function persist(){
  if(context.key&&context.teacherScenario!==undefined){try{saveScenarioSelection(storage(),context.key,read(),context.teacherScenario);}catch{/* Keep the selection in memory. */}}
 }
 return {
  getSnapshot:read,
  getServerSnapshot:()=>context.allowed&&(context.teacherScenario??false),
  subscribe(notify:()=>void){listeners.add(notify);persist();return()=>{listeners.delete(notify);};},
  setScenario(next:boolean){const before=read();value=context.allowed&&next;persist();if(before!==value)for(const notify of listeners)notify();},
 };
}
