import type { Course, CourseInfo } from '../../../domain/models/course_info';
import type { ICourseSource } from '../i_course_source';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000/api';

export class CourseSourceService implements ICourseSource {
  private headers = { 'Content-Type': 'application/json' };

  async fetchCourses(params?: { userId?: string }): Promise<CourseInfo[]> {
    const url = new URL(`${API_BASE}/courses`);
    if (params?.userId) url.searchParams.set('userId', params.userId);
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`fetchCourses failed: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapCourseInfo) : [];
  }

  async fetchCourseById(id: string): Promise<CourseInfo | null> {
    const res = await fetch(`${API_BASE}/courses/${id}`, { headers: this.headers });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`fetchCourseById failed: ${res.status}`);
    return mapCourseInfo(await res.json());
  }

  async createCourse(course: Course): Promise<CourseInfo> {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(course),
    });
    if (!res.ok) throw new Error(`createCourse failed: ${res.status}`);
    return mapCourseInfo(await res.json());
  }

  async updateCourse(id: string, patch: Partial<Course>): Promise<CourseInfo> {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`updateCourse failed: ${res.status}`);
    return mapCourseInfo(await res.json());
  }

  async deleteCourse(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: this.headers });
    if (!res.ok) throw new Error(`deleteCourse failed: ${res.status}`);
  }
}

function mapCourseInfo(raw: any): CourseInfo {
  const course: Course = {
    id: String(raw?.course?.id ?? raw?.id ?? ''),
    courseCode: String(raw?.course?.courseCode ?? raw?.courseCode ?? ''),
    name: String(raw?.course?.name ?? raw?.name ?? ''),
    description: raw?.course?.description ?? raw?.description,
    professorId: raw?.course?.professorId ?? raw?.professorId,
    createdAt: raw?.course?.createdAt ?? raw?.createdAt,
  };
  return {
    course,
    studentCount: Number(raw?.studentCount ?? raw?.course?.studentCount ?? 0),
    categoryIds: (raw?.categoryIds ?? raw?.course?.categoryIds) ?? [],
  };
}