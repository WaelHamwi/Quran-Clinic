import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { API_URL } from '@/services/api';
import { TokenManager } from '@/lib/tokenManager';
import type { ApiEnvelope, Paginated, PaginationMeta } from '@/types/api';

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
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await TokenManager.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
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
