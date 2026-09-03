import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { selectNotifications, selectWakingWindow } from '@/store/slices/notificationsSlice';
import {
  notificationScheduler,
  WAKE_REPEAT_MAX,
} from '@/services/notifications/notificationScheduler';
import { getRingtone, ringtoneChannelId } from '@/services/notifications/ringtones';
import { wakeDetectionService } from '@modules/wake-detection';

/**
 * Keeps the Android foreground service in step with the user's preferences.
 *
 * The service is what makes a pick-up detectable with the app closed; the JS
 * detector cannot be, because sensors stop the moment the process is
 * backgrounded. Every setting is pushed down on change, since the service reads
 * its configuration from disk and may outlive this process by days.
 */
export function useBackgroundWakeDetection(): void {
  const { t } = useLanguage();
  const {
    wakeMotionEnabled,
    wakeBackgroundEnabled,
    wakeStillnessMinutes,
    wakeSampleIntervalMs,
    wakeRepeatEnabled,
    wakeRepeatIntervalMinutes,
    wakeRingtone,
    wakeSoundStream,
    backstopIds,
    backstopTimes,
  } = useAppSelector(selectNotifications);
  const { start, end } = useAppSelector(selectWakingWindow);

  const title = t.notifications.waking;
  const body = t.notifications.reminderBody;
  const dismissLabel = t.notifications.wakeDismissAction;
  const serviceTitle = t.notifications.wakeBackgroundServiceTitle;
  const serviceBody = t.notifications.wakeBackgroundServiceBody;

  const active = wakeMotionEnabled && wakeBackgroundEnabled;

  useEffect(() => {
    if (!wakeDetectionService.isAvailable) return;

    if (!active) {
      wakeDetectionService.stop();
      return;
    }

    let cancelled = false;

    // Permission and channel must both exist *before* the service starts. It
    // runs with no JS and can create neither, and Android requires a foreground
    // service to show a notification within seconds of starting — denied
    // permission means it is killed on the spot, or the app is brought down for
    // failing to go foreground in time.
    void (async () => {
      const granted = await notificationScheduler.requestPermission();
      if (!granted || cancelled) return;
      await notificationScheduler.setupChannel(wakeRingtone, wakeSoundStream);
      if (cancelled) return;

      wakeDetectionService.start({
        startTime: start,
        endTime: end,
        stillnessMinutes: wakeStillnessMinutes,
        sampleIntervalMs: wakeSampleIntervalMs,
        // The service posts on the same channel the JS scheduler uses, so the
        // tone, vibration and alarm-stream routing are identical either way.
        channelId: ringtoneChannelId(wakeRingtone, wakeSoundStream),
        // The service plays the tone itself rather than trusting the channel to
        // — see `playTone`. The channel is still what carries the notification.
        soundName: getRingtone(wakeRingtone).fileName ?? '',
        soundStream: wakeSoundStream,
        title,
        body,
        dismissLabel,
        repeat: wakeRepeatEnabled,
        repeatIntervalMinutes: wakeRepeatIntervalMinutes,
        repeatMax: WAKE_REPEAT_MAX,
        serviceTitle,
        serviceBody,
        backstopIds,
        backstopTimes,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [
    active,
    backstopIds,
    backstopTimes,
    start,
    end,
    wakeStillnessMinutes,
    wakeSampleIntervalMs,
    wakeRingtone,
    wakeSoundStream,
    wakeRepeatEnabled,
    wakeRepeatIntervalMinutes,
    title,
    body,
    dismissLabel,
    serviceTitle,
    serviceBody,
  ]);
}
