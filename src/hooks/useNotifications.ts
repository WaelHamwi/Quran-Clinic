import { useEffect } from 'react';
import { AppState } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNotifications } from '@/store/slices/notificationsSlice';
import {
  addInboxNotification,
  pruneInbox,
  type InboxNotification,
} from '@/store/slices/notificationInboxSlice';
import { notificationScheduler, type ReminderKey, type ReminderText } from '@/services/notificationScheduler';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Wires `notificationsSlice` preferences to the device scheduler:
 * (re)schedules the adhkar reminders, routes notification taps to the Adhkar
 * tab, and records every delivered reminder into the in-app inbox (the header
 * bell). Mounted once in the root layout.
 */
export function useNotifications(): void {
  const router = useRouter();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const prefs = useAppSelector(selectNotifications);

  const { adhkarMorning, adhkarEvening, adhkarSleep, adhkarWaking } = prefs;
  const { wakingStartTime } = prefs;

  // Create the Android notification channel once, up front, so it always exists.
  useEffect(() => {
    void notificationScheduler.setupChannel();
  }, []);

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
    void notificationScheduler.rescheduleAdhkar(
      { morning: adhkarMorning, evening: adhkarEvening, sleep: adhkarSleep, waking: adhkarWaking },
      texts,
      wakingStartTime,
    );
  }, [adhkarMorning, adhkarEvening, adhkarSleep, adhkarWaking, wakingStartTime, t]);

  // A notification tap deep-links into the Adhkar tab.
  // Skipped in Expo Go — remote notification APIs are unavailable there in SDK 53+.
  useEffect(() => {
    if (isExpoGo) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { adhkarType?: string }
        | undefined;
      if (data?.adhkarType) router.push('/adhkar');
    });
    return () => sub.remove();
  }, [router]);

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
