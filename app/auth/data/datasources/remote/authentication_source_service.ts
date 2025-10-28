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
    return response.status === 201;
  }

  async logOut(): Promise<boolean> {
    console.log('Attempting logout');
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
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
      console.error('No refresh token found');
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
