import * as api from '@/services/common/api';
import { apiPost } from '@/services/common/apiClient';
import { TokenManager } from '@/lib/tokenManager';
import type { ReportPayload } from '@/types/report';

/**
 * Bug-report / suggestion API. Public endpoint — works for guests and signed-in
 * users alike (the backend attributes the report to the user when a token is sent).
 *
 * Two transports on purpose:
 *  - No image  → JSON via the shared axios client (keeps the local→prod fallback).
 *  - With image → multipart via `fetch`. axios FormData uploads are unreliable in
 *    React Native (the file part often arrives empty/mangled); `fetch` + the RN
 *    `{ uri, name, type }` file shape is the canonical, dependable path.
 */

interface ReportFields {
  type: string;
  message: string;
  name?: string;
  imageUri: string;
}

/** A fresh FormData per attempt — a FormData body is single-use once a request reads it. */
function buildForm({ type, message, name, imageUri }: ReportFields): FormData {
  const form = new FormData();
  form.append('type', type);
  form.append('message', message);
  if (name) form.append('name', name);

  const fileName = imageUri.split('/').pop() || `report-${Date.now()}.jpg`;
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  // React Native FormData file shape — do NOT set a Content-Type header; RN adds
  // the multipart boundary itself.
  form.append('image', { uri: imageUri, name: fileName, type: mime } as unknown as Blob);

  return form;
}

class ReportHttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ReportHttpError';
  }
}

async function uploadTo(baseUrl: string, fields: ReportFields, token: string | null): Promise<{ id: number }> {
  const res = await fetch(`${baseUrl}/reports`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: buildForm(fields),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      json?.errors?.image?.[0] ?? json?.message ?? `HTTP ${res.status}`;
    throw new ReportHttpError(detail, res.status);
  }
  return json.data as { id: number };
}

export const reportService = {
  submitReport: async ({ type, message, name, imageUri }: ReportPayload): Promise<{ id: number }> => {
    const trimmedName = name?.trim() || undefined;

    if (!imageUri) {
      return apiPost<{ id: number }>('/reports', {
        type,
        message,
        ...(trimmedName ? { name: trimmedName } : {}),
      });
    }

    const fields: ReportFields = { type, message, name: trimmedName, imageUri };
    const token = await TokenManager.getToken();

    try {
      return await uploadTo(api.API_URL, fields, token);
    } catch (err) {
      // Mirror the axios client's local→production fallback, but only for
      // connectivity/server failures — never for 4xx (a real validation error).
      const status = err instanceof ReportHttpError ? err.status : undefined;
      const retriable = status === undefined || status === 404 || status >= 500;
      const onLocal = api.API_URL === api.LOCAL_API_URL && api.PRODUCTION_API_URL !== api.LOCAL_API_URL;

      if (retriable && onLocal) {
        return await uploadTo(api.PRODUCTION_API_URL, fields, token);
      }
      throw err;
    }
  },
};
