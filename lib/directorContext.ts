import { z } from 'zod';
import type { StudentState } from './world';

export const BasisSchema=z.object({studentId:z.string().uuid(),name:z.string().max(35),revision:z.number().int().positive()});
export type DirectorBasis=z.infer<typeof BasisSchema>;
// Shared by HTTP and native steering; call before opening any model connection.
export async function directorContext(database:D1Database,classId:string,teacherToken:unknown,studentId:unknown){
 const id=z.string().uuid().parse(classId);
 const classroom=await database.prepare('SELECT teacher_token FROM classrooms WHERE id = ?').bind(id).first<{teacher_token:string}>();
 if(!classroom||typeof teacherToken!=='string'||teacherToken!==classroom.teacher_token)throw new Error('Only the teacher can direct this classroom');
 const selected=z.string().uuid().parse(studentId);
 const row=await database.prepare('SELECT id, state, revision FROM students WHERE id = ? AND class_id = ?').bind(selected,id).first<{id:string;state:string;revision:number}>();
 if(!row)throw new Error('Select a learner from this classroom.');
 const student=JSON.parse(row.state) as StudentState;
 return {student,basis:{studentId:row.id,name:student.name,revision:row.revision}};
}
