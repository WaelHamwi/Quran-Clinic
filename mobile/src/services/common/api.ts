import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const PRODUCTION_API_URL =
  (Constants.expoConfig?.extra as { API_BASE_URL?: string } | undefined)?.API_BASE_URL ??
  'https://mashfa.odooclick.com/api';

function getLocalApiUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_URL_LOCAL;
  if (override && !override.includes('localhost') && Platform.OS !== 'web') return override;

  if (Platform.OS === 'web') return override ?? 'http://localhost:8000/api';

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;

  let host: string | undefined = typeof hostUri === 'string' ? hostUri.split(':')[0] : undefined;

  if (!host && typeof Constants.linkingUri === 'string') {
    const m = Constants.linkingUri.match(/^exp?:\/\/([^:/]+)/);
    if (m?.[1]) host = m[1];
  }

  // On Android, localhost/127.0.0.1 refers to the device itself; 10.0.2.2 reaches the host machine.
  if (Platform.OS === 'android' && (!host || host === 'localhost' || host === '127.0.0.1')) {
    return 'http://10.0.2.2:8000/api';
  }

  return host ? `http://${host}:8000/api` : 'http://localhost:8000/api';
}

export const LOCAL_API_URL = getLocalApiUrl();

const OVERRIDE_API_URL = process.env.EXPO_PUBLIC_API_URL;

// `let` is intentional: resolveApiBaseUrl() reassigns this once at startup;
// apiClient reads it at request time via the ES module live binding.
export let API_URL: string = OVERRIDE_API_URL ?? (__DEV__ ? LOCAL_API_URL : PRODUCTION_API_URL);

export const API_HEADERS: HeadersInit = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

/** Called once in app/_layout.tsx before any screen renders. */
export async function resolveApiBaseUrl(): Promise<string> {
  if (OVERRIDE_API_URL) {
    API_URL = OVERRIDE_API_URL;
    return API_URL;
  }
  if (!__DEV__) {
    API_URL = PRODUCTION_API_URL;
    return API_URL;
  }
  API_URL = LOCAL_API_URL;
  return API_URL;
}
