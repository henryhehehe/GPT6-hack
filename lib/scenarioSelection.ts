type ReadStorage=Pick<Storage,'getItem'>;
type WriteStorage=Pick<Storage,'setItem'>;

export function scenarioSelectionKey(classroomId:string,studentId:string,sceneRevision?:string){
 return `cw-scenario:${classroomId}:${studentId}${sceneRevision?`:${sceneRevision}`:''}`;
}

// A new teacher scenario takes precedence over the learner's remembered view.
export function readScenarioSelection(storage:ReadStorage,key:string,teacherScenario:boolean):boolean{
 try{
  const saved=JSON.parse(storage.getItem(key)??'null');
  if(saved&&typeof saved.scenario==='boolean'&&saved.teacherScenario===teacherScenario)return saved.scenario;
 }catch{/* Missing, damaged, or blocked storage uses the classroom's scenario. */}
 return teacherScenario;
}

export function saveScenarioSelection(storage:WriteStorage,key:string,scenario:boolean,teacherScenario:boolean){
 try{storage.setItem(key,JSON.stringify({scenario,teacherScenario}));}catch{/* Exploration still works without browser storage. */}
}
