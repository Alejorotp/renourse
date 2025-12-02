import * as SecureStore from 'expo-secure-store';
import { AuthenticationUser, LoginAuthenticationUser, SignupAuthenticationUser } from '../../../domain/models/authentication_user';
import { IAuthenticationSource } from '../i_authentication_source';

const AUTH_URL = 'https://roble-api.openlab.uninorte.edu.co/auth/flourse_460df99409';
const DB_URL = 'https://roble-api.openlab.uninorte.edu.co/database/flourse_460df99409';

export class AuthenticationSourceService implements IAuthenticationSource {

  async login(user: LoginAuthenticationUser): Promise<AuthenticationUser> {
    console.log(`Attempting login for email: ${user.email}`);
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    console.log(`Login response status: ${response.status}`);
    const responseData = await response.json();
    console.log(`Login response body: ${JSON.stringify(responseData)}`);

    if (!response.ok) {
      throw new Error(responseData.message || 'Login failed');
    }

    const authUser: AuthenticationUser = {
      id: responseData.user.id,
      email: responseData.user.email,
      name: responseData.user.name,
      accessToken: responseData.accessToken,
      refreshToken: responseData.refreshToken,
    };

    // Sync user to DB if missing
    try {
      const checkUrl = `${DB_URL}/read?tableName=AuthenticationUser&UID=${encodeURIComponent(authUser.id)}`;
      const checkRes = await fetch(checkUrl, {
        headers: { 'Authorization': `Bearer ${authUser.accessToken}` }
      });

      let userExists = false;
      if (checkRes.ok) {
        const list = await checkRes.json();
        if (Array.isArray(list) && list.length > 0) {
          userExists = true;
        }
      }

      if (!userExists) {
        console.log('[AuthenticationSourceService] User missing in DB, inserting...');
        const insertRes = await fetch(`${DB_URL}/insert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authUser.accessToken}`
          },
          body: JSON.stringify({
            tableName: 'AuthenticationUser',
            records: [{
              UID: authUser.id,
              name: authUser.name,
              email: authUser.email
            }]
          })
        });
        console.log('[AuthenticationSourceService] User sync status:', insertRes.status);
      }
    } catch (e) {
      console.error('[AuthenticationSourceService] Error syncing user to DB:', e);
    }

    // Store tokens and user info securely

    await SecureStore.setItemAsync('user', JSON.stringify({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
    }));

    await SecureStore.setItemAsync('token', authUser.accessToken);
    await SecureStore.setItemAsync('refreshToken', authUser.refreshToken);

    return authUser;
  }

  async signUp(user: SignupAuthenticationUser): Promise<boolean> {
    console.log(`Attempting sign up for email: ${user.email}`);
    const response = await fetch(`${AUTH_URL}/signup-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    console.log(`Sign up response status: ${response.status}`);

    if (response.status === 201) {
      // We need to login to get the token to insert into DB, or use a master token if available.
      // Since we don't have a token yet, we might rely on the user logging in afterwards to sync.
      // However, the user requested sync on signup. 
      // The signup-direct endpoint might return a token? Let's check the logs or assume we need to login.
      // If signup-direct doesn't return a token, we can't insert into DB immediately unless the DB is open.
      // Assuming DB requires auth.
      // Strategy: Login immediately after signup to get token and sync.

      try {
        // Auto-login to sync
        const loginRes = await fetch(`${AUTH_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, password: user.password })
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          const token = loginData.accessToken;
          const uid = loginData.user.id;

          console.log('[AuthenticationSourceService] Syncing new user to DB...');
          await fetch(`${DB_URL}/insert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              tableName: 'AuthenticationUser',
              records: [{
                UID: uid,
                name: user.name,
                email: user.email
              }]
            })
          });
        }
      } catch (e) {
        console.error('[AuthenticationSourceService] Error syncing new user:', e);
      }

      return true;
    }

    return false;
  }

  async logOut(): Promise<boolean> {
    console.log('Attempting logout');
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    return true;
  }

  async validate(email: string, validationCode: string): Promise<boolean> {
    console.log(`Attempting email validation for email: ${email}`);
    // This should be implemented based on your API
    return true;
  }

  async refreshToken2(rToken: string): Promise<string | null> {
    console.log('Attempting token refresh');
    try {
      const response = await fetch(`${AUTH_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: rToken }),
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        return accessToken;
      }
      return null;
    } catch (e) {
      console.error('Error refreshing token:', e);
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    console.log('Attempting token refresh');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) {
      console.warn('Skipping token refresh: no refresh token found');
      return false;
    }

    try {
      const response = await fetch(`${AUTH_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        await SecureStore.setItemAsync('token', accessToken);
        console.log('Token refreshed successfully');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error refreshing token:', e);
      return false;
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    console.log(`Attempting password reset for email: ${email}`);
    // This should be implemented based on your API
    return true;
  }

  async resetPassword(email: string, newPassword: string, validationCode: string): Promise<boolean> {
    // This should be implemented based on your API
    return true;
  }

  async verifyToken(accessToken: string): Promise<boolean> {
    console.log('Attempting token verification');
    const response = await fetch(`${AUTH_URL}/verify-token`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.status === 200; // Or 201 as in your dart code
  }
}
