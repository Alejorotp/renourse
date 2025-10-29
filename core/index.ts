/**
 * Core module - Local preferences and HTTP client with auto-refresh
 * 
 * Este módulo replica la funcionalidad del core de Flutter:
 * - ILocalPreferences: interfaz para almacenamiento local
 * - LocalPreferencesSecured: almacenamiento seguro (tokens, credenciales)
 * - LocalPreferencesShared: almacenamiento no seguro (preferencias de usuario)
 * - RefreshClient: cliente HTTP que refresca automáticamente el token en 401
 * - Services: singletons globales para acceso fácil a los servicios core
 */

export { ILocalPreferences } from './i_local_preferences';
export { LocalPreferencesSecured } from './local_preferences_secured';
export { LocalPreferencesShared } from './local_preferences_shared';
export { RefreshClient } from './refresh_client';
export { getSecuredPrefs, getSharedPrefs, getRefreshClient, resetCoreServices } from './services';
