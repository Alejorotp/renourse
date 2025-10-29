import type { Category } from '../../domain/models/category';
import type { ICategoryRepository } from '../../domain/repositories/i_category_repository';
import type { ICategorySource } from '../datasources/i_category_source';

export class CategoryRepository implements ICategoryRepository {
	constructor(private readonly source: ICategorySource) {}

	async getAllCategories(): Promise<Category[]> {
		console.log('[CategoryRepository] getAllCategories');
		return this.source.getAllCategories();
	}

	async createCategory(params: { name: string; groupingMethod: string; maxMembers: number; courseId: string; }): Promise<Category> {
		console.log('[CategoryRepository] createCategory', params);
		return this.source.createCategory(params);
	}

	async deleteCategory(id: string): Promise<void> {
		console.log('[CategoryRepository] deleteCategory', id);
		return this.source.deleteCategory(id);
	}

	async updateCategory(params: { id: string; newName?: string; newGroupingMethod?: string; newMaxMembers?: number; }): Promise<Category> {
		console.log('[CategoryRepository] updateCategory', params);
		return this.source.updateCategory(params);
	}

	async getCategoryById(id: string): Promise<Category | null> {
		console.log('[CategoryRepository] getCategoryById', id);
		return this.source.getCategoryById(id);
	}
}
