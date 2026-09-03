import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectNotifications,
  selectWakingWindow,
  setWakeSeriesIds,
  setLastActiveAt,
} from '@/store/slices/notificationsSlice';
import { selectInboxItems } from '@/store/slices/notificationInboxSlice';
import { notificationScheduler } from '@/services/notifications/notificationScheduler';
import { wakeDetection } from '@/services/notifications/wakeDetection';
import { ringtonePreview } from '@/services/notifications/ringtonePreview';
import { wakeDetectionService } from '@modules/wake-detection';

/**
 * Fires the waking adhkar reminder on a *detected* wake-up (motion sensor)
 * inside the user's waking window, rather than at a guessed time — SRS FR-14.2.
 *
 * Only runs while the app is foregrounded, because the OS suspends sensor
 * delivery otherwise; the scheduler's timed reminder remains the background
 * fallback. The inbox already records every delivered reminder and prunes
 * itself to the current day, so a `waking` entry there means the user has been
 * reminded today and detection can stand down.
 */
export function useWakeDetection(): void {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const {
    wakeMotionEnabled,
    wakeRepeatEnabled,
    wakeRepeatIntervalMinutes,
    wakeStillnessMinutes,
    wakeBackgroundEnabled,
    wakeRingtone,
    wakeSoundStream,
  } = useAppSelector(selectNotifications);
  const backgroundActive = wakeBackgroundEnabled && wakeDetectionService.isAvailable;
  const { start, end } = useAppSelector(selectWakingWindow);
  const remindedToday = useAppSelector((s) =>
    selectInboxItems(s).some((i) => i.type === 'waking'),
  );

  // Read through an always-fresh ref so the absence stamp never lands in the
  // effect's dependencies — consuming it would otherwise re-run the effect and
  // immediately restart the very detection it just armed.
  const lastActiveAt = useAppSelector((s) => selectNotifications(s).lastActiveAt);
  const lastActiveRef = useRef(lastActiveAt);
  // eslint-disable-next-line react-hooks/refs -- always-fresh ref for a listener registered independently of this value
  lastActiveRef.current = lastActiveAt;

  const title = t.notifications.waking;
  const body = t.notifications.reminderBody;
  const dismissLabel = t.notifications.wakeDismissAction;

  // Motion detection never reaches the scheduling path that normally prompts,
  // so without this a motion-only user is never asked and Android 13+ leaves
  // the permission denied — the reminder would be dropped without a trace.
  useEffect(() => {
    if (!wakeMotionEnabled || !notificationScheduler.isSupported) return;
    void notificationScheduler.requestPermission();
  }, [wakeMotionEnabled]);

  useEffect(() => {
    if (!wakeMotionEnabled || remindedToday || !notificationScheduler.isSupported) return;
    // The foreground service covers the foreground case too, and owns its own
    // once-a-day guard. Running both would ring twice.
    if (backgroundActive) return;

    const onWake = (): void => {
      // Detection only runs in the foreground, so the tone can be played here
      // rather than left to the notification channel — which cannot be trusted
      // to make a sound, being frozen at creation and user-owned after it.
      ringtonePreview.playAlert(wakeRingtone);
      // The sensor beat the backstop, so today's copy of it is redundant.
      void notificationScheduler.cancelTodayBackstop();
      void notificationScheduler
        .scheduleWakeSeries(
          { title, body },
          {
            repeat: wakeRepeatEnabled,
            repeatIntervalMinutes: wakeRepeatIntervalMinutes,
            dismissLabel,
            ringtone: wakeRingtone,
            stream: wakeSoundStream,
          },
        )
        .then((ids) => {
          if (ids.length > 0) dispatch(setWakeSeriesIds(ids));
        });
    };

    const sync = (state: AppStateStatus): void => {
      if (state === 'active') {
        const awaySince = lastActiveRef.current;
        // Spend it: an absence arms the sensor once, never again.
        if (awaySince != null) {
          lastActiveRef.current = null;
          dispatch(setLastActiveAt(null));
        }
        void wakeDetection.watch(
          { start, end, stillnessMinutes: wakeStillnessMinutes, awaySince },
          onWake,
        );
      } else {
        // Stamped once per absence, so a screen that goes off and stays off
        // measures the whole gap rather than the last moment before waking.
        if (lastActiveRef.current == null) {
          lastActiveRef.current = Date.now();
          dispatch(setLastActiveAt(lastActiveRef.current));
        }
        wakeDetection.stop();
      }
    };

    sync(AppState.currentState);
    const sub = AppState.addEventListener('change', sync);

    return () => {
      sub.remove();
      wakeDetection.stop();
    };
  }, [
    wakeMotionEnabled,
    backgroundActive,
    remindedToday,
    start,
    end,
    title,
    body,
    dismissLabel,
    wakeRepeatEnabled,
    wakeRepeatIntervalMinutes,
    wakeStillnessMinutes,
    wakeRingtone,
    wakeSoundStream,
    dispatch,
  ]);
}
