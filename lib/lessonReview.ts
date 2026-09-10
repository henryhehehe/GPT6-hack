import type {LessonDraft} from './lessonBuilder';

/** Approval belongs to the exact reading and world currently shown for review. */
export function lessonReviewKey(draft:Pick<LessonDraft,'id'|'title'|'range'|'world'|'imageStatus'>|null):string|null{
 if(!draft?.world||draft.imageStatus==='generating')return null;
 return JSON.stringify([draft.id,draft.title,draft.range,draft.imageStatus??null,draft.world]);
}
