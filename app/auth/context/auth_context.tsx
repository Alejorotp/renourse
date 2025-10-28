import React, { createContext, useContext } from 'react';
import { AuthenticationSourceService } from '../data/datasources/remote/authentication_source_service';
import { AuthRepository } from '../data/repositories/auth_repository';
import { AuthenticationUseCase } from '../domain/use_case/authentication_usecase';

const authSource = new AuthenticationSourceService();
const authRepository = new AuthRepository(authSource);
const authUseCase = new AuthenticationUseCase(authRepository);

const AuthContext = createContext(authUseCase);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthContext.Provider value={authUseCase}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
