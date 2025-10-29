import * as SecureStore from 'expo-secure-store';
import { ILocalPreferences } from './i_local_preferences';

/**
 * LocalPreferencesSecured - implementación de almacenamiento seguro usando expo-secure-store.
 * Equivalente a FlutterSecureStorage en Flutter.
 * Ideal para tokens, credenciales y datos sensibles.
 */
export class LocalPreferencesSecured implements ILocalPreferences {
  async retrieveData<T>(key: string): Promise<T | null> {
    try {
      const raw = await SecureStore.getItemAsync(key);
      if (raw === null) return null;

      // Type inference based on generic T
      const typeStr = typeof ({} as T);
      
      if (typeStr === 'string') {
        return raw as unknown as T;
      } else if (typeStr === 'boolean') {
        return (raw.toLowerCase() === 'true') as unknown as T;
      } else if (typeStr === 'number') {
        const parsed = Number(raw);
        return (isNaN(parsed) ? null : parsed) as unknown as T;
      } else {
        // For complex types (objects, arrays), parse JSON
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T;
        }
      }
    } catch (e) {
      console.error(`Error retrieving secure data for key ${key}:`, e);
      return null;
    }
  }

  async storeData(key: string, value: any): Promise<void> {
    try {
      let valueToStore: string;
      
      if (typeof value === 'string') {
        valueToStore = value;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        valueToStore = String(value);
      } else if (typeof value === 'object') {
        valueToStore = JSON.stringify(value);
      } else {
        throw new Error(`Unsupported type: ${typeof value}`);
      }

      await SecureStore.setItemAsync(key, valueToStore);
    } catch (e) {
      console.error(`Error storing secure data for key ${key}:`, e);
      throw e;
    }
  }

  async removeData(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error(`Error removing secure data for key ${key}:`, e);
      throw e;
    }
  }

  async clearAll(): Promise<void> {
    // SecureStore doesn't have a clearAll, so we'd need to track keys manually
    // For now, implement clearing known keys or throw not implemented
    console.warn('clearAll not fully implemented for SecureStore - clear keys individually');
  }
}
