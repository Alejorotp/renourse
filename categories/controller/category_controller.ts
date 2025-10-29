import type { Category } from '../domain/models/category';
import type { CategoryUseCase } from '../domain/use_case/category_usecase';

export class CategoryController {
	public categories: Category[] = [];
	constructor(private readonly useCase: CategoryUseCase) {}

	async fetchCategories(): Promise<void> {
		const fetched = await this.useCase.getAllCategories();
		this.categories = fetched;
		console.log('[CategoryController] fetchCategories count', fetched.length);
	}

	async createCategory(params: { name: string; groupingMethod: string; maxMembers: number; courseId: string; }): Promise<Category> {
		const created = await this.useCase.createCategory(params);
		this.categories = [...this.categories, created];
		return created;
	}

	async deleteCategory(id: string): Promise<void> {
		await this.useCase.deleteCategory(id);
		this.categories = this.categories.filter(c => c.id !== id);
	}

	async updateCategory(params: { id: string; newName?: string; newGroupingMethod?: string; newMaxMembers?: number; }): Promise<Category> {
		const updated = await this.useCase.updateCategory(params);
		this.categories = this.categories.map(c => (c.id === updated.id ? updated : c));
		return updated;
	}

	getAllCategories(): Category[] { return this.categories; }

	async getCategoryById(id: string): Promise<Category | null> {
		return this.useCase.getCategoryById(id);
	}

	getCategoryNameById(id: string): string {
		const cat = this.categories.find(c => String(c.id) === String(id));
		return cat?.name ?? 'Desconocida';
	}
}
