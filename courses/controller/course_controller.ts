import type { Course, CourseInfo } from '../domain/models/course_info';
import { CourseUseCase } from '../domain/use_case/course_usecase';

export class CourseController {
  private _courses: CourseInfo[] = [];
  private _userCourses: CourseInfo[] = [];
  private _loading = false;
  private _error: string | null = null;

  constructor(private readonly useCase: CourseUseCase) {}

  get courses(): CourseInfo[] {
    return this._courses;
  }
  get userCourses(): CourseInfo[] {
    return this._userCourses;
  }
  get loading(): boolean {
    return this._loading;
  }
  get error(): string | null {
    return this._error;
  }

  async loadCourses(params?: { userId?: string }) {
    this._loading = true;
    this._error = null;
    try {
      this._courses = await this.useCase.getAllCourses(params);
    } catch (e: any) {
      this._error = e?.message ?? String(e);
    } finally {
      this._loading = false;
    }
  }

  async loadUserCourses(userId: string) {
    // Reuse getAllCourses with userId filter; backend should return per-user course info
    await this.loadCourses({ userId });
    this._userCourses = [...this._courses];
  }

  async getCourseById(id: string): Promise<CourseInfo | null> {
    return this.useCase.getCourseById(id);
  }

  async createCourse(course: Course) {
    const created = await this.useCase.createCourse(course);
    this._courses = [created, ...this._courses];
    return created;
  }

  async updateCourse(id: string, patch: Partial<Course>) {
    const updated = await this.useCase.updateCourse(id, patch);
    this._courses = this._courses.map(ci => (ci.course.id === id ? updated : ci));
    return updated;
  }

  async deleteCourse(id: string) {
    await this.useCase.deleteCourse(id);
    this._courses = this._courses.filter(ci => ci.course.id !== id);
  }

  async joinCourse(courseCode: string, userId: string) {
    const ok = await this.useCase.joinCourse({ courseCode, userId });
    return ok;
  }
}