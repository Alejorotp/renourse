import { ILocalPreferences } from './i_local_preferences';
import { LocalPreferencesSecured } from './local_preferences_secured';
import { LocalPreferencesShared } from './local_preferences_shared';
import { RefreshClient } from './refresh_client';

/**
 * Global core services instances
 * Proporciona acceso singleton a los servicios core de la aplicación
 */

// Singleton instances
let securedPrefsInstance: ILocalPreferences | null = null;
let sharedPrefsInstance: ILocalPreferences | null = null;
let refreshClientInstance: RefreshClient | null = null;

/**
 * Get or create secured preferences instance
 */
export function getSecuredPrefs(): ILocalPreferences {
  if (!securedPrefsInstance) {
    securedPrefsInstance = new LocalPreferencesSecured();
  }
  return securedPrefsInstance;
}

/**
 * Get or create shared preferences instance
 */
export function getSharedPrefs(): ILocalPreferences {
  if (!sharedPrefsInstance) {
    sharedPrefsInstance = new LocalPreferencesShared();
  }
  return sharedPrefsInstance;
}

/**
 * Initialize and get RefreshClient instance
 * Requires auth source to be provided on first call
 */
export function getRefreshClient(authSource?: any): RefreshClient | null {
  if (!refreshClientInstance && authSource) {
    const prefs = getSecuredPrefs();
    refreshClientInstance = new RefreshClient(prefs, authSource);
  }
  return refreshClientInstance;
}

/**
 * Reset all core services (useful for logout)
 */
export function resetCoreServices(): void {
  securedPrefsInstance = null;
  sharedPrefsInstance = null;
  refreshClientInstance = null;
}
