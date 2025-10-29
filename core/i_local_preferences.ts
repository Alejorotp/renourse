export interface ILocalPreferences {
  retrieveData<T>(key: string): Promise<T | null>;
  storeData(key: string, value: any): Promise<void>;
  removeData(key: string): Promise<void>;
  clearAll(): Promise<void>;
}
