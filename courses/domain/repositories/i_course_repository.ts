import type { Course, CourseInfo } from '../../domain/models/course_info';

export interface ICourseRepository {
  getAllCourses(params?: { userId?: string }): Promise<CourseInfo[]>;
  getCourseById(id: string): Promise<CourseInfo | null>;
  createCourse(course: Course): Promise<CourseInfo>;
  updateCourse(id: string, patch: Partial<Course>): Promise<CourseInfo>;
  deleteCourse(id: string): Promise<void>;
  joinCourse(payload: { courseCode: string; userId: string }): Promise<boolean>;
}