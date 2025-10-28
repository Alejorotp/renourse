import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { AuthenticationUser, LoginAuthenticationUser, SignupAuthenticationUser } from '../../domain/models/authentication_user';
import { AuthenticationUseCase } from '../../domain/use_case/authentication_usecase';

export const useAuthController = (authUseCase: AuthenticationUseCase) => {
  const [user, setUser] = useState<AuthenticationUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const isValid = await authUseCase.verifyToken();
      setIsLoggedIn(isValid);
      if (!isValid) {
        const refreshed = await authUseCase.refreshToken();
        setIsLoggedIn(refreshed);
      }
    };
    const checkUser = async () => {
      const tokenValid = await authUseCase.verifyToken();
      if (tokenValid) {
        const storedUser = await SecureStore.getItemAsync('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };
    checkToken();
    checkUser();
  }, [authUseCase]);

  const login = async (user: LoginAuthenticationUser) => {
    try {
      const loggedInUser = await authUseCase.login(user);
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const signUp = async (user: SignupAuthenticationUser) => {
    try {
      const success = await authUseCase.signUp(user);
      if (success) {
        await login({ email: user.email, password: user.password });
      } else {
        throw new Error('Sign up failed');
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const logout = async () => {
    await authUseCase.logOut();
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
