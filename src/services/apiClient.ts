import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import * as api from '@/services/api';
import { TokenManager } from '@/lib/tokenManager';
import type { ApiEnvelope, Paginated, PaginationMeta } from '@/types/api';

type RetryableConfig = AxiosRequestConfig & { _localFallbackAttempted?: boolean };

/**
 * Shared axios client for all NEW services. The existing `quranService.ts`
 * keeps its native `fetch` implementation untouched (Mushaf preservation).
 */

/** Registered by the store wiring so a 401 can clear auth without a circular import. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

/** Typed error surfaced by every apiClient call. */
export class ApiError extends Error {
  status: number;
  isNetworkError: boolean;
  isSubscriptionRequired: boolean;
  fieldErrors: Record<string, string[]> | null;

  constructor(
    message: string,
    status: number,
    opts?: { network?: boolean; subscription?: boolean; fieldErrors?: Record<string, string[]> | null },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = opts?.network ?? false;
    this.isSubscriptionRequired = opts?.subscription ?? false;
    this.fieldErrors = opts?.fieldErrors ?? null;
  }
}

export const apiClient: AxiosInstance = axios.create({
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  // On a fallback retry _localFallbackAttempted is already true and baseURL has
  // been set to PRODUCTION_API_URL by the error interceptor — don't overwrite it.
  if (!(config as RetryableConfig)._localFallbackAttempted) {
    config.baseURL = api.API_URL;
    // Short timeout for local so the production fallback kicks in within 5 s
    // when the dev server isn't running, instead of waiting the full 20 s.
    if (__DEV__ && config.baseURL === api.LOCAL_API_URL) {
      config.timeout = 5000;
    }
  }
  const token = await TokenManager.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // FormData uploads must keep the runtime-generated multipart boundary. Drop the
  // default JSON Content-Type so React Native sets `multipart/form-data; boundary=…`
  // itself — setting it manually omits the boundary and the server can't parse the body.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
    // Multipart (image) uploads need far more headroom than the default 20s — and
    // especially more than the 5s dev/local timeout set above, which would abort
    // the upload before it finishes. This runs after that block, so it wins.
    config.timeout = 60000;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const config = error.config as RetryableConfig | undefined;

    // Per-request fallback: if we were hitting local and it is unreachable or
    // returns 404 (endpoint not yet implemented locally), retry once against
    // production. Auth errors (401/403) and validation errors (422) are NOT
    // retried — those are real failures, not missing-endpoint problems.
    if (
      config &&
      !config._localFallbackAttempted &&
      config.baseURL === api.LOCAL_API_URL &&
      (!error.response || error.response.status === 404)
    ) {
      config._localFallbackAttempted = true;
      config.baseURL = api.PRODUCTION_API_URL;
      if (__DEV__) {
        const reason = error.response ? '404 on local' : 'local unreachable';
        console.log(`[api] ${reason} → retrying against production (${config.url})`);
      }
      return apiClient.request(config);
    }

    // No response → connectivity failure; let offline fallbacks run in the hook layer.
    if (!error.response) {
      return Promise.reject(
        new ApiError('No internet connection', 0, { network: true }),
      );
    }

    const { status, data } = error.response;
    const message = data?.message ?? error.message ?? 'Request failed';

    if (status === 401) {
      onUnauthorized?.();
      return Promise.reject(new ApiError('Session expired', 401));
    }
    if (status === 403) {
      return Promise.reject(
        new ApiError(message || 'Subscription required', 403, { subscription: true }),
      );
    }
    return Promise.reject(
      new ApiError(message, status, { fieldErrors: data?.errors ?? null }),
    );
  },
);

const FALLBACK_META: PaginationMeta = { current_page: 1, last_page: 1, per_page: 0, total: 0 };

/** GET → unwrapped `data`. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<ApiEnvelope<T>>(url, config);
  return res.data.data;
}

/** GET a paginated list → `{ items, meta }`. */
export async function apiGetPaginated<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<Paginated<T>> {
  const res = await apiClient.get<ApiEnvelope<T[]>>(url, config);
  return { items: res.data.data ?? [], meta: res.data.meta ?? FALLBACK_META };
}

/** POST → unwrapped `data`. */
export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<ApiEnvelope<T>>(url, body, config);
  return res.data.data;
}
