export type ClassroomAccess={id:string;teacherToken?:string;inviteToken?:string;studentId:string;studentToken:string;studentName?:string};
type AccessStorage=Pick<Storage,'getItem'|'setItem'>;

function parseAccess(raw:string|null):ClassroomAccess|null{
 try{
  const value:unknown=JSON.parse(raw??'null');
  if(!value||typeof value!=='object')return null;
  const access=value as Record<string,unknown>;
  if(!['id','studentId','studentToken'].every(key=>typeof access[key]==='string'&&access[key].length>0))return null;
  if(['teacherToken','inviteToken','studentName'].some(key=>access[key]!==undefined&&typeof access[key]!=='string'))return null;
  return access as ClassroomAccess;
 }catch{return null;}
}

export function readClassroomAccess(storage:Pick<AccessStorage,'getItem'>,classroomId?:string):ClassroomAccess|null{
 // Keep older single-classroom installations working, and never cross classrooms.
 for(const key of classroomId?[`cw-access:${classroomId}`,'cw-access']:['cw-access']){
  try{
   const access=parseAccess(storage.getItem(key));
   if(access&&(!classroomId||access.id===classroomId))return access;
  }catch{/* Browser storage may be unavailable. Joining still works. */}
 }
 return null;
}

export function saveClassroomAccess(storage:Pick<AccessStorage,'setItem'>,access:ClassroomAccess):boolean{
 try{
  const saved=JSON.stringify(access);
  storage.setItem(`cw-access:${access.id}`,saved);
  storage.setItem('cw-access',saved);
  return true;
 }catch{return false;}
}

export const classroomResumePath='/studio';
