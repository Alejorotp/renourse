import type { Category } from '../models/category';

export interface ICategoryRepository {
	getAllCategories(): Promise<Category[]>;

	createCategory(params: {
		name: string;
		groupingMethod: string;
		maxMembers: number;
		courseId: string;
	}): Promise<Category>;

	deleteCategory(id: string): Promise<void>;

	updateCategory(params: {
		id: string;
		newName?: string;
		newGroupingMethod?: string;
		newMaxMembers?: number;
	}): Promise<Category>;

	getCategoryById(id: string): Promise<Category | null>;
}
