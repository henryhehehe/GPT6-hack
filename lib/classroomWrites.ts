// Shared SQL makes the world/progress boundary atomic in D1 and testable in SQLite.
export const meaningfulProgressSql="(COALESCE(json_array_length(json_extract(state, '$.turns')),0) > 0 OR COALESCE(json_array_length(json_extract(state, '$.evidence')),0) > 0 OR COALESCE(json_array_length(json_extract(state, '$.dialogue')),0) > 0 OR COALESCE(json_array_length(json_extract(state, '$.museumNotes')),0) > 0 OR json_extract(state, '$.prediction.text') IS NOT NULL OR json_extract(state, '$.archiveReflection.text') IS NOT NULL)";
export const replaceWorldSql=`UPDATE classrooms SET state = ?, world = ?, lesson = ?, version = version + 1 WHERE id = ? AND version = ? AND NOT EXISTS (SELECT 1 FROM students WHERE class_id = classrooms.id AND ${meaningfulProgressSql})`;
export const saveStudentSql="UPDATE students SET state = json_set(?, '$.zone', json_extract(state, '$.zone')), revision = revision + 1 WHERE id = ? AND revision = ? AND EXISTS (SELECT 1 FROM classrooms WHERE id = students.class_id AND version = ?)";

// Location is not assessed progress; update it independently without invalidating a pending answer.
export const visitStudentSql="UPDATE students SET state = json_set(state, '$.zone', ?) WHERE id = ? AND EXISTS (SELECT 1 FROM classrooms WHERE id = students.class_id AND version = ?)";
