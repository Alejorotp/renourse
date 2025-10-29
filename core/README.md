# Core Module

Módulo central que replica la funcionalidad del core de Flutter, proporcionando servicios esenciales de almacenamiento local y cliente HTTP con refresh automático de tokens.

## Componentes

### 1. ILocalPreferences
Interfaz base para implementaciones de almacenamiento local.

```typescript
interface ILocalPreferences {
  retrieveData<T>(key: string): Promise<T | null>;
  storeData(key: string, value: any): Promise<void>;
  removeData(key: string): Promise<void>;
  clearAll(): Promise<void>;
}
```

### 2. LocalPreferencesSecured
Implementación de almacenamiento **seguro** usando `expo-secure-store`.
- Ideal para: tokens de autenticación, credenciales, información sensible
- Encriptado en el dispositivo
- Equivalente a `FlutterSecureStorage` en Flutter

**Uso:**
```typescript
import { LocalPreferencesSecured } from '@/core';

const securePrefs = new LocalPreferencesSecured();

// Guardar token
await securePrefs.storeData('token', 'abc123...');

// Recuperar token
const token = await securePrefs.retrieveData<string>('token');

// Remover dato
await securePrefs.removeData('token');
```

### 3. LocalPreferencesShared
Implementación de almacenamiento **no seguro** usando localStorage (web) o memoria (nativo).
- Ideal para: preferencias de UI, configuración de usuario, caché no sensible
- Equivalente a `SharedPreferences` en Flutter

**Uso:**
```typescript
import { LocalPreferencesShared } from '@/core';

const sharedPrefs = new LocalPreferencesShared();

// Guardar preferencia
await sharedPrefs.storeData('theme', 'dark');
await sharedPrefs.storeData('fontSize', 16);
await sharedPrefs.storeData('notifications', true);

// Recuperar preferencia
const theme = await sharedPrefs.retrieveData<string>('theme');
const fontSize = await sharedPrefs.retrieveData<number>('fontSize');
const notifications = await sharedPrefs.retrieveData<boolean>('notifications');
```

### 4. RefreshClient
Cliente HTTP que automáticamente:
- Añade el header `Authorization: Bearer <token>` a todas las peticiones
- Detecta respuestas 401 (Unauthorized)
- Refresca el token automáticamente usando el refresh token
- Reintenta la petición con el nuevo token

Equivalente a `RefreshClient` en Flutter que extiende `http.BaseClient`.

**Uso:**
```typescript
import { RefreshClient } from '@/core';

const client = new RefreshClient(preferences, authSource);

// GET request
const response = await client.get('https://api.example.com/data');

// POST request
const response = await client.post('https://api.example.com/data', {
  name: 'John',
  age: 30
});

// Otros métodos disponibles
await client.put(url, body);
await client.patch(url, body);
await client.delete(url);
```

### 5. Services (Singletons)
Funciones helper para acceso global a instancias singleton de los servicios core.

```typescript
import { getSecuredPrefs, getSharedPrefs, getRefreshClient } from '@/core';

// Obtener instancia de preferencias seguras
const securedPrefs = getSecuredPrefs();

// Obtener instancia de preferencias compartidas
const sharedPrefs = getSharedPrefs();

// Obtener/inicializar RefreshClient (requiere authSource en primera llamada)
const refreshClient = getRefreshClient(authSource);

// Reset de todos los servicios (útil en logout)
resetCoreServices();
```

## Integración en el Proyecto

### 1. AuthProvider
El `RefreshClient` se inicializa automáticamente en el `AuthProvider`:

```typescript
// auth/context/auth_context.tsx
export const AuthProvider = ({ children }) => {
  useEffect(() => {
    getRefreshClient(authSource); // Inicializa RefreshClient
  }, []);
  // ...
};
```

### 2. CourseSourceService
El servicio de cursos usa `RefreshClient` automáticamente si está disponible:

```typescript
// courses/data/datasources/remote/course_source_service.ts
private async get(url: string) {
  const refreshClient = getRefreshClient();
  if (refreshClient) {
    return refreshClient.get(url); // Usa RefreshClient con auto-refresh
  }
  // Fallback a fetch directo
  const token = await this.getToken();
  return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
}
```

## Ventajas

1. **Separación de responsabilidades**: Lógica de almacenamiento y HTTP centralizada
2. **Refresh automático**: No hay que manejar 401 manualmente en cada petición
3. **Type-safe**: Soporte completo de TypeScript con genéricos
4. **Multiplataforma**: Compatible con web y nativo via Expo
5. **Paridad con Flutter**: Misma arquitectura facilita migración de lógica

## Tipos Soportados

Los métodos `retrieveData<T>` y `storeData` soportan:
- `string`
- `number` (int, double)
- `boolean`
- Objetos y arrays (automáticamente serializados como JSON)

## Notas de Implementación

- **Web**: Usa `localStorage` y `SecureStore` de Expo
- **Nativo**: Usa `SecureStore` de Expo; SharedPreferences usa memoria como fallback (puede añadirse AsyncStorage si se necesita persistencia)
- **Refresh concurrente**: RefreshClient previene múltiples refresh simultáneos
- **Error handling**: Todos los métodos logean errores en consola
