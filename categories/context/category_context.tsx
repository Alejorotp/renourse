import { useAuthSession } from '@/auth/context/auth_context';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CategoryController } from '../controller/category_controller';
import { CategorySourceService } from '../data/datasources/remote/category_source_service';
import { CategoryRepository } from '../data/repositories/category_repository';
import type { Category } from '../domain/models/category';
import { CategoryUseCase } from '../domain/use_case/category_usecase';

type CategoryContextValue = {
	categories: Category[];
	loading: boolean;
	error: string | null;
	loadCategories: () => Promise<void>;
	createCategory: (p: { name: string; groupingMethod: string; maxMembers: number; courseId: string; }) => Promise<Category>;
	deleteCategory: (id: string) => Promise<void>;
	updateCategory: (p: { id: string; newName?: string; newGroupingMethod?: string; newMaxMembers?: number; }) => Promise<Category>;
	getCategoryById: (id: string) => Promise<Category | null>;
	getCategoryNameById: (id: string) => string;
};

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

export const CategoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const { user } = useAuthSession();
	const source = useMemo(() => new CategorySourceService(() => user?.accessToken), [user?.accessToken]);
	const repo = useMemo(() => new CategoryRepository(source), [source]);
	const useCase = useMemo(() => new CategoryUseCase(repo), [repo]);
	const controller = useMemo(() => new CategoryController(useCase), [useCase]);

	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sync = () => setCategories([...controller.categories]);

	const loadCategories = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			await controller.fetchCategories();
			sync();
		} catch (e: any) {
			setError(e?.message ?? String(e));
		} finally { setLoading(false); }
	}, [controller]);

	const createCategory = useCallback(async (p: { name: string; groupingMethod: string; maxMembers: number; courseId: string; }) => {
		const created = await controller.createCategory(p);
		sync();
		return created;
	}, [controller]);

	const deleteCategory = useCallback(async (id: string) => {
		await controller.deleteCategory(id);
		sync();
	}, [controller]);

	const updateCategory = useCallback(async (p: { id: string; newName?: string; newGroupingMethod?: string; newMaxMembers?: number; }) => {
		const updated = await controller.updateCategory(p);
		sync();
		return updated;
	}, [controller]);

	const getCategoryById = useCallback((id: string) => controller.getCategoryById(id), [controller]);
	const getCategoryNameById = useCallback((id: string) => controller.getCategoryNameById(id), [controller]);

	const value = useMemo<CategoryContextValue>(() => ({
		categories, loading, error,
		loadCategories, createCategory, deleteCategory, updateCategory,
		getCategoryById, getCategoryNameById,
	}), [categories, loading, error, loadCategories, createCategory, deleteCategory, updateCategory, getCategoryById, getCategoryNameById]);

	return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

export const useCategories = () => {
	const ctx = useContext(CategoryContext);
	if (!ctx) throw new Error('useCategories must be used within a CategoryProvider');
	return ctx;
};

