import {readClassroomAccess,type ClassroomAccess} from './classroomAccess';
import type {LessonDraft,BuilderAccess} from './lessonBuilder';
export type SavedWorldSummary={id:string;title:string;objective:string;createdAt:string;ready:boolean;sourceTitle:string};
export type SavedWorldGroup={classroom:SavedWorldSummary;drafts:SavedWorldSummary[]};
export type SavedDraftSelection={id:string;access:BuilderAccess;isCopy?:boolean};
export type StoredLibraryDraft=LessonDraft&{blobKey:string|null;launch:BuilderAccess;imageBlobKey?:string;imageLease?:{id:string;at:number};copiedFrom?:string;savedLesson?:string};

export function rememberedTeacherClasses(storage:Pick<Storage,'length'|'key'|'getItem'>,current?:ClassroomAccess|null){
 const found=new Map<string,ClassroomAccess>();
 const add=(access:ClassroomAccess|null)=>{if(access?.teacherToken)found.set(access.id,access);};
 try{add(readClassroomAccess(storage));for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith('cw-access:'))add(readClassroomAccess(storage,key.slice(10)));}}catch{/* Current access still works if browser storage is blocked. */}
 add(current??null);return [...found.values()];
}

export function copyLibraryDraft(source:StoredLibraryDraft,id:string,launch:BuilderAccess,copiedFrom:string):StoredLibraryDraft{
 const interrupted=source.imageStatus==='generating'&&!!source.imageLease&&Date.now()-source.imageLease.at>=300000;
 if(source.imageStatus==='generating'&&!interrupted)throw new Error('Wait for the setting illustration to finish before reusing this world.');
 const copy=structuredClone(source);copy.id=id;copy.launch=launch;copy.copiedFrom=copiedFrom;delete copy.imageLease;
 if(interrupted){copy.imageStatus='failed';copy.imageError='The earlier illustration was interrupted. The saved world can still be used.';}
 if(copy.world?.settingImage)copy.world.settingImage.draftId=id;
 return copy;
}

export function draftSummary(d:LessonDraft,createdAt:string):SavedWorldSummary{
 return {id:d.id,title:d.world?.title??d.title,objective:d.world?.objective??d.objective,sourceTitle:d.title,createdAt,ready:!!d.world};
}
