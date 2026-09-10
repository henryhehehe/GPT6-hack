'use client';

import {useMemo,useSyncExternalStore} from 'react';
import {scenarioSelectionKey} from '@/lib/scenarioSelection';
import {createScenarioSelectionStore} from '@/lib/scenarioSelectionStore';

export function useScenarioSelection({classroomId,studentId,studentView,teacherScenario,allowed,teacherSceneId}:{classroomId?:string;studentId?:string;studentView:boolean;teacherScenario?:boolean;allowed:boolean;teacherSceneId?:string}){
 const key=studentView&&classroomId&&studentId?scenarioSelectionKey(classroomId,studentId,teacherSceneId):null;
 const store=useMemo(()=>createScenarioSelectionStore({key,teacherScenario,allowed},()=>localStorage),[key,teacherScenario,allowed]);
 const scenario=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getServerSnapshot);
 return {scenario,setScenario:store.setScenario};
}
