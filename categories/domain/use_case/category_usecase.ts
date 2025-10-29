import type { Category } from '../models/category';
import type { ICategoryRepository } from '../repositories/i_category_repository';

export class CategoryUseCase {
	constructor(private readonly repository: ICategoryRepository) {}

	getAllCategories(): Promise<Category[]> {
		return this.repository.getAllCategories();
	}

	createCategory(params: { name: string; groupingMethod: string; maxMembers: number; courseId: string; }): Promise<Category> {
		return this.repository.createCategory(params);
	}

	deleteCategory(id: string): Promise<void> {
		return this.repository.deleteCategory(id);
	}

	updateCategory(params: { id: string; newName?: string; newGroupingMethod?: string; newMaxMembers?: number; }): Promise<Category> {
		return this.repository.updateCategory(params);
	}

	getCategoryById(id: string): Promise<Category | null> {
		return this.repository.getCategoryById(id);
	}
}
