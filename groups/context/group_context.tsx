import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Group } from '../domain/models/group';
import { GroupController } from '../controller/group_controller';
import { GroupUseCase } from '../domain/use_case/group_usecase';
import { GroupRepository } from '../data/repositories/group_repository';
import { GroupSourceService } from '../data/datasources/remote/group_source_service';

interface GroupContextType {
  groups: Group[];
  userGroups: Group[];
  getAllGroups: (categoryId: string) => Promise<Group[]>;
  createGroup: (maxMembers: number, categoryId: string, groupNumber: number) => Promise<void>;
  joinGroup: (groupId: string, userId: string, categoryId: string) => Promise<boolean>;
  removeMemberFromGroup: (groupId: string, userId: string, categoryId: string) => Promise<boolean>;
  deleteGroup: (id: string, categoryId: string) => Promise<void>;
  getGroupById: (id: string) => Promise<Group[]>;
  loadUserGroups: (userId: string) => Promise<Group[]>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

// Initialize controller singleton
const groupSource = new GroupSourceService();
const groupRepository = new GroupRepository(groupSource);
const groupUseCase = new GroupUseCase(groupRepository);
const groupController = new GroupController(groupUseCase);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);

  useEffect(() => {
    const listener = () => {
      setGroups([...groupController.getGroups()]);
      setUserGroups([...groupController.getUserGroups()]);
    };

    groupController.addListener(listener);
    return () => groupController.removeListener(listener);
  }, []);

  const getAllGroups = async (categoryId: string): Promise<Group[]> => {
    const fetchedGroups = await groupController.getAllGroups(categoryId);
    setGroups(fetchedGroups);
    return fetchedGroups;
  };

  const createGroup = async (maxMembers: number, categoryId: string, groupNumber: number): Promise<void> => {
    await groupController.createGroup(maxMembers, categoryId, groupNumber);
  };

  const joinGroup = async (groupId: string, userId: string, categoryId: string): Promise<boolean> => {
    return await groupController.joinGroup(groupId, userId, categoryId);
  };

  const removeMemberFromGroup = async (groupId: string, userId: string, categoryId: string): Promise<boolean> => {
    return await groupController.removeMemberFromGroup(groupId, userId, categoryId);
  };

  const deleteGroup = async (id: string, categoryId: string): Promise<void> => {
    await groupController.deleteGroup(id, categoryId);
  };

  const getGroupById = async (id: string): Promise<Group[]> => {
    return await groupController.getGroupById(id);
  };

  const loadUserGroups = async (userId: string): Promise<Group[]> => {
    const fetchedUserGroups = await groupController.loadUserGroups(userId);
    setUserGroups(fetchedUserGroups);
    return fetchedUserGroups;
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        userGroups,
        getAllGroups,
        createGroup,
        joinGroup,
        removeMemberFromGroup,
        deleteGroup,
        getGroupById,
        loadUserGroups,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroups = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};
