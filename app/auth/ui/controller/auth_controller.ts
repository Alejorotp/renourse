import { useState } from 'react';
import { AuthenticationUser } from '../../domain/models/authentication_user';
import { AuthenticationUseCase } from '../../domain/use_case/authentication_usecase';

export const useAuthController = (authUseCase: AuthenticationUseCase) => {
  const [user, setUser] = useState<AuthenticationUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await authUseCase.login(email, password);
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const signUp = async (email: string, password: string, userName: string) => {
    try {
      const signedUpUser = await authUseCase.signUp(email, password, userName);
      setUser(signedUpUser);
      setIsLoggedIn(true);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const logout = async () => {
    await authUseCase.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  return {
    user,
    isLoggedIn,
    error,
    login,
    signUp,
    logout,
  };
};
