import { API_URL } from '@/services/common/api';
import { TokenManager } from '@/lib/tokenManager';

function apiOrigin(): string {
  return API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
}

/**
 * True when the URL targets our own backend, so it is safe to attach the bearer token.
 * Matches the configured API origin and the dev loopback hosts the backend may emit.
 */
export function isInternalApiUrl(uri: string): boolean {
  if (!uri) return false;
  if (uri.startsWith(apiOrigin())) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?\//i.test(uri);
}

/**
 * Headers for loading/downloading remote audio. The ngrok header keeps the local tunnel
 * from returning its browser-warning page. The bearer token is attached ONLY for our own
 * backend (the gated recording-audio endpoint) and never leaks to third-party CDNs.
 */
export async function buildAudioHeaders(uri: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'ngrok-skip-browser-warning': 'true' };

  if (isInternalApiUrl(uri)) {
    const token = await TokenManager.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
