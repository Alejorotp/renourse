import { Group } from '../domain/models/group';
import { GroupUseCase } from '../domain/use_case/group_usecase';

export class GroupController {
  private groups: Group[] = [];
  private userGroups: Group[] = [];
  private listeners: (() => void)[] = [];

  constructor(private groupUseCase: GroupUseCase) {}

  getGroups(): Group[] {
    return this.groups;
  }

  getUserGroups(): Group[] {
    return this.userGroups;
  }

  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  async createGroup(maxMembers: number, categoryId: string, groupNumber: number): Promise<void> {
    try {
      const newGroup = await this.groupUseCase.createGroup(maxMembers, categoryId, groupNumber);
      console.log('Group created successfully:', newGroup);
      await this.getAllGroups(categoryId);
    } catch (e) {
      console.error('Error creating group:', e);
      throw e;
    }
  }

  async deleteGroup(id: string, categoryId: string): Promise<void> {
    try {
      await this.groupUseCase.deleteGroup(id);
      console.log('Group with id', id, 'deleted successfully');
      await this.getAllGroups(categoryId);
    } catch (e) {
      console.error('Error deleting group:', e);
      throw e;
    }
  }

  async getAllGroups(categoryId: string): Promise<Group[]> {
    console.log('[GroupController] getAllGroups →', categoryId);
    const fetchedGroups = await this.groupUseCase.getAllGroups(categoryId);
    this.groups = fetchedGroups;
    console.log('[GroupController] getAllGroups ← count', fetchedGroups.length);
    this.notifyListeners();
    return fetchedGroups;
  }

  async ensureRandomGroups(params: { categoryId: string; maxMembers: number; courseId: string }): Promise<Group[]> {
    // If there are no groups yet for this category, auto-generate for Aleatorio
    const current = await this.groupUseCase.getAllGroups(params.categoryId);
    if (current.length > 0) return current;
    const created = await this.groupUseCase.autoGenerateRandomGroups(params);
    // Refresh state
    const refreshed = await this.groupUseCase.getAllGroups(params.categoryId);
    this.groups = refreshed;
    this.notifyListeners();
    return created;
  }

  async joinGroup(groupId: string, userId: string, categoryId: string): Promise<boolean> {
    const result = await this.groupUseCase.joinGroup(groupId, userId);
    if (result) {
      console.log('User', userId, 'joined group', groupId);
    } else {
      console.warn('User', userId, 'could not join group', groupId);
    }
    await this.getAllGroups(categoryId);
    return result;
  }

  async removeMemberFromGroup(groupId: string, userId: string, categoryId: string): Promise<boolean> {
    const result = await this.groupUseCase.removeMemberFromGroup(groupId, userId);
    if (result) {
      console.log('User', userId, 'removed from group', groupId);
    } else {
      console.warn('User', userId, 'could not be removed from group', groupId);
    }
    await this.getAllGroups(categoryId);
    return result;
  }

  async getGroupById(id: string): Promise<Group[]> {
    try {
      return await this.groupUseCase.getGroupById(id);
    } catch (e) {
      console.error('Error fetching group by ID:', e);
      return [];
    }
  }

  async loadUserGroups(userId: string): Promise<Group[]> {
    try {
      const userGroups = await this.groupUseCase.getUserGroups(userId);
      console.log('Fetched groups for user ID:', userId);
      this.userGroups = userGroups;
      this.notifyListeners();
      return userGroups;
    } catch (e) {
      console.error('Error fetching user groups:', e);
      return [];
    }
  }
}
