import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from './auth/context/auth_context';
import { useAuthController } from './auth/ui/controller/auth_controller';
import LoginPage from './auth/ui/pages/login';

export default function Central() {
  const authUseCase = useAuth();
  const { isLoggedIn, user, checkUser, checkToken } = useAuthController(authUseCase);

  useEffect(() => {
    // Here you would typically check for a stored token and validate it
    // For now, we'll just rely on the in-memory state
    checkToken();
    checkUser();
  }, []);

  console.log('Central Component - isLoggedIn:', isLoggedIn, 'user:', user);

  if (isLoggedIn && user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <LoginPage />;
  }
}
