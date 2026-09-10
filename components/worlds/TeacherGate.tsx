'use client';
import PageHeader from '@/components/PageHeader';
import {readClassroomAccess} from '@/lib/classroomAccess';
import {useEffect,useState,type ReactNode} from 'react';
export default function TeacherGate({children}:{children:ReactNode}){
 const [ready,setReady]=useState(false),[code,setCode]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{try{const access=readClassroomAccess(localStorage);if(access&&!access.teacherToken){setReady(true);return;}}catch{}if(new URLSearchParams(location.search).has('join')){setReady(true);return;}fetch('/api/teacher-access').then(r=>r.json() as Promise<{authorized?:boolean}>).then(d=>setReady(d.authorized===true)).catch(()=>setError('Could not check studio access. Please retry.'));},[]);
 if(ready)return children;
 return <main className="teacher-access"><PageHeader/><section className="teacher-access-card"><h1>Teacher studio</h1><p>Enter your private teacher code to prepare lessons and invite students.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/teacher-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});const d=await r.json() as {error?:string};if(!r.ok)throw new Error(d.error??'Unable to sign in.');setCode('');setReady(true);}catch(e){setError(e instanceof Error?e.message:'Unable to sign in.');}finally{setBusy(false);}}}><label htmlFor="teacher-code">Teacher access code</label><input id="teacher-code" type="password" autoComplete="current-password" value={code} onChange={e=>setCode(e.target.value)} required/><button className="primary-button" disabled={busy}>{busy?'Checking…':'Enter studio'}</button>{error&&<p role="alert">{error}</p>}</form><p>Here to try a lesson? <a href="/try">Explore the public trial →</a></p></section></main>;
}
