'use client';

import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';

// A draft belongs to one learner in one classroom, including teacher previews.
export function useArgumentDraft(classroomId?: string, studentId?: string) {
 const key=classroomId&&studentId?`cw-argument-draft:${classroomId}:${studentId}`:null;
 const currentKey=useRef(key);
 useEffect(()=>{currentKey.current=key;},[key]);
 const [draft,setDraft]=useState<{key:string|null;text:string}>({key:null,text:''});
 const [saved,setSaved]=useState(false);

 useEffect(()=>{
  let restored:string|null=null;
  if(key){try{restored=localStorage.getItem(key);}catch{/* Writing remains available without browser storage. */}}
  setSaved(false);
  setDraft(previous=>({key,text:restored?.slice(0,1600)??(previous.key===null?previous.text:'')}));
 },[key]);

 useEffect(()=>{
  if(!key||draft.key!==key)return;
  try{
   if(draft.text)localStorage.setItem(key,draft.text);
   else localStorage.removeItem(key);
   setSaved(true);
  }catch{setSaved(false);}
 },[key,draft]);

 const setText=useCallback((value:SetStateAction<string>)=>{
  const key=currentKey.current;
  setSaved(false);
  setDraft(previous=>({key,text:typeof value==='function'?value(previous.key===key?previous.text:''):value}));
 },[]);

 return {claim:draft.key===key?draft.text:'',setClaim:setText,draftSaved:saved&&draft.key===key};
}
