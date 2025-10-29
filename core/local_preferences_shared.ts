import { ILocalPreferences } from './i_local_preferences';

/**
 * LocalPreferencesShared - implementación de almacenamiento no seguro.
 * Para web usa localStorage, para nativo podríamos agregar AsyncStorage.
 * Equivalente a SharedPreferences en Flutter.
 * Ideal para preferencias de usuario, configuraciones no sensibles.
 */
export class LocalPreferencesShared implements ILocalPreferences {
  private getStorage(): Storage | null {
    // Check if we're in a web environment
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    // For native, we'd need @react-native-async-storage/async-storage
    // For now, we'll use a fallback in-memory store
    console.warn('LocalPreferencesShared: localStorage not available, using in-memory fallback');
    return null;
  }

  private inMemoryStore: Map<string, string> = new Map();

  async retrieveData<T>(key: string): Promise<T | null> {
    try {
      const storage = this.getStorage();
      const raw = storage ? storage.getItem(key) : this.inMemoryStore.get(key);
      
      if (raw === null || raw === undefined) return null;

      // Type inference
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
      console.error(`Error retrieving shared data for key ${key}:`, e);
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

      const storage = this.getStorage();
      if (storage) {
        storage.setItem(key, valueToStore);
      } else {
        this.inMemoryStore.set(key, valueToStore);
      }
    } catch (e) {
      console.error(`Error storing shared data for key ${key}:`, e);
      throw e;
    }
  }

  async removeData(key: string): Promise<void> {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(key);
      } else {
        this.inMemoryStore.delete(key);
      }
    } catch (e) {
      console.error(`Error removing shared data for key ${key}:`, e);
      throw e;
    }
  }

  async clearAll(): Promise<void> {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.clear();
      } else {
        this.inMemoryStore.clear();
      }
    } catch (e) {
      console.error('Error clearing all shared data:', e);
      throw e;
    }
  }
}
