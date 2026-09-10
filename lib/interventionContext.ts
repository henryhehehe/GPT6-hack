import {supportsSceneChanges,sceneCapabilities} from './sceneIntervention';
import {learnerReasoningContext} from './learnerContext';
import {z} from 'zod';
import {validateWorld,type ClassroomState,type StudentState,type Intervention} from './world';

export type InterventionLearner={id:string;name:string;revision:number};
export type InterventionPreview={patch:Intervention;baseVersion:number;classroomId:string;learner:InterventionLearner;audience:'classroom'};
export const interventionInstructions=' Create one class-wide teaching intervention: a concise teaching-prop description and one guiding question. Use the selected learner’s saved work to identify a useful reasoning challenge. Never include a learner’s name or quote their answer in the shared prop. Do not reveal a complete answer or award points. Follow the lesson subject and mode: literature needs textual analysis and alternative readings; documentary inquiry needs source evaluation; counterfactual history needs conditional causal reasoning. Use only supplied evidence and bounded context, never later chapters or unprovided corroboration. Distinguish the learner’s submission scenario and version from the current class scenario. Incorporate teacher corrections.';

/** Resolve ownership and saved learner work in one database snapshot, before quota or model use. */
export async function loadInterventionContext(database:Pick<D1Database,'prepare'>,request:{id:unknown;token:unknown;studentId:unknown;instruction:unknown;sceneEdit?:unknown}) {
  const id=z.string().uuid().parse(request.id);
  const studentId=z.string().uuid('Choose a learner from this classroom.').parse(request.studentId);
  const instruction=z.string().trim().min(5).max(1200).parse(request.instruction);
  const row=await database.prepare(`SELECT c.teacher_token, c.world, c.state, c.version,
    s.id AS student_id, s.state AS student_state, s.revision AS student_revision
    FROM classrooms c LEFT JOIN students s ON s.class_id = c.id AND s.id = ? WHERE c.id = ?`)
    .bind(studentId,id).first<{teacher_token:string;world:string;state:string;version:number;student_id:string|null;student_state:string|null;student_revision:number|null}>();
  if(!row||request.token!==row.teacher_token)throw new Error('Only the teacher can direct this classroom.');
  if(!row.student_id||!row.student_state||row.student_revision===null)throw new Error('Choose a learner from this classroom.');
  const student=JSON.parse(row.student_state) as StudentState;
  const state=JSON.parse(row.state) as ClassroomState;
  const world=validateWorld(JSON.parse(row.world)),sceneEdit=z.boolean().optional().parse(request.sceneEdit)??false;
  if(sceneEdit&&!supportsSceneChanges(world))throw new Error('Choose a lesson before editing the scene.');
  return {classroomId:id,baseVersion:row.version,audience:'classroom' as const,
    learner:{id:row.student_id,name:student.name,revision:row.student_revision},
    input:{instruction,world,scenario:state.scenario,sceneEdit,sceneCapabilities:sceneCapabilities(world),museumNotes:learnerReasoningContext(student,world,state.scenario,row.version).museumNotes,
      student:{prediction:student.prediction,archiveReflection:student.archiveReflection,zone:student.zone,evidence:student.evidence,turns:student.turns.slice(-3).map(turn=>({id:turn.id,citations:turn.citations,revisesTurnId:turn.revisesTurnId,reflection:turn.reflection,revisionChanged:turn.revisionChanged,hintId:turn.hintId,claim:turn.claim,scenario:turn.scenario,worldVersion:turn.worldVersion,at:turn.at,feedback:{items:turn.result.items,nextQuestion:turn.result.nextQuestion}}))}}};
}
