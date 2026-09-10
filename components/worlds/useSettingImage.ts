'use client';
import {useCallback,useEffect,useState} from 'react';
import type {BuilderAccess} from '@/lib/lessonBuilder';
export function useSettingImage(access:BuilderAccess|null,draftId?:string){
 const [attempt,setAttempt]=useState(0),[image,setImage]=useState<{key:string;url:string|null;status:'ready'|'error'}|null>(null);
 const classroomId=access?.id,studentId=access?.studentId,token=access?.teacherToken||access?.studentToken;
 const key=JSON.stringify([classroomId,studentId,token,draftId,attempt]);const retry=useCallback(()=>setAttempt(n=>n+1),[]);
 useEffect(()=>{if(!classroomId||!draftId||!token)return;const controller=new AbortController();let url:string|undefined;fetch(`/api/lesson-image?${new URLSearchParams({id:classroomId,studentId:studentId??'',draftId})}`,{headers:{Authorization:`Bearer ${token}`},signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('Image unavailable');const blob=await r.blob();if(controller.signal.aborted)return;url=URL.createObjectURL(blob);const preview=new Image();preview.src=url;await preview.decode();if(!controller.signal.aborted)setImage({key,url,status:'ready'});}).catch(()=>{if(!controller.signal.aborted)setImage({key,url:null,status:'error'});});return()=>{controller.abort();if(url)URL.revokeObjectURL(url);};},[key,classroomId,studentId,token,draftId]);
 return {url:image?.key===key?image.url:null,status:image?.key===key?image.status:'loading',retry};
}
