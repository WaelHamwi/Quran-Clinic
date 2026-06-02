import { useEffect } from 'react';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { selectNotifications } from '@/store/slices/notificationsSlice';
import { notificationScheduler, type ReminderKey, type ReminderText } from '@/services/notificationScheduler';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Wires `notificationsSlice` preferences to the device scheduler:
 * (re)schedules adhkar reminders, runs wake detection, and routes taps to
 * the Adhkar tab. Mounted once in the root layout.
 */
export function useNotifications(): void {
  const router = useRouter();
  const { t } = useLanguage();
  const prefs = useAppSelector(selectNotifications);

  const { adhkarMorning, adhkarEvening, adhkarSleep, adhkarWaking } = prefs;
  const { wakingStartTime, wakingEndTime } = prefs;

  // (Re)schedule the daily adhkar reminders whenever a preference changes.
  useEffect(() => {
    const texts: Record<ReminderKey, ReminderText> = {
      morning: { title: t.notifications.morning, body: t.notifications.reminderBody },
      evening: { title: t.notifications.evening, body: t.notifications.reminderBody },
      sleep: { title: t.notifications.sleep, body: t.notifications.reminderBody },
    };
    void notificationScheduler.rescheduleAdhkar(
      { morning: adhkarMorning, evening: adhkarEvening, sleep: adhkarSleep },
      texts,
    );
  }, [adhkarMorning, adhkarEvening, adhkarSleep, t]);

  // Accelerometer wake detection for the waking-adhkar reminder.
  useEffect(() => {
    if (adhkarWaking) {
      notificationScheduler.startWakeDetection({
        startTime: wakingStartTime,
        endTime: wakingEndTime,
        text: { title: t.notifications.waking, body: t.notifications.reminderBody },
      });
    } else {
      notificationScheduler.stopWakeDetection();
    }
    return () => notificationScheduler.stopWakeDetection();
  }, [adhkarWaking, wakingStartTime, wakingEndTime, t]);

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
}
