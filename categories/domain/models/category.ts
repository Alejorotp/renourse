export interface Category {
	id?: string;
	name: string;
	// "Aleatorio" | "Auto-asignado" (keeping Dart strings; can be i18n later)
	groupingMethod: string;
	maxMembers: number;
	courseId?: string | null;
	groupIDs?: string[];
}

export function mapCategoryFromDb(db: any): Category {
	return {
		id: String(db?._id ?? db?.id ?? ''),
		name: String(db?.name ?? ''),
		groupingMethod: String(db?.groupingMethod ?? ''),
		maxMembers: typeof db?.maxMembers === 'number' ? db.maxMembers : parseInt(String(db?.maxMembers ?? 0), 10) || 0,
		courseId: db?.courseID != null ? String(db.courseID) : undefined,
		groupIDs: Array.isArray(db?.groupIDs) ? db.groupIDs.map(String) : [],
	};
}
