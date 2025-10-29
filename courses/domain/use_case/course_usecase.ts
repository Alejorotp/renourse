import type { Course, CourseInfo } from '../models/course_info';
import type { ICourseRepository } from '../repositories/i_course_repository';

export class CourseUseCase {
  constructor(private readonly repo: ICourseRepository) {}

  getAllCourses(params?: { userId?: string }): Promise<CourseInfo[]> {
    return this.repo.getAllCourses(params);
  }

  getCourseById(id: string): Promise<CourseInfo | null> {
    return this.repo.getCourseById(id);
  }

  createCourse(course: Course): Promise<CourseInfo> {
    return this.repo.createCourse(course);
  }

  updateCourse(id: string, patch: Partial<Course>): Promise<CourseInfo> {
    return this.repo.updateCourse(id, patch);
  }

  deleteCourse(id: string): Promise<void> {
    return this.repo.deleteCourse(id);
  }

  joinCourse(payload: { courseCode: string; userId: string }): Promise<boolean> {
    return this.repo.joinCourse(payload);
  }
}