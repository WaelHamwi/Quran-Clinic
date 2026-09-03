import { apiGet, apiPost } from '@/services/common/apiClient';
import type { NotificationPreferences } from '@/types/notification';

/**
 * Notification API (auth-gated). Device-side scheduling & wake detection live
 * in `notificationScheduler.ts`.
 */
export const notificationService = {
  getPreferences: (): Promise<NotificationPreferences> =>
    apiGet<NotificationPreferences>('/notifications/preferences'),

  savePreferences: (payload: NotificationPreferences): Promise<NotificationPreferences> =>
    apiPost<NotificationPreferences>('/notifications/preferences', payload),

  registerPushToken: (token: string): Promise<unknown> =>
    apiPost<unknown>('/notifications/token', { token }),
};
