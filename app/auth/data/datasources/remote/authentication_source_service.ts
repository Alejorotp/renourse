import { IAuthenticationSource } from '../i_authentication_source';

const API_URL = 'https://your-api-url.com/api'; // Replace with your API URL

export class AuthenticationSourceService implements IAuthenticationSource {
  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async signUp(email: string, password: string, userName: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, userName }),
    });

    if (!response.ok) {
      throw new Error('Sign up failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    // Implement logout logic, e.g., call a logout endpoint
    console.log('Logged out');
  }
}
