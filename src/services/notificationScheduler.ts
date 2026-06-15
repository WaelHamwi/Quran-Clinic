import { Accelerometer } from 'expo-sensors';
import Constants from 'expo-constants';
import { prayerTimesService, type DayPrayerTimes } from '@/services/prayerTimesService';

// executionEnvironment is 'storeClient' when running inside Expo Go (SDK 48+).
// appOwnership was removed in SDK 49 so we cannot rely on it.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Lazy-load expo-notifications so its SDK 53 init warnings never fire in Expo Go.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications: typeof import('expo-notifications') | null = isExpoGo
  ? null
  : (require('expo-notifications') as typeof import('expo-notifications'));

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export interface ReminderText {
  title: string;
  body: string;
}

export type ReminderKey = 'morning' | 'evening' | 'sleep';

export interface ScheduledReminders {
  morning: boolean;
  evening: boolean;
  sleep: boolean;
}

// Each adhkar reminder fires at its associated prayer time.
//   morning adhkar → Fajr, evening adhkar → Asr, sleep adhkar → Isha.
const PRAYER_FOR_KEY: Record<ReminderKey, keyof Omit<DayPrayerTimes, 'date'>> = {
  morning: 'fajr',
  evening: 'asr',
  sleep: 'isha',
};

// Number of upcoming days to pre-schedule. Prayer times shift daily, so we
// schedule a rolling window of dated notifications and refresh it each launch.
const SCHEDULE_DAYS = 7;

// Fixed fallback times, used only if prayer-time computation is unavailable.
const FALLBACK_TIMES: Record<ReminderKey, { hour: number; minute: number }> = {
  morning: { hour: 6, minute: 30 },
  evening: { hour: 17, minute: 0 },
  sleep: { hour: 22, minute: 0 },
};

const REMINDER_KEYS: ReminderKey[] = ['morning', 'evening', 'sleep'];

const WAKE_THRESHOLD = 0.7;
let accelSubscription: { remove: () => void } | null = null;
let lastWakeFiredDate = '';

async function ensurePermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

async function rescheduleAdhkar(
  enabled: ScheduledReminders,
  texts: Record<ReminderKey, ReminderText>,
): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const anyEnabled = enabled.morning || enabled.evening || enabled.sleep;
    if (!anyEnabled) return;
    if (!(await ensurePermission())) return;

    // Build the next SCHEDULE_DAYS calendar days starting today.
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 0; i < SCHEDULE_DAYS; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }

    try {
      // Official prayer times (Umm al-Qura) for each upcoming day.
      const daily = await prayerTimesService.getDailyPrayerTimes(dates);
      const now = Date.now();
      for (const day of daily) {
        for (const key of REMINDER_KEYS) {
          if (!enabled[key]) continue;
          const when = day[PRAYER_FOR_KEY[key]];
          if (when.getTime() <= now) continue; // skip already-passed times
          await Notifications.scheduleNotificationAsync({
            content: { title: texts[key].title, body: texts[key].body, data: { adhkarType: key } },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
          });
        }
      }
    } catch {
      // Prayer-time computation failed — fall back to fixed daily reminders.
      for (const key of REMINDER_KEYS) {
        if (!enabled[key]) continue;
        const time = FALLBACK_TIMES[key];
        await Notifications.scheduleNotificationAsync({
          content: { title: texts[key].title, body: texts[key].body, data: { adhkarType: key } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
          },
        });
      }
    }
  } catch {
    // non-fatal
  }
}

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function withinWindow(now: Date, start: string, end: string): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = minutesOfDay(start);
  const e = minutesOfDay(end);
  return s <= e ? cur >= s && cur <= e : cur >= s || cur <= e;
}

function stopWakeDetection(): void {
  accelSubscription?.remove();
  accelSubscription = null;
}

function startWakeDetection(opts: {
  startTime: string;
  endTime: string;
  text: ReminderText;
}): void {
  if (!Notifications) return;
  stopWakeDetection();
  try {
    Accelerometer.setUpdateInterval(900);
    accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (Math.abs(magnitude - 1) < WAKE_THRESHOLD) return;

      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      if (lastWakeFiredDate === today) return;
      if (!withinWindow(now, opts.startTime, opts.endTime)) return;

      lastWakeFiredDate = today;
      void Notifications.scheduleNotificationAsync({
        content: {
          title: opts.text.title,
          body: opts.text.body,
          data: { adhkarType: 'waking' },
        },
        trigger: null,
      });
    });
  } catch {
    // expo-sensors unavailable
  }
}

export const notificationScheduler = {
  rescheduleAdhkar,
  startWakeDetection,
  stopWakeDetection,
};
