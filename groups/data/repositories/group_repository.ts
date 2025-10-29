import { Group } from '../../domain/models/group';
import { IGroupRepository } from '../../domain/repositories/i_group_repository';
import { IGroupSource } from '../datasources/i_group_source';

export class GroupRepository implements IGroupRepository {
  constructor(private groupSource: IGroupSource) {}

  async getAllGroups(categoryId: string): Promise<Group[]> {
    return this.groupSource.getAllGroups(categoryId);
  }

  async getGroupById(id: string): Promise<Group[]> {
    return this.groupSource.getGroupById(id);
  }

  async createGroup(maxMembers: number, categoryId: string, groupNumber: number): Promise<Group> {
    return this.groupSource.createGroup(maxMembers, categoryId, groupNumber);
  }

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    return this.groupSource.joinGroup(groupId, userId);
  }

  async removeMemberFromGroup(groupId: string, userId: string): Promise<boolean> {
    return this.groupSource.removeMemberFromGroup(groupId, userId);
  }

  async deleteGroup(id: string): Promise<void> {
    return this.groupSource.deleteGroup(id);
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    return this.groupSource.getUserGroups(userId);
  }
}
