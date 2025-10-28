export interface Course {
  id: string;
  courseCode: string; // align with Dart's courseCode
  name: string;
  description?: string;
  professorId?: string;
  createdAt?: string; // ISO date
}

export interface CourseInfo {
  course: Course;
  studentCount?: number;
  categoryIds?: string[];
}