import { ILocalPreferences } from './i_local_preferences';
import { IAuthenticationSource } from '../auth/data/datasources/i_authentication_source';

/**
 * RefreshClient - Cliente HTTP que automáticamente refresca el token cuando recibe 401.
 * Equivalente a RefreshClient en Flutter que extiende http.BaseClient.
 * 
 * Uso:
 * ```
 * const client = new RefreshClient(prefs, authSource);
 * const response = await client.fetch('https://api.example.com/data');
 * ```
 */
export class RefreshClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(
    private readonly prefs: ILocalPreferences,
    private readonly authSource: IAuthenticationSource
  ) {}

  /**
   * Fetch wrapper que automáticamente añade el token de autorización
   * y refresca el token si recibe 401.
   */
  async fetch(url: string | URL, init?: RequestInit): Promise<Response> {
    // Get token from prefs
    const token = await this.prefs.retrieveData<string>('token');
    
    // Add Authorization header if token exists
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // First attempt
    let response = await fetch(url, {
      ...init,
      headers,
    });

    // If 401, attempt refresh and retry
    if (response.status === 401) {
      console.warn('Token expired (401), attempting to refresh');

      // Check if refresh token exists
      const refreshToken = await this.prefs.retrieveData<string>('refreshToken');
      if (!refreshToken) {
        console.warn('No refresh token present, not attempting refresh');
        return response;
      }

      // Prevent multiple simultaneous refresh attempts
      if (this.isRefreshing && this.refreshPromise) {
        await this.refreshPromise;
      } else {
        this.isRefreshing = true;
        this.refreshPromise = this.authSource.refreshToken();
        
        try {
          const ok = await this.refreshPromise;
          if (!ok) {
            console.error('Token refresh failed');
            return response;
          }
        } finally {
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      }

      // Get new token and retry
      const newToken = await this.prefs.retrieveData<string>('token');
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(url, {
          ...init,
          headers,
        });
      }
    }

    return response;
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get(url: string | URL, init?: RequestInit): Promise<Response> {
    return this.fetch(url, { ...init, method: 'GET' });
  }

  async post(url: string | URL, body?: any, init?: RequestInit): Promise<Response> {
    return this.fetch(url, {
      ...init,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }

  async put(url: string | URL, body?: any, init?: RequestInit): Promise<Response> {
    return this.fetch(url, {
      ...init,
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }

  async patch(url: string | URL, body?: any, init?: RequestInit): Promise<Response> {
    return this.fetch(url, {
      ...init,
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }

  async delete(url: string | URL, init?: RequestInit): Promise<Response> {
    return this.fetch(url, { ...init, method: 'DELETE' });
  }
}
