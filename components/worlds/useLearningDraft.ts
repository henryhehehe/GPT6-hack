'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {createDraftStore} from '@/lib/draftStore';
export type {LearningDraft} from '@/lib/draftStore';
export function useLearningDraft(key:string|null,sourceIdentity:string){
 const store=useMemo(()=>createDraftStore(key,sourceIdentity,()=>localStorage),[key,sourceIdentity]);
 const {draft,warning}=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getServerSnapshot);
 return {draft,warning,read:store.read,update:store.update};
}
