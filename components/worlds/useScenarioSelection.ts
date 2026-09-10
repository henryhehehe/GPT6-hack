'use client';

import {useCallback,useEffect,useState} from 'react';
import {readScenarioSelection,saveScenarioSelection,scenarioSelectionKey} from '@/lib/scenarioSelection';

export function useScenarioSelection({classroomId,studentId,studentView,teacherScenario,allowed}:{classroomId?:string;studentId?:string;studentView:boolean;teacherScenario?:boolean;allowed:boolean}){
 const key=studentView&&classroomId&&studentId?scenarioSelectionKey(classroomId,studentId):null;
 const [scenario,setValue]=useState(false);

 useEffect(()=>{
  if(teacherScenario===undefined)return;
  let restored=teacherScenario;
  if(key){try{restored=readScenarioSelection(localStorage,key,teacherScenario);}catch{}}
  restored=allowed&&restored;
  setValue(restored);
  // Record teacher changes too, so an older choice cannot reappear later.
  if(key){try{saveScenarioSelection(localStorage,key,restored,teacherScenario);}catch{}}
 },[key,teacherScenario,allowed,studentView]);

 const setScenario=useCallback((value:boolean)=>{
  const next=allowed&&value;
  setValue(next);
  if(key&&teacherScenario!==undefined){try{saveScenarioSelection(localStorage,key,next,teacherScenario);}catch{}}
 },[key,teacherScenario,allowed]);

 return {scenario:allowed&&scenario,setScenario};
}
