import { getRefreshClient } from '@/core';
import * as SecureStore from 'expo-secure-store';

const DB_BASE = 'https://roble-api.openlab.uninorte.edu.co/database';
const DB_NAME = 'flourse_460df99409';

async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('token');
  } catch {
    return null;
  }
}

async function get(url: string): Promise<Response> {
  const refreshClient = getRefreshClient();
  if (refreshClient) {
    return refreshClient.get(url);
  }
  
  const token = await getToken();
  const res = await fetch(url, { 
    headers: { 
      'Authorization': token ? `Bearer ${token}` : '' 
    } 
  });
  return res;
}

export async function getUserNameById(userId: string): Promise<string> {
  const url = `${DB_BASE}/${DB_NAME}/read?tableName=AuthenticationUser&UID=${encodeURIComponent(userId)}`;
  try {
    const res = await get(url);
    if (!res.ok) return 'Usuario Desconocido';
    const list = await res.json();
    const first = Array.isArray(list) && list.length ? list[0] : null;
    return first?.name ?? 'Usuario Desconocido';
  } catch {
    return 'Usuario Desconocido';
  }
}
