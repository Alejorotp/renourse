import { Group } from '../models/group';
import { IGroupRepository } from '../repositories/i_group_repository';

export class GroupUseCase {
  constructor(private repository: IGroupRepository) {}

  async getAllGroups(categoryId: string): Promise<Group[]> {
    return this.repository.getAllGroups(categoryId);
  }

  async getGroupById(id: string): Promise<Group[]> {
    return this.repository.getGroupById(id);
  }

  async createGroup(maxMembers: number, categoryId: string, groupNumber: number): Promise<Group> {
    return this.repository.createGroup(maxMembers, categoryId, groupNumber);
  }

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    return this.repository.joinGroup(groupId, userId);
  }

  async removeMemberFromGroup(groupId: string, userId: string): Promise<boolean> {
    return this.repository.removeMemberFromGroup(groupId, userId);
  }

  async deleteGroup(id: string): Promise<void> {
    return this.repository.deleteGroup(id);
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    return this.repository.getUserGroups(userId);
  }
}
