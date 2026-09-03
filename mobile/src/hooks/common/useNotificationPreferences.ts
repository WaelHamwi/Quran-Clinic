import { useCallback, useMemo } from 'react';
import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setAdhkarPref,
  setWakingHours,
  setAutoWakingHours,
  setWakingAuto,
  setWakeMotionEnabled,
  setWakeRepeatEnabled,
  setWakeRepeatInterval,
  setWakeStillness,
  setWakeBackgroundEnabled,
  setWakeSampleInterval,
  setWakeRingtone,
  setWakeSoundStream,
  clearWakeSeriesIds,
  setPreferences,
  selectNotifications,
  selectWakingWindow,
  type WakeSampleIntervalMs,
} from '@/store/slices/notificationsSlice';
import { wakeDetectionService } from '@modules/wake-detection';
import { notificationScheduler } from '@/services/notifications/notificationScheduler';
import {
  ringtoneChannelId,
  type RingtoneId,
  type SoundStream,
} from '@/services/notifications/ringtones';
import { ringtonePreview } from '@/services/notifications/ringtonePreview';
import { notificationService } from '@/services/notifications/notificationService';
import { prayerTimesService } from '@/services/notifications/prayerTimesService';
import { enqueueReplacing } from '@/store/slices/offlineQueueSlice';
import type { AdhkarTime } from '@/types/adhkar';
import type { NotificationPreferences } from '@/types/notification';

const ANDROID_PACKAGE =
  Constants.expoConfig?.android?.package ?? 'com.quranicclinic';

const fieldFor: Record<AdhkarTime, keyof NotificationPreferences> = {
  morning: 'adhkar_morning_enabled',
  evening: 'adhkar_evening_enabled',
  sleep: 'adhkar_sleep_enabled',
  waking: 'adhkar_waking_enabled',
};

