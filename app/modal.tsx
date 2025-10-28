import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthSession } from '../auth/context/auth_context';

export default function Central() {
  const { isLoggedIn, user, checkLoggedIn } = useAuthSession();

  useEffect(() => {
    checkLoggedIn();
  }, [checkLoggedIn]);

  console.log('Central Component - isLoggedIn:', isLoggedIn, 'user:', user);

  if (isLoggedIn && user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
