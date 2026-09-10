import type {Intervention,ClassroomState} from './world';
/** Only the published teaching prompt crosses into learner views and model context. */
export function sharedHint(hint:Intervention|null){
 if(!hint)return null;
 const {id,title,text,question,zone,kind}=hint;
 return {id,title,text,question,zone,kind};
}
export function sharedClassroomState(state:ClassroomState){
 return {scenario:state.scenario,run:state.run,sceneRevision:state.sceneRevision,hint:sharedHint(state.hint)};
}