/** Wraps `notificationsSlice`; best-effort syncs changes to the backend. */
export function useNotificationPreferences() {
  const dispatch = useAppDispatch();
  const prefs = useAppSelector(selectNotifications);
  const wakingWindow = useAppSelector(selectWakingWindow);

  const toPayload = useCallback(
    (overrides: Partial<NotificationPreferences> = {}): NotificationPreferences => ({
      adhkar_morning_enabled: prefs.adhkarMorning,
      adhkar_evening_enabled: prefs.adhkarEvening,
      adhkar_sleep_enabled: prefs.adhkarSleep,
      adhkar_waking_enabled: prefs.adhkarWaking,
      waking_start_time: wakingWindow.start,
      waking_end_time: wakingWindow.end,
      // The post-detection grace period was removed as a setting; the column is
      // still on the backend, so it is pinned at "immediately" for the wire.
      waking_delay_minutes: 0,
      ...overrides,
    }),
    [prefs, wakingWindow],
  );

  // Best-effort sync — on failure (offline, auth-gated) the change is queued so
  // it replays on reconnect instead of being silently lost (FR-16.3). Only the
  // latest payload matters, so a repeat queues over any still-pending one.
  const syncPreferences = useCallback(
    (payload: NotificationPreferences) => {
      notificationService.savePreferences(payload).catch(() => {
        dispatch(enqueueReplacing({ type: 'notificationPreferences', payload }));
      });
    },
    [dispatch],
  );

  const updatePreference = useCallback(
    (type: AdhkarTime, enabled: boolean) => {
      dispatch(setAdhkarPref({ type, enabled }));
      syncPreferences(toPayload({ [fieldFor[type]]: enabled }));
    },
    [dispatch, toPayload, syncPreferences],
  );

  /** Edits the manual window only — automatic mode owns its own pair of times. */
  const updateWakingHours = useCallback(
    (start: string, end: string) => {
      dispatch(setWakingHours({ start, end }));
      syncPreferences(toPayload({ waking_start_time: start, waking_end_time: end }));
    },
    [dispatch, toPayload, syncPreferences],
  );

  /** Toggle the automatic (prayer-time) waking window. Enabling computes today's
   *  Fajr→sunrise; disabling restores the user's own times untouched. */
  const setAutoWaking = useCallback(
    async (enabled: boolean) => {
      dispatch(setWakingAuto(enabled));
      if (!enabled) {
        syncPreferences(
          toPayload({
            waking_start_time: prefs.wakingStartTime,
            waking_end_time: prefs.wakingEndTime,
          }),
        );
        return;
      }
      const { start, end } = await prayerTimesService.getWakingWindow();
      dispatch(setAutoWakingHours({ start, end }));
      syncPreferences(toPayload({ waking_start_time: start, waking_end_time: end }));
    },
    [dispatch, toPayload, syncPreferences, prefs.wakingStartTime, prefs.wakingEndTime],
  );

  /** Arming motion detection disarms the timed reminder, so the server has to
   *  be told the timed one is now off. */
  const updateWakeMotion = useCallback(
    (enabled: boolean) => {
      dispatch(setWakeMotionEnabled(enabled));
      if (!enabled) return;
      syncPreferences(toPayload({ adhkar_waking_enabled: false }));
      // Android stops a foreground service that is not exempt, and the user can
      // only grant that themselves. Asking here rather than behind the
      // background switch means the one action that enables the feature also
      // asks for the one permission it cannot work without.
      if (wakeDetectionService.isAvailable && !wakeDetectionService.isBatteryOptimizationIgnored()) {
        wakeDetectionService.requestIgnoreBatteryOptimization();
      }
    },
    [dispatch, toPayload, syncPreferences],
  );

  /** Local-only: repeat behaviour and ringtone are per-device, not per-account. */
  const updateWakeRepeat = useCallback(
    (enabled: boolean) => {
      dispatch(setWakeRepeatEnabled(enabled));
    },
    [dispatch],
  );

  const updateWakeRepeatInterval = useCallback(
    (minutes: number) => {
      dispatch(setWakeRepeatInterval(minutes));
    },
    [dispatch],
  );

  const updateWakeStillness = useCallback(
    (minutes: number) => {
      dispatch(setWakeStillness(minutes));
    },
    [dispatch],
  );

  /** Turning background detection on is only half the job — Android will still
   *  stop the service unless the user exempts the app, so the exemption screen
   *  is offered at the moment they ask for it. */
  const updateWakeBackground = useCallback(
    async (enabled: boolean) => {
      dispatch(setWakeBackgroundEnabled(enabled));
      if (!enabled) return;
      if (!wakeDetectionService.isBatteryOptimizationIgnored()) {
        wakeDetectionService.requestIgnoreBatteryOptimization();
      }
    },
    [dispatch],
  );

  const updateWakeSampleInterval = useCallback(
    (ms: WakeSampleIntervalMs) => {
      dispatch(setWakeSampleInterval(ms));
    },
    [dispatch],
  );

  const requestBatteryExemption = useCallback(
    () => wakeDetectionService.requestIgnoreBatteryOptimization(),
    [],
  );

  /** Switch the waking reminders to `ringtone`.
   *
   *  Each tone lives on a channel of its own (a channel's sound is immutable
   *  once created), so this moves to a different channel and drops the old one.
   *  Anything already queued was scheduled against the channel being removed,
   *  so an in-flight wake series is cancelled here — the caller's reschedule
   *  puts the timed reminder back on the new channel. */
  const updateWakeRingtone = useCallback(
    async (ringtone: RingtoneId) => {
      ringtonePreview.stop();
      dispatch(setWakeRingtone(ringtone));
      if (prefs.wakeSeriesIds.length > 0) {
        await notificationScheduler.cancelWakeSeries(prefs.wakeSeriesIds);
        dispatch(clearWakeSeriesIds());
      }
      await notificationScheduler.applyRingtone(ringtone, prefs.wakeSoundStream);
    },
    [dispatch, prefs.wakeSeriesIds, prefs.wakeSoundStream],
  );

  /** Move the reminders to the alarm or notification stream.
   *
   *  Audio attributes are as immutable as the sound, so this is another channel
   *  move rather than an edit — same teardown as switching tone. */
  const updateWakeSoundStream = useCallback(
    async (stream: SoundStream) => {
      dispatch(setWakeSoundStream(stream));
      if (prefs.wakeSeriesIds.length > 0) {
        await notificationScheduler.cancelWakeSeries(prefs.wakeSeriesIds);
        dispatch(clearWakeSeriesIds());
      }
      await notificationScheduler.applyRingtone(prefs.wakeRingtone, stream);
    },
    [dispatch, prefs.wakeRingtone, prefs.wakeSeriesIds],
  );

  /** Ring the real reminder channel, so the whole delivery path is exercised.
   *  `previewRingtone` only plays the file through the media stream, which stays
   *  audible even when the reminder itself is silent. */
  const testReminderSound = useCallback(
    (text: { title: string; body: string }) =>
      notificationScheduler.playToneTest(text, prefs.wakeRingtone, prefs.wakeSoundStream),
    [prefs.wakeRingtone, prefs.wakeSoundStream],
  );

  /** What Android actually holds for the active channel — the only way to see a
   *  channel that was never created or that the user silenced in the OS. */
  const readChannelState = useCallback(
    () => notificationScheduler.inspectChannel(prefs.wakeRingtone, prefs.wakeSoundStream),
    [prefs.wakeRingtone, prefs.wakeSoundStream],
  );

  /** Hear a tone without waiting for a reminder. Returns false for the tones
   *  the app does not own (system/device/silent), which have nothing to play. */
  const previewRingtone = useCallback(
    (ringtone: RingtoneId) => ringtonePreview.play(ringtone),
    [],
  );

  /** Open the OS screen where the waking reminder's tone and vibration live.
   *  Android deep-links straight to the *active* channel; iOS has no
   *  per-channel screen, so it can only open the app's notification settings. */
  const openDeviceSoundSettings = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        await Linking.sendIntent('android.settings.CHANNEL_NOTIFICATION_SETTINGS', [
          { key: 'android.provider.extra.APP_PACKAGE', value: ANDROID_PACKAGE },
          {
            key: 'android.provider.extra.CHANNEL_ID',
            value: ringtoneChannelId(prefs.wakeRingtone, prefs.wakeSoundStream),
          },
        ]);
        return;
      } catch {
        // Some OEM skins do not expose the per-channel screen.
      }
    }
    await Linking.openSettings().catch(() => {});
  }, [prefs.wakeRingtone, prefs.wakeSoundStream]);

  /** Recompute the auto window (e.g. on screen focus / new day). No-op if manual. */
  const refreshAutoWindow = useCallback(async () => {
    if (!prefs.wakingAuto) return;
    const { start, end } = await prayerTimesService.getWakingWindow();
    if (start === prefs.wakingAutoStartTime && end === prefs.wakingAutoEndTime) return;
    dispatch(setAutoWakingHours({ start, end }));
    syncPreferences(toPayload({ waking_start_time: start, waking_end_time: end }));
  }, [
    dispatch,
    prefs.wakingAuto,
    prefs.wakingAutoStartTime,
    prefs.wakingAutoEndTime,
    toPayload,
    syncPreferences,
  ]);

  const refreshFromServer = useCallback(async () => {
    try {
      const remote = await notificationService.getPreferences();
      dispatch(setPreferences(remote));
    } catch {
      /* offline / unauthenticated */
    }
  }, [dispatch]);

  return useMemo(
    () => ({
      prefs,
      /** The window in effect for the current mode — what the UI must display. */
      wakingWindow,
      updatePreference,
      updateWakingHours,
      updateWakeMotion,
      updateWakeRepeat,
      updateWakeRepeatInterval,
      updateWakeStillness,
      updateWakeBackground,
      updateWakeSampleInterval,
      requestBatteryExemption,
      updateWakeRingtone,
      updateWakeSoundStream,
      testReminderSound,
      readChannelState,
      previewRingtone,
      openDeviceSoundSettings,
      setAutoWaking,
      refreshAutoWindow,
      refreshFromServer,
    }),
    [
      prefs,
      wakingWindow,
      updatePreference,
      updateWakingHours,
      updateWakeMotion,
      updateWakeRepeat,
      updateWakeRepeatInterval,
      updateWakeStillness,
      updateWakeBackground,
      updateWakeSampleInterval,
      requestBatteryExemption,
      updateWakeRingtone,
      updateWakeSoundStream,
      testReminderSound,
      readChannelState,
      previewRingtone,
      openDeviceSoundSettings,
      setAutoWaking,
      refreshAutoWindow,
      refreshFromServer,
    ],
  );
}
