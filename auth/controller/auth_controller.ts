import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthenticationUser, LoginAuthenticationUser, SignupAuthenticationUser } from '../domain/models/authentication_user';
import { AuthenticationUseCase } from '../domain/use_case/authentication_usecase';

export const useAuthController = (authUseCase: AuthenticationUseCase) => {
  const [user, setUser] = useState<AuthenticationUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLoggedIn = useCallback(async () => {
    setIsLoading(true);
    try {
      let isValid = await authUseCase.verifyToken();

      if (!isValid) {
        try {
          isValid = await authUseCase.refreshToken();
        } catch (e) {
          isValid = false;
        }
      }

      setIsLoggedIn(isValid);

      if (isValid) {
        try {
          const storedUser = await SecureStore.getItemAsync('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (e) {
          setUser(null);
        }
        setError(null);
      } else {
        setUser(null);
      }
    } catch (e) {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [authUseCase]);

  useEffect(() => {
    checkLoggedIn();
  }, [checkLoggedIn]);

  const login = useCallback(async (user: LoginAuthenticationUser) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authUseCase.login(user);
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setError(null);
      return loggedInUser;
    } catch (e: any) {
      const message = e?.message ?? 'Login failed';
      setError(message);
      const errorToThrow = e instanceof Error ? e : new Error(message);
      throw errorToThrow;
    } finally {
      setIsLoading(false);
    }
  }, [authUseCase]);

  const signUp = useCallback(async (user: SignupAuthenticationUser) => {
    setIsLoading(true);
    try {
      const success = await authUseCase.signUp(user);
      if (!success) {
        throw new Error('Sign up failed');
      }
      await login({ email: user.email, password: user.password });
      setError(null);
      return true;
    } catch (e: any) {
      const message = e?.message ?? 'Sign up failed';
      setError(message);
      const errorToThrow = e instanceof Error ? e : new Error(message);
      throw errorToThrow;
    } finally {
      setIsLoading(false);
    }
  }, [authUseCase, login]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authUseCase.logOut();
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
    } catch (e: any) {
      const message = e?.message ?? 'Logout failed';
      setError(message);
      const errorToThrow = e instanceof Error ? e : new Error(message);
      throw errorToThrow;
    } finally {
      setIsLoading(false);
    }
  }, [authUseCase]);

  return useMemo(() => ({
    user,
    isLoggedIn,
    isLoading,
    error,
    // Expose checks so consumers (e.g., modal) can invoke them on mount
    checkLoggedIn,
    login,
    signUp,
    logout,
  }), [user, isLoggedIn, isLoading, error, checkLoggedIn, login, signUp, logout]);
};
