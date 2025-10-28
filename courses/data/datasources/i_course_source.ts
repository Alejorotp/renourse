import type { Course, CourseInfo } from '../../domain/models/course_info';

export interface ICourseSource {
  fetchCourses(params?: { userId?: string }): Promise<CourseInfo[]>;
  fetchCourseById(id: string): Promise<CourseInfo | null>;
  createCourse(course: Course): Promise<CourseInfo>;
  updateCourse(id: string, patch: Partial<Course>): Promise<CourseInfo>;
  deleteCourse(id: string): Promise<void>;
}