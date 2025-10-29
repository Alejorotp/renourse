import { getRefreshClient } from '@/core';
import * as SecureStore from 'expo-secure-store';
import type { Category } from '../../../domain/models/category';
import { mapCategoryFromDb } from '../../../domain/models/category';
import type { ICategorySource } from '../i_category_source';

const API_BASE = 'https://roble-api.openlab.uninorte.edu.co/database';
const DB_NAME = 'flourse_460df99409';

export class CategorySourceService implements ICategorySource {
	private baseHeaders = { 'Content-Type': 'application/json' };
	constructor(private readonly getAuthToken: () => string | undefined) {}

	private async getToken(): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync('token');
		} catch {
			return null;
		}
	}

	private headers() {
		const token = this.getAuthToken();
		return token ? { ...this.baseHeaders, Authorization: `Bearer ${token}` } : { ...this.baseHeaders };
	}

	private async get(url: string): Promise<Response> {
		const refreshClient = getRefreshClient();
		if (refreshClient) {
			return refreshClient.get(url);
		}
		
		const token = await this.getToken();
		return fetch(url, {
			headers: {
				'Authorization': token ? `Bearer ${token}` : '',
			},
		});
	}

	private async post(url: string, body: any): Promise<Response> {
		const refreshClient = getRefreshClient();
		if (refreshClient) {
			return refreshClient.post(url, body);
		}
		
		const token = await this.getToken();
		return fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
			body: JSON.stringify(body),
		});
	}

	async getAllCategories(): Promise<Category[]> {
		const url = `${API_BASE}/${DB_NAME}/read?tableName=Category`;
		console.log('[CategorySourceService] getAllCategories →', url);
		const res = await this.get(url);
		console.log('[CategorySourceService] getAllCategories ← status', res.status);
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			console.warn('[CategorySourceService] getAllCategories error:', text?.slice(0, 400));
			return [];
		}
		const list = (await res.json()) as any[];
		return Array.isArray(list) ? list.map(mapCategoryFromDb) : [];
	}

	async createCategory(params: { name: string; groupingMethod: string; maxMembers: number; courseId: string; }): Promise<Category> {
		const { name, groupingMethod, maxMembers, courseId } = params;
		const url = `${API_BASE}/${DB_NAME}/insert`;
		const body = {
			tableName: 'Category',
			records: [
				{ name, groupingMethod, maxMembers, courseID: courseId },
			],
		};
		console.log('[CategorySourceService] createCategory →', url, body);
		const res = await this.post(url, body);
		console.log('[CategorySourceService] createCategory ← status', res.status);
		if (res.status !== 201) {
			const text = await res.text().catch(() => '');
			console.warn('[CategorySourceService] createCategory error body:', text?.slice(0, 500));
			throw new Error(`createCategory failed: ${res.status}`);
		}
		const data = await res.json().catch(() => undefined as any);
		const inserted = data?.inserted?.[0];
		const id = String(inserted?._id ?? '');

		// Fetch the newly created category to return full mapping
		const created = await this.getCategoryById(id);
		if (!created) throw new Error('createCategory: created category not found');

		// Optional logic mirroring Dart: if groupingMethod === 'Aleatorio'
		// We log here, as group creation occurs in feature/groups which is out-of-scope for this task.
		if (String(groupingMethod).toLowerCase().startsWith('aleatorio')) {
			console.log('[CategorySourceService] createCategory: Aleatorio grouping selected — further group creation handled elsewhere');
		}

		return created;
	}

	async deleteCategory(id: string): Promise<void> {
		const url = `${API_BASE}/${DB_NAME}/delete`;
		const body = { tableName: 'Category', filter: { _id: id } };
		console.log('[CategorySourceService] deleteCategory →', url, body);
		const res = await this.post(url, body);
		console.log('[CategorySourceService] deleteCategory ← status', res.status);
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			console.warn('[CategorySourceService] deleteCategory error body:', text?.slice(0, 500));
			throw new Error(`deleteCategory failed: ${res.status}`);
		}
	}

	async updateCategory(params: { id: string; newName?: string; newGroupingMethod?: string; newMaxMembers?: number; }): Promise<Category> {
		const { id, newName, newGroupingMethod, newMaxMembers } = params;
		const url = `${API_BASE}/${DB_NAME}/update`;
		const update: any = {};
		if (typeof newName !== 'undefined') update.name = newName;
		if (typeof newGroupingMethod !== 'undefined') update.groupingMethod = newGroupingMethod;
		if (typeof newMaxMembers !== 'undefined') update.maxMembers = newMaxMembers;

		if (Object.keys(update).length === 0) {
			const current = await this.getCategoryById(id);
			if (!current) throw new Error('updateCategory: category not found');
			return current;
		}

		const body = { tableName: 'Category', filter: { _id: id }, update };
		console.log('[CategorySourceService] updateCategory →', url, body);
		const res = await this.post(url, body);
		console.log('[CategorySourceService] updateCategory ← status', res.status);
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			console.warn('[CategorySourceService] updateCategory error body:', text?.slice(0, 500));
			throw new Error(`updateCategory failed: ${res.status}`);
		}
		const updated = await this.getCategoryById(id);
		if (!updated) throw new Error('updateCategory: updated category not found');
		return updated;
	}

	async getCategoryById(id: string): Promise<Category | null> {
		const url = `${API_BASE}/${DB_NAME}/read?tableName=Category&_id=${encodeURIComponent(id)}`;
		console.log('[CategorySourceService] getCategoryById →', url);
		const res = await this.get(url);
		console.log('[CategorySourceService] getCategoryById ← status', res.status);
		if (res.status === 404) return null;
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			console.warn('[CategorySourceService] getCategoryById error:', text?.slice(0, 400));
			return null;
		}
		const list = (await res.json()) as any[];
		const raw = Array.isArray(list) && list.length ? list[0] : null;
		return raw ? mapCategoryFromDb(raw) : null;
	}
}
