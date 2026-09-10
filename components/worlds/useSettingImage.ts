'use client';
import {useCallback,useEffect,useState} from 'react';
import type {BuilderAccess} from '@/lib/lessonBuilder';
export function useSettingImage(access:BuilderAccess|null,draftId?:string){
 const [attempt,setAttempt]=useState(0),[image,setImage]=useState<{key:string;url:string|null;status:'loading'|'ready'|'error'}|null>(null);const key=`${access?.id}:${draftId}`;const retry=useCallback(()=>setAttempt(n=>n+1),[]);
 useEffect(()=>{if(!access||!draftId){setImage(null);return;}const controller=new AbortController();let url:string|undefined;setImage({key,url:null,status:'loading'});fetch(`/api/lesson-image?id=${access.id}&studentId=${access.studentId}&draftId=${draftId}`,{headers:{Authorization:`Bearer ${access.teacherToken||access.studentToken}`},signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('Image unavailable');const blob=await r.blob();if(controller.signal.aborted)return;url=URL.createObjectURL(blob);const preview=new Image();preview.src=url;await preview.decode();if(!controller.signal.aborted)setImage({key,url,status:'ready'});}).catch(()=>{if(!controller.signal.aborted)setImage({key,url:null,status:'error'});});return()=>{controller.abort();if(url)URL.revokeObjectURL(url);};},[key,access?.teacherToken,access?.studentToken,attempt]);
 return {url:image?.key===key?image.url:null,status:image?.key===key?image.status:'loading',retry};
}
