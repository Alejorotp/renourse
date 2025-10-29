import type { Course, CourseInfo } from '../../domain/models/course_info';
import type { ICourseRepository } from '../../domain/repositories/i_course_repository';
import type { ICourseSource } from '../datasources/i_course_source';

export class CourseRepository implements ICourseRepository {
  constructor(private readonly source: ICourseSource) {}

  getAllCourses(params?: { userId?: string }): Promise<CourseInfo[]> {
    return this.source.fetchCourses(params);
  }

  getCourseById(id: string): Promise<CourseInfo | null> {
    return this.source.fetchCourseById(id);
  }

  createCourse(course: Course): Promise<CourseInfo> {
    return this.source.createCourse(course);
  }

  updateCourse(id: string, patch: Partial<Course>): Promise<CourseInfo> {
    return this.source.updateCourse(id, patch);
  }

  deleteCourse(id: string): Promise<void> {
    return this.source.deleteCourse(id);
  }

  joinCourse(payload: { courseCode: string; userId: string }): Promise<boolean> {
    return this.source.joinCourse(payload);
  }
}