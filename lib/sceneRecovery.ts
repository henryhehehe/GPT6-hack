import {validateWorld,type World,type ClassroomState,type Intervention} from './world';

/** One server-owned checkpoint, restricted to fields the scene director owns. */
export type SceneUndo={
 id:string;
 intervention:string;
 nodes:Pick<World['nodes'][number],'id'|'activity'|'consequence'|'mechanism'>[];
 appearance:World['sceneAppearance'];
 scenario:boolean;
 hint:Intervention|null;
};
export function captureSceneUndo(world:World,state:ClassroomState,id:string):SceneUndo{
 return {id,intervention:world.intervention,nodes:world.nodes.map(({id,activity,consequence,mechanism})=>({id,activity,consequence,mechanism})),appearance:world.sceneAppearance,scenario:state.scenario,hint:state.hint};
}
export function recoverScene(world:World,state:ClassroomState,operation:'undo'|'reset-atmosphere',requestId:string){
 const next={...state,sceneRevision:requestId};
 if(operation==='reset-atmosphere'){
  if(!world.sceneAppearance)return null;
  next.sceneUndo=captureSceneUndo(world,state,requestId);
  const restored={...world};delete restored.sceneAppearance;
  return {world:validateWorld(restored),state:next};
 }
 const undo=state.sceneUndo;
 if(!undo)throw new Error('There is no scene edit to undo.');
 const restored={...world,intervention:undo.intervention,nodes:world.nodes.map(node=>({...node,...undo.nodes.find(previous=>previous.id===node.id)})),sceneAppearance:undo.appearance};
 if(!undo.appearance)delete restored.sceneAppearance;
 next.scenario=undo.scenario;
 // A subsequent teaching prompt belongs to the teacher's newer work.
 if(state.hint?.id===undo.id)next.hint=undo.hint;
 delete next.sceneUndo;
 return {world:validateWorld(restored),state:next};
}
