import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rememberedTeacherClasses,copyLibraryDraft,draftSummary,type StoredLibraryDraft} from '../lib/savedWorlds';
import {initialWorld} from '../lib/world';
test('library restores multiple teacher classrooms, excluding student-only and corrupt records',()=>{
 const teacher={id:'a',teacherToken:'teacher-a',studentId:'s',studentToken:'student-a'};
 const data=new Map([['cw-access',JSON.stringify(teacher)],['cw-access:a',JSON.stringify(teacher)],['cw-access:b',JSON.stringify({...teacher,id:'b',teacherToken:undefined})],['cw-access:c','{broken']]);
 const storage={length:data.size,key:(i:number)=>[...data.keys()][i],getItem:(key:string)=>data.get(key)??null};
 assert.deepEqual(rememberedTeacherClasses(storage),[teacher]);
 assert.deepEqual(rememberedTeacherClasses(storage,{...teacher,id:'d'}).map(c=>c.id),['a','d']);
});
const original:StoredLibraryDraft={id:'source',title:'Book',range:'Chapter 1',objective:'Read closely',format:'pdf',sourceUrl:null,hasUpload:true,passages:[],world:{...initialWorld,settingImage:{draftId:'source',caption:'Illustration',model:'test',responseId:'image-response'}},run:null,blobKey:'private/source',imageBlobKey:'private/image',imageStatus:'ready',launch:{id:'old-class',teacherToken:'old-teacher',studentId:'old-student',studentToken:'old-token'}};
test('reuse makes a separate launch and image authorization identity while preserving sources',()=>{
 const launch={id:'new-class',teacherToken:'new-teacher',studentId:'new-student',studentToken:'new-token'};
 const copy=copyLibraryDraft(original,'new-draft',launch,'draft:source');
 assert.equal(copy.id,'new-draft');assert.deepEqual(copy.launch,launch);assert.equal(copy.world?.settingImage?.draftId,'new-draft');assert.equal(original.world?.settingImage?.draftId,'source');assert.equal(copy.blobKey,original.blobKey);assert.equal(copy.imageBlobKey,original.imageBlobKey);assert.deepEqual(copy.world?.evidence,original.world?.evidence);
});
test('unfinished image jobs cannot be copied into a classroom',()=>{
 assert.throws(()=>copyLibraryDraft({...original,imageStatus:'generating'},'new',original.launch,'draft:source'),/illustration/);
});
test('expired illustration leases recover without discarding the stored full lesson',()=>{
 const copy=copyLibraryDraft({...original,savedLesson:'Full original reading, beyond evidence selections.',imageStatus:'generating',imageLease:{id:'expired',at:Date.now()-300001}},'new',original.launch,'draft:source');
 assert.equal(copy.imageStatus,'failed');assert.equal(copy.imageLease,undefined);assert.equal(copy.savedLesson,'Full original reading, beyond evidence selections.');
});
test('library summaries never expose source blobs, credentials, or complete source passages',()=>{
 assert.deepEqual(Object.keys(draftSummary(original,'today')).sort(),['createdAt','id','objective','ready','sourceTitle','title']);
});
