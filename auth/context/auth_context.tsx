import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthController } from '../controller/auth_controller';
import { AuthenticationSourceService } from '../data/datasources/remote/authentication_source_service';
import { AuthRepository } from '../data/repositories/auth_repository';
import { AuthenticationUseCase } from '../domain/use_case/authentication_usecase';
import { getRefreshClient } from '@/core';

const authSource = new AuthenticationSourceService();
const authRepository = new AuthRepository(authSource);
const authUseCase = new AuthenticationUseCase(authRepository);

type AuthContextValue = {
  useCase: AuthenticationUseCase;
  controller: ReturnType<typeof useAuthController>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const controller = useAuthController(authUseCase);
  const value = useMemo(() => ({ useCase: authUseCase, controller }), [controller]);

  // Initialize RefreshClient with authSource on mount
  useEffect(() => {
    getRefreshClient(authSource);
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context.useCase;
};

export const useAuthSession = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthSession must be used within an AuthProvider');
  }
  return context.controller;
};
