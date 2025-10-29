import * as SecureStore from 'expo-secure-store';
import { Group, groupFromJson } from '../../../domain/models/group';
import { IGroupSource } from '../i_group_source';
import { getRefreshClient } from '@/core';

const DATABASE_NAME = 'flourse_460df99409';
const API_BASE_URL = 'https://roble-api.openlab.uninorte.edu.co/database';

export class GroupSourceService implements IGroupSource {
  private async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('token');
  }

  private async get(url: string): Promise<Response> {
    const refreshClient = getRefreshClient();
    if (refreshClient) {
      return refreshClient.get(url);
    }
    
    const token = await this.getToken();
    if (!token) throw new Error('No token found');
    
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  private async post(url: string, body: any): Promise<Response> {
    const refreshClient = getRefreshClient();
    if (refreshClient) {
      return refreshClient.post(url, body);
    }
    
    const token = await this.getToken();
    if (!token) throw new Error('No token found');
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  private async delete(url: string, body: any): Promise<Response> {
    const refreshClient = getRefreshClient();
    if (refreshClient) {
      return refreshClient.delete(url, body);
    }
    
    const token = await this.getToken();
    if (!token) throw new Error('No token found');
    
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async getAllGroups(categoryId: string): Promise<Group[]> {
    console.log('Fetching all groups from API for category:', categoryId);
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=Group&categoryID=${categoryId}`
      );

      if (response.status === 200) {
        const jsonList = await response.json();
        console.log('Groups fetch response:', jsonList);

        const fetchedGroups: Group[] = [];
        for (const data of jsonList) {
          // Fetch members for this group
          const memberIDsResponse = await this.get(
            `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=GroupMember&groupID=${data._id}`
          );

          let memberIDs: string[] = [];
          if (memberIDsResponse.status === 200) {
            const memberList = await memberIDsResponse.json();
            memberIDs = memberList.map((member: any) => member.userID as string);
            console.log(`Fetched memberIDs for group ${data._id}:`, memberIDs);
          } else {
            console.error(`Failed to fetch memberIDs for group ${data._id}:`, memberIDsResponse.status);
          }

          const group: Group = {
            id: data._id as string,
            memberIDs,
            categoryID: data.categoryID as string,
            groupNumber: data.groupNumber || 0,
          };
          
          console.log('Fetched group:', group);
          fetchedGroups.push(group);
        }
        return fetchedGroups;
      } else {
        console.error('Failed to fetch groups:', response.status);
        return [];
      }
    } catch (e) {
      console.error('Error fetching groups:', e);
      return [];
    }
  }

  async getGroupById(id: string): Promise<Group[]> {
    console.log('Fetching group by ID from API:', id);
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=Group&_id=${id}`
      );

      if (response.status === 200) {
        const jsonList = await response.json();
        return jsonList.map((data: any) => groupFromJson(data));
      }
      return [];
    } catch (e) {
      console.error('Error fetching group by ID:', e);
      return [];
    }
  }

  async createGroup(maxMembers: number, categoryId: string, groupNumber: number): Promise<Group> {
    console.log('Creating group on API with maxMembers:', maxMembers, 'for category:', categoryId);
    try {
      const response = await this.post(
        `${API_BASE_URL}/${DATABASE_NAME}/insert`,
        {
          tableName: 'Group',
          records: [
            {
              groupNumber,
              categoryID: categoryId,
            },
          ],
        }
      );

      if (response.status === 201) {
        const responseData = await response.json();
        console.log('Group creation response:', responseData);

        if (responseData.inserted && responseData.inserted.length > 0) {
          console.log('Group created successfully:', responseData.inserted[0]._id);
          return {
            id: responseData.inserted[0]._id as string,
            memberIDs: [],
            categoryID: categoryId,
            groupNumber,
          };
        }
      }
      console.error('Failed to create group:', response.status);
      throw new Error('Failed to create group');
    } catch (e) {
      console.error('Error creating group:', e);
      throw e;
    }
  }

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    console.log('User with ID:', userId, 'joining group with ID:', groupId);
    try {
      const response = await this.post(
        `${API_BASE_URL}/${DATABASE_NAME}/insert`,
        {
          tableName: 'GroupMember',
          records: [
            {
              groupID: groupId,
              userID: userId,
            },
          ],
        }
      );

      if (response.status === 201) {
        return true;
      } else {
        console.warn('Failed to join group:', response.status);
      }
    } catch (e) {
      console.error('Error joining group:', e);
    }
    return false;
  }

  async removeMemberFromGroup(groupId: string, userId: string): Promise<boolean> {
    console.log('User with ID:', userId, 'being removed from group with ID:', groupId);

    try {
      // First, fetch the GroupMember record to get its ID
      const groupMemberResponse = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=GroupMember&groupID=${groupId}&userID=${userId}`
      );

      if (groupMemberResponse.status !== 200) {
        console.error(`Failed to fetch GroupMember for user ${userId} in group ${groupId}:`, groupMemberResponse.status);
        return false;
      }

      const groupMemberList = await groupMemberResponse.json();
      if (groupMemberList.length === 0) {
        console.warn(`No GroupMember found for user ${userId} in group ${groupId}`);
        return false;
      }

      const groupMemberId = groupMemberList[0]._id as string;
      console.log(`Found GroupMember ID: ${groupMemberId} for user ${userId} in group ${groupId}`);

      // Now delete the GroupMember record
      const response = await this.delete(
        `${API_BASE_URL}/${DATABASE_NAME}/delete`,
        {
          tableName: 'GroupMember',
          idColumn: '_id',
          idValue: groupMemberId,
        }
      );

      console.log('Remove member response status:', response.status);
      
      if (response.status === 401) {
        console.error('Unauthorized: Invalid or expired token.');
        return false;
      }

      return response.status === 200;
    } catch (e) {
      console.error('Error removing member from group:', e);
    }
    return false;
  }

  async deleteGroup(id: string): Promise<void> {
    console.log('Deleting group with id:', id);
    try {
      const response = await this.delete(
        `${API_BASE_URL}/${DATABASE_NAME}/delete`,
        {
          tableName: 'Group',
          idColumn: '_id',
          idValue: id,
        }
      );

      if (response.status === 200) {
        console.log(`Group ${id} deleted successfully`);
      } else {
        console.warn(`Failed to delete group ${id}:`, response.status);
      }
    } catch (e) {
      console.error('Error deleting group:', e);
    }
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    console.log('Fetching groups for user with ID:', userId);
    try {
      const response = await this.get(
        `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=GroupMember&userID=${userId}`
      );

      if (response.status === 200) {
        const jsonList = await response.json();
        console.log(`Fetched ${jsonList.length} group memberships for user ${userId}`);

        const userGroups: Group[] = [];
        for (const data of jsonList) {
          const groupId = data.groupID as string;
          const groupResponse = await this.get(
            `${API_BASE_URL}/${DATABASE_NAME}/read?tableName=Group&_id=${groupId}`
          );

          if (groupResponse.status === 200) {
            const groupList = await groupResponse.json();
            if (groupList.length > 0) {
              userGroups.push(groupFromJson(groupList[0]));
              console.log(`Added group ${groupList[0]._id} to user ${userId}'s groups`);
            }
          } else {
            console.warn(`Failed to fetch group ${groupId} for user ${userId}:`, groupResponse.status);
          }
        }
        return userGroups;
      } else {
        console.warn('Failed to fetch user groups:', response.status);
      }
    } catch (e) {
      console.error('Error fetching user groups:', e);
    }
    return [];
  }
}
