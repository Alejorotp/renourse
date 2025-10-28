import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CourseController } from '../controller/course_controller';
import { CourseSourceService } from '../data/datasources/remote/course_source_service';
import { CourseRepository } from '../data/repositories/course_repository';
import type { Course, CourseInfo } from '../domain/models/course_info';
import { CourseUseCase } from '../domain/use_case/course_usecase';

type CourseContextValue = {
  courses: CourseInfo[];
  loading: boolean;
  error: string | null;
  loadCourses: (params?: { userId?: string }) => Promise<void>;
  getCourseById: (id: string) => Promise<CourseInfo | null>;
  createCourse: (course: Course) => Promise<CourseInfo>;
  updateCourse: (id: string, patch: Partial<Course>) => Promise<CourseInfo>;
  deleteCourse: (id: string) => Promise<void>;
};

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export const CourseProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Wire dependencies
  const source = useMemo(() => new CourseSourceService(), []);
  const repo = useMemo(() => new CourseRepository(source), [source]);
  const useCase = useMemo(() => new CourseUseCase(repo), [repo]);
  const controller = useMemo(() => new CourseController(useCase), [useCase]);

  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncState = () => {
    setCourses([...controller.courses]);
  };

  const loadCourses = useCallback(async (params?: { userId?: string }) => {
    setLoading(true);
    setError(null);
    try {
      await controller.loadCourses(params);
      syncState();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [controller]);

  const getCourseById = useCallback((id: string) => controller.getCourseById(id), [controller]);

  const createCourse = useCallback(async (course: Course) => {
    const created = await controller.createCourse(course);
    syncState();
    return created;
  }, [controller]);

  const updateCourse = useCallback(async (id: string, patch: Partial<Course>) => {
    const updated = await controller.updateCourse(id, patch);
    syncState();
    return updated;
  }, [controller]);

  const deleteCourse = useCallback(async (id: string) => {
    await controller.deleteCourse(id);
    syncState();
  }, [controller]);

  const value = useMemo<CourseContextValue>(() => ({
    courses, loading, error,
    loadCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  }), [courses, loading, error, loadCourses, getCourseById, createCourse, updateCourse, deleteCourse]);

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

export const useCourses = (): CourseContextValue => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within a CourseProvider');
  return ctx;
};