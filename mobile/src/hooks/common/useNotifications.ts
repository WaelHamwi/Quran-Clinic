import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectNotifications,
  selectWakingWindow,
  clearWakeSeriesIds,
  setBackstops,
} from '@/store/slices/notificationsSlice';
import {
  addInboxNotification,
  pruneInbox,
  selectInboxItems,
  type InboxNotification,
} from '@/store/slices/notificationInboxSlice';
import {
  notificationScheduler,
  DISMISS_WAKING_ACTION,
  type ReminderKey,
  type ReminderText,
} from '@/services/notifications/notificationScheduler';
import { useWakeDetection } from '@/hooks/common/useWakeDetection';
import { useBackgroundWakeDetection } from '@/hooks/common/useBackgroundWakeDetection';
import { wakeDetectionService } from '@modules/wake-detection';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Wires `notificationsSlice` preferences to the device scheduler:
 * (re)schedules the adhkar reminders, starts accelerometer wake detection for
 * the waking reminder, routes notification taps to the Adhkar tab, and records
 * every delivered reminder into the in-app inbox (the header bell). Mounted
 * once in the root layout.
 */
export function useNotifications(): void {
  const router = useRouter();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const prefs = useAppSelector(selectNotifications);

  const {
    adhkarMorning,
    adhkarEvening,
    adhkarSleep,
    adhkarWaking,
    wakeMotionEnabled,
    wakeBackgroundEnabled,
    wakeRingtone,
    wakeSoundStream,
  } = prefs;
  const backgroundActive = wakeBackgroundEnabled && wakeDetectionService.isAvailable;
  const { start: wakingStartTime, end: wakingEndTime } = useAppSelector(selectWakingWindow);
  const remindedToday = useAppSelector((s) =>
    selectInboxItems(s).some((i) => i.type === 'waking'),
  );

  // The response listener is registered once and must not be torn down every
  // time the queue changes, so it reads the current ids through a ref.
  const wakeSeriesIds = prefs.wakeSeriesIds;
  const wakeSeriesIdsRef = useRef(wakeSeriesIds);
  // eslint-disable-next-line react-hooks/refs -- always-fresh ref for a listener that is intentionally registered only once
  wakeSeriesIdsRef.current = wakeSeriesIds;

  useWakeDetection();
  useBackgroundWakeDetection();

  // Create the Android notification channels up front, so they always exist —
  // including the one carrying the currently selected ringtone.
  useEffect(() => {
    void notificationScheduler.setupChannel(wakeRingtone, wakeSoundStream);
  }, [wakeRingtone, wakeSoundStream]);

  // (Re)schedule all adhkar reminders whenever a preference changes. The waking
  // reminder fires daily at the start of the waking window, so it is rescheduled
  // whenever that time changes too.
  useEffect(() => {
    const texts: Record<ReminderKey, ReminderText> = {
      morning: { title: t.notifications.morning, body: t.notifications.reminderBody },
      evening: { title: t.notifications.evening, body: t.notifications.reminderBody },
      sleep: { title: t.notifications.sleep, body: t.notifications.reminderBody },
      waking: { title: t.notifications.waking, body: t.notifications.reminderBody },
    };
    void notificationScheduler
      .rescheduleAdhkar(
        { morning: adhkarMorning, evening: adhkarEvening, sleep: adhkarSleep },
        texts,
        {
          timed: adhkarWaking,
          // Always booked, even with the foreground service running. The
          // backstop goes through the OS, so it survives the service being
          // killed by the system or by an OEM battery manager — which is
          // exactly when it is needed. The service cancels today's copy if the
          // sensor gets there first.
          motion: wakeMotionEnabled,
          remindedToday,
          start: wakingStartTime,
          end: wakingEndTime,
          ringtone: wakeRingtone,
          stream: wakeSoundStream,
        },
      )
      // Handed to the foreground service so it can cancel today's copy the
      // moment the sensor detects the wake-up.
      .then((backstops) => dispatch(setBackstops(backstops)));
  }, [
    adhkarMorning,
    adhkarEvening,
    adhkarSleep,
    adhkarWaking,
    wakeMotionEnabled,
    backgroundActive,
    remindedToday,
    wakingStartTime,
    wakingEndTime,
    wakeRingtone,
    wakeSoundStream,
    dispatch,
    t,
  ]);

  // A notification tap deep-links into the Adhkar tab.
  // Skipped in Expo Go — remote notification APIs are unavailable there in SDK 53+.
  useEffect(() => {
    if (isExpoGo) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { adhkarType?: string; wakeSeries?: boolean }
        | undefined;

      // Any response to a repeating wake reminder — tapping it, pressing
      // "I'm awake", or swiping it away — means the user is up, so drop every
      // repeat still queued behind it.
      if (data?.wakeSeries) {
        void notificationScheduler.cancelWakeSeries(wakeSeriesIdsRef.current);
        dispatch(clearWakeSeriesIds());
      }

      // The dismiss button deliberately does not open the app.
      if (response.actionIdentifier === DISMISS_WAKING_ACTION) return;
      if (data?.adhkarType) router.push('/adhkar');
    });
    return () => sub.remove();
  }, [router, dispatch]);

  // Record every delivered adhkar reminder into the in-app inbox (the bell icon).
  //   • a foreground listener captures reminders that fire while the app is open;
  //   • on launch / whenever the app returns to the foreground we reconcile against
  //     the system tray to pick up reminders delivered while it was backgrounded.
  // The inbox slice prunes itself to the current day, so it resets daily.
  useEffect(() => {
    if (isExpoGo) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');

    const toItem = (n: import('expo-notifications').Notification): InboxNotification => {
      const content = n.request.content;
      const data = content.data as { adhkarType?: string } | undefined;
      // n.date is seconds on some platforms, ms on others — normalise to ms.
      const raw = (n as { date?: number }).date;
      const receivedAt =
        typeof raw === 'number' ? (raw < 1e12 ? raw * 1000 : raw) : Date.now();
      return {
        id: n.request.identifier,
        type: data?.adhkarType ?? 'reminder',
        title: content.title ?? '',
        body: content.body ?? '',
        receivedAt,
      };
    };

    const reconcileTray = async (): Promise<void> => {
      try {
        const presented = await Notifications.getPresentedNotificationsAsync();
        for (const n of presented) {
          const data = n.request.content.data as { adhkarType?: string } | undefined;
          if (data?.adhkarType) dispatch(addInboxNotification(toItem(n)));
        }
      } catch {
        // tray may be unavailable — non-fatal
      }
      dispatch(pruneInbox());
    };

    const received = Notifications.addNotificationReceivedListener((n) => {
      const data = n.request.content.data as { adhkarType?: string } | undefined;
      if (data?.adhkarType) dispatch(addInboxNotification(toItem(n)));
    });

    void reconcileTray();
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reconcileTray();
    });

    return () => {
      received.remove();
      appStateSub.remove();
    };
  }, [dispatch]);
}
