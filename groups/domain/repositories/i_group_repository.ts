import { Group } from '../models/group';

export interface IGroupRepository {
  getAllGroups(categoryId: string): Promise<Group[]>;
  getGroupById(id: string): Promise<Group[]>;
  createGroup(maxMembers: number, categoryId: string, groupNumber: number): Promise<Group>;
  joinGroup(groupId: string, userId: string): Promise<boolean>;
  removeMemberFromGroup(groupId: string, userId: string): Promise<boolean>;
  deleteGroup(id: string): Promise<void>;
  getUserGroups(userId: string): Promise<Group[]>;
  autoGenerateRandomGroups(params: { categoryId: string; maxMembers: number; courseId: string }): Promise<Group[]>;
}
