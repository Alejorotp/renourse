export interface Course {
  id: string;
  courseCode: string; // Flutter: courseCode
  name: string; // Flutter: title
  description?: string;
  professorId?: string; // Flutter: professorID
  createdAt?: string; // ISO date
  memberIds?: string[]; // Flutter: memberIDs
  categoryIds?: string[]; // Flutter: categoryIDs
  registerCode?: string; // Flutter: registerCode
}

export interface CourseInfo {
  course: Course;
  studentCount?: number;
  categoryIds?: string[];
  // Flutter parity fields when fetching per-user course info
  userRole?: 'Profesor' | 'Estudiante';
  professorName?: string;
  memberNames?: string[];
}