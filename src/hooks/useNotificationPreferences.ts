import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setAdhkarPref,
  setWakingHours,
  setPreferences,
  selectNotifications,
} from '@/store/slices/notificationsSlice';
import { notificationService } from '@/services/notificationService';
import type { AdhkarTime } from '@/types/adhkar';
import type { NotificationPreferences } from '@/types/notification';

/** Wraps `notificationsSlice`; best-effort syncs changes to the backend. */
export function useNotificationPreferences() {
  const dispatch = useAppDispatch();
  const prefs = useAppSelector(selectNotifications);

  const toPayload = useCallback(
    (overrides: Partial<NotificationPreferences> = {}): NotificationPreferences => ({
      adhkar_morning_enabled: prefs.adhkarMorning,
      adhkar_evening_enabled: prefs.adhkarEvening,
      adhkar_sleep_enabled: prefs.adhkarSleep,
      adhkar_waking_enabled: prefs.adhkarWaking,
      waking_start_time: prefs.wakingStartTime,
      waking_end_time: prefs.wakingEndTime,
      ...overrides,
    }),
    [prefs],
  );

  const fieldFor: Record<AdhkarTime, keyof NotificationPreferences> = {
    morning: 'adhkar_morning_enabled',
    evening: 'adhkar_evening_enabled',
    sleep: 'adhkar_sleep_enabled',
    waking: 'adhkar_waking_enabled',
  };

  const updatePreference = useCallback(
    (type: AdhkarTime, enabled: boolean) => {
      dispatch(setAdhkarPref({ type, enabled }));
      notificationService
        .savePreferences(toPayload({ [fieldFor[type]]: enabled }))
        .catch(() => {
          /* auth-gated / offline — local state persists regardless */
        });
    },
    [dispatch, toPayload],
  );

  const updateWakingHours = useCallback(
    (start: string, end: string) => {
      dispatch(setWakingHours({ start, end }));
      notificationService
        .savePreferences(toPayload({ waking_start_time: start, waking_end_time: end }))
        .catch(() => {});
    },
    [dispatch, toPayload],
  );

  const refreshFromServer = useCallback(async () => {
    try {
      const remote = await notificationService.getPreferences();
      dispatch(setPreferences(remote));
    } catch {
      /* offline / auth bypassed */
    }
  }, [dispatch]);

  return useMemo(
    () => ({ prefs, updatePreference, updateWakingHours, refreshFromServer }),
    [prefs, updatePreference, updateWakingHours, refreshFromServer],
  );
}
