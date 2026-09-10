import type {StudentState,World} from './world';
import {museumObjects} from './museums';

/** Only call with the authenticated learner's stored state, never client-supplied work. */
export function learnerReasoningContext(student:StudentState,world:World,scenario:boolean,worldVersion:number){
 const latest=student.turns.at(-1);
 return {
  viewedScenario:scenario,currentWorldVersion:worldVersion,
  collectedEvidence:student.evidence.filter(id=>world.evidence.some(e=>e.id===id)),
  latestArgument:latest?{claim:latest.claim,scenario:latest.scenario,worldVersion:latest.worldVersion,
   matchesViewedContext:latest.scenario===scenario&&latest.worldVersion===worldVersion,
   feedback:{items:latest.result.items,nextQuestion:latest.result.nextQuestion}}:null,
  museumNotes:(student.museumNotes??[]).slice(-3).flatMap(note=>{
   const object=museumObjects.find(item=>item.id===note.objectId);
   return object?[{observation:note.observation,interpretation:note.interpretation,question:note.question,
    object:{id:object.id,title:object.title,date:object.date,medium:object.medium,provider:object.provider,limits:object.limits,connection:object.connection}}]:[];
  }),
 };
}
export const learnerReasoningInstructions=' When the learner asks for help rethinking their answer, use their latest saved argument and provisional feedback to ask one targeted question about a weak inference, missing support, or alternative explanation. Do not repeat a generic lesson introduction. If the saved answer has a different scenario or world version, explicitly distinguish that earlier context from the current scene; do not treat it as a current submission. If there is no saved answer, invite the learner to state an initial idea. Museum observations and interpretations are learner-written claims, not verified facts or source-card evidence. Use supplied museum metadata only within its stated limits. Do not reveal a model answer or award points.';
