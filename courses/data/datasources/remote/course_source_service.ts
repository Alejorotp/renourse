import { getRefreshClient } from '@/core';
import * as SecureStore from 'expo-secure-store';
import type { Course, CourseInfo } from '../../../domain/models/course_info';
import type { ICourseSource } from '../i_course_source';

const DB_BASE = 'https://roble-api.openlab.uninorte.edu.co/database';
const DB_NAME = 'flourse_460df99409';

export class CourseSourceService implements ICourseSource {
  private async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('token');
    } catch {
      return null;
    }
  }

  private async get(url: string) {
    // Try to use RefreshClient if available for auto token refresh
    const refreshClient = getRefreshClient();
    if (refreshClient) {
      return refreshClient.get(url);
    }
    
    // Fallback to direct fetch
    const token = await this.getToken();
    const res = await fetch(url, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
    return res;
  }

  private async post(url: string, body: any) {
    // Try to use RefreshClient if available for auto token refresh
    const refreshClient = getRefreshClient();
    if (refreshClient) {
      return refreshClient.post(url, body);
    }
    
    // Fallback to direct fetch
    const token = await this.getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });
    return res;
  }

  private async getUserNameById(userId: string): Promise<string> {
    const url = `${DB_BASE}/${DB_NAME}/read?tableName=AuthenticationUser&UID=${encodeURIComponent(userId)}`;
    try {
      const res = await this.get(url);
      if (!res.ok) return 'Usuario Desconocido';
      const list = await res.json();
      const first = Array.isArray(list) && list.length ? list[0] : null;
      return first?.name ?? 'Usuario Desconocido';
    } catch {
      return 'Usuario Desconocido';
    }
  }

  async fetchCourses(params?: { userId?: string }): Promise<CourseInfo[]> {
    // If userId provided, fetch only related courses with per-user info
    if (params?.userId) {
      const userId = params.userId;
      // 1) CourseMember for user
      const cmUrl = `${DB_BASE}/${DB_NAME}/read?tableName=CourseMember&userID=${encodeURIComponent(userId)}`;
      const cmRes = await this.get(cmUrl);
      if (!cmRes.ok) return [];
      const memberships: any[] = await cmRes.json();
      if (!Array.isArray(memberships) || memberships.length === 0) return [];
      const uniqueCourseIds = [...new Set(memberships.map(m => String(m.courseID)))] as string[];

      // 2) Fetch all course records in parallel
      const courseReads = await Promise.all(uniqueCourseIds.map(cid =>
        this.get(`${DB_BASE}/${DB_NAME}/read?tableName=Course&courseCode=${encodeURIComponent(cid)}`)
      ));
      const allCoursesJson: any[] = [];
      for (const r of courseReads) {
        if (r.ok) {
          const arr = await r.json();
          if (Array.isArray(arr)) allCoursesJson.push(...arr);
        }
      }
      if (allCoursesJson.length === 0) return [];

      // 3) Fetch all members for each course in parallel and group
      const membersReads = await Promise.all(uniqueCourseIds.map(cid =>
        this.get(`${DB_BASE}/${DB_NAME}/read?tableName=CourseMember&courseID=${encodeURIComponent(cid)}`)
      ));
      const membersByCourse: Record<string, string[]> = {};
      for (const [i, r] of membersReads.entries()) {
        const cid = uniqueCourseIds[i];
        if (r.ok) {
          const arr = await r.json();
          const ids = Array.isArray(arr) ? arr.map((m: any) => String(m.userID)) : [];
          membersByCourse[cid] = ids;
        } else {
          membersByCourse[cid] = [];
        }
      }

      // 4) Compose CourseInfo with userRole, professorName, memberNames
      const results: CourseInfo[] = [];
      for (const json of allCoursesJson) {
        const mapped = mapCourseFromDB(json);
        const role = String(mapped.professorId ?? '') === userId ? 'Profesor' : 'Estudiante';
        const profName = await this.getUserNameById(String(mapped.professorId ?? ''));
        const memberIDs = membersByCourse[mapped.courseCode] ?? [];
        const memberNames = await Promise.all(memberIDs.map(id => this.getUserNameById(id)));
        results.push({ course: mapped, userRole: role as any, professorName: profName, memberNames });
      }
      return results;
    }

    // Otherwise fetch all courses
    const url = `${DB_BASE}/${DB_NAME}/read?tableName=Course`;
    const res = await this.get(url);
    if (!res.ok) return [];
    const jsonList: any[] = await res.json();
    const out: CourseInfo[] = [];
    for (const json of jsonList) {
      const mapped = mapCourseFromDB(json);
      const profName = await this.getUserNameById(String(mapped.professorId ?? ''));
      // If CourseMember table is canonical, fetch members per course
      const mRes = await this.get(`${DB_BASE}/${DB_NAME}/read?tableName=CourseMember&courseID=${encodeURIComponent(mapped.courseCode)}`);
      let memberNames: string[] = [];
      if (mRes.ok) {
        const arr = await mRes.json();
        const ids = Array.isArray(arr) ? arr.map((m: any) => String(m.userID)) : [];
        memberNames = await Promise.all(ids.map(id => this.getUserNameById(id)));
      }
      out.push({ course: mapped, professorName: profName, memberNames });
    }
    return out;
  }

  async fetchCourseById(id: string): Promise<CourseInfo | null> {
    // Treat id as courseCode (as in Flutter)
    const url = `${DB_BASE}/${DB_NAME}/read?tableName=Course&courseCode=${encodeURIComponent(id)}`;
    const res = await this.get(url);
    if (!res.ok) return null;
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const mapped = mapCourseFromDB(arr[0]);
    const profName = await this.getUserNameById(String(mapped.professorId ?? ''));
    return { course: mapped, professorName: profName };
  }

  async createCourse(course: Course): Promise<CourseInfo> {
    // Generate unique 6-char code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const genCode = () => Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    let code = genCode();
    // ensure unique
    // eslint-disable-next-line no-constant-condition
    for (let attempts = 0; attempts < 20; attempts++) {
      const check = await this.get(`${DB_BASE}/${DB_NAME}/read?tableName=Course&courseCode=${code}`);
      if (check.ok) {
        const arr = await check.json();
        if (!Array.isArray(arr) || arr.length === 0) break; // unique
      }
      code = genCode();
    }

    const record = {
      title: course.name ?? 'Curso',
      courseCode: code,
      professorID: course.professorId,
      memberIDs: [],
      categoryIDs: [],
    };
    const insUrl = `${DB_BASE}/${DB_NAME}/insert`;
    const insRes = await this.post(insUrl, { tableName: 'Course', records: [record] });
    if (insRes.status !== 201) throw new Error(`createCourse failed: ${insRes.status}`);

    // Add professor as member (role true if backend uses it)
    try { await this.joinCourse({ courseCode: code, userId: String(course.professorId ?? '') }); } catch {}

    const mapped: Course = {
      id: code,
      courseCode: code,
      name: record.title,
      professorId: course.professorId,
      memberIds: [],
      categoryIds: [],
    };
    const profName = await this.getUserNameById(String(course.professorId ?? ''));
    return { course: mapped, professorName: profName, userRole: 'Profesor', memberNames: [profName] };
  }

  async updateCourse(id: string, patch: Partial<Course>): Promise<CourseInfo> {
    // Optional: implement if needed with /update endpoint (not present in Flutter sample). For now, throw.
    throw new Error('updateCourse not implemented for Roble DB backend');
  }

  async deleteCourse(id: string): Promise<void> {
    // Optional: implement via delete endpoint if available. For now, throw.
    throw new Error('deleteCourse not implemented for Roble DB backend');
  }

  async joinCourse(payload: { courseCode: string; userId: string }): Promise<boolean> {
    // Check course exists
    const courseRes = await this.get(`${DB_BASE}/${DB_NAME}/read?tableName=Course&courseCode=${encodeURIComponent(payload.courseCode)}`);
    if (!courseRes.ok) return false;
    const courseArr = await courseRes.json();
    if (!Array.isArray(courseArr) || courseArr.length === 0) return false;

    // Check membership exists
    const memberCheck = await this.get(`${DB_BASE}/${DB_NAME}/read?tableName=CourseMember&userID=${encodeURIComponent(payload.userId)}&courseID=${encodeURIComponent(payload.courseCode)}`);
    if (memberCheck.ok) {
      const arr = await memberCheck.json();
      if (Array.isArray(arr) && arr.length > 0) return true; // already member
    }

    // Insert membership
    const res = await this.post(`${DB_BASE}/${DB_NAME}/insert`, {
      tableName: 'CourseMember',
      records: [{ courseID: payload.courseCode, userID: payload.userId, role: false }],
    });
    return res.status === 201;
  }
}

function mapCourseFromDB(json: any): Course {
  return {
    id: String(json?.courseCode ?? json?._id ?? ''),
    courseCode: String(json?.courseCode ?? ''),
    name: String(json?.name ?? json?.title ?? ''),
    description: json?.description,
    professorId: json?.professorId ?? json?.professorID,
    createdAt: json?.createdAt,
    memberIds: json?.memberIDs,
    categoryIds: json?.categoryIDs,
    registerCode: json?.registerCode,
  };
}