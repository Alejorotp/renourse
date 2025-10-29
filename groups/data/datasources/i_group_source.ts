import { Group } from '../../domain/models/group';

export interface IGroupSource {
  getAllGroups(categoryId: string): Promise<Group[]>;
  getGroupById(id: string): Promise<Group[]>;
  createGroup(maxMembers: number, categoryId: string, groupNumber: number): Promise<Group>;
  joinGroup(groupId: string, userId: string): Promise<boolean>;
  removeMemberFromGroup(groupId: string, userId: string): Promise<boolean>;
  deleteGroup(id: string): Promise<void>;
  getUserGroups(userId: string): Promise<Group[]>;
}
