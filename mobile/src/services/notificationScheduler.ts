import { Platform } from 'react-native';
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

export type ReminderKey = 'morning' | 'evening' | 'sleep' | 'waking';

export interface ScheduledReminders {
  morning: boolean;
  evening: boolean;
  sleep: boolean;
  waking: boolean;
}

// The three prayer-anchored reminders fire at their associated prayer time.
//   morning adhkar → Fajr, evening adhkar → Asr, sleep adhkar → Isha.
// (The waking reminder is time-based, not prayer-based — see below.)
type PrayerKey = 'morning' | 'evening' | 'sleep';
const PRAYER_KEYS: PrayerKey[] = ['morning', 'evening', 'sleep'];
const PRAYER_FOR_KEY: Record<PrayerKey, keyof Omit<DayPrayerTimes, 'date'>> = {
  morning: 'fajr',
  evening: 'asr',
  sleep: 'isha',
};

// Number of upcoming days to pre-schedule. Prayer times shift daily, so we
// schedule a rolling window of dated notifications and refresh it each launch.
const SCHEDULE_DAYS = 7;

// Fixed fallback times, used only if prayer-time computation is unavailable.
const FALLBACK_TIMES: Record<PrayerKey, { hour: number; minute: number }> = {
  morning: { hour: 6, minute: 30 },
  evening: { hour: 17, minute: 0 },
  sleep: { hour: 22, minute: 0 },
};

// Android 8+ requires every notification to belong to a channel. Without an
// explicit HIGH-importance channel, scheduled reminders land silently on the
// system "Default" channel. iOS ignores channels entirely.
const ADHKAR_CHANNEL_ID = 'adhkar-reminders';

async function ensureAndroidChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(ADHKAR_CHANNEL_ID, {
      name: 'Adhkar reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  } catch {
    // non-fatal
  }
}

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

/** Parse an "HH:MM" string into { hour, minute }; null if malformed. */
function parseHHMM(hhmm: string): { hour: number; minute: number } | null {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return { hour: h, minute: m };
}

// Cancel/reschedule is not atomic — two overlapping calls (rapid toggles, or a
// language change coinciding with a pref change) could interleave their
// cancelAll/schedule steps and leave a partial schedule. Chaining serializes
// every call so the final state always wins.
let rescheduleChain: Promise<void> = Promise.resolve();

/**
 * (Re)schedule all adhkar reminders.
 *   morning/evening/sleep → fired at the day's Fajr/Asr/Isha (rolling 7-day window).
 *   waking → a daily reminder at `wakingTime` ("HH:MM"), the start of the user's
 *            waking window. Time-based so it fires reliably in the background —
 *            unlike accelerometer detection, which the OS suspends when the app
 *            is not in the foreground.
 */
function rescheduleAdhkar(
  enabled: ScheduledReminders,
  texts: Record<ReminderKey, ReminderText>,
  wakingTime: string,
): Promise<void> {
  rescheduleChain = rescheduleChain
    .catch(() => {})
    .then(() => runReschedule(enabled, texts, wakingTime));
  return rescheduleChain;
}

async function runReschedule(
  enabled: ScheduledReminders,
  texts: Record<ReminderKey, ReminderText>,
  wakingTime: string,
): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const anyEnabled = enabled.morning || enabled.evening || enabled.sleep || enabled.waking;
    if (!anyEnabled) return;
    if (!(await ensurePermission())) return;
    await ensureAndroidChannel();

    // ── Waking: a single daily reminder at the configured time. ──────────────
    if (enabled.waking) {
      const t = parseHHMM(wakingTime);
      if (t) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: texts.waking.title,
            body: texts.waking.body,
            data: { adhkarType: 'waking' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: t.hour,
            minute: t.minute,
            channelId: ADHKAR_CHANNEL_ID,
          },
        });
      }
    }

    // ── Morning / evening / sleep: anchored to prayer times. ─────────────────
    if (!(enabled.morning || enabled.evening || enabled.sleep)) return;

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
        for (const key of PRAYER_KEYS) {
          if (!enabled[key]) continue;
          const when = day[PRAYER_FOR_KEY[key]];
          if (when.getTime() <= now) continue; // skip already-passed times
          await Notifications.scheduleNotificationAsync({
            content: { title: texts[key].title, body: texts[key].body, data: { adhkarType: key } },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: when,
              channelId: ADHKAR_CHANNEL_ID,
            },
          });
        }
      }
    } catch {
      // Prayer-time computation failed — fall back to fixed daily reminders.
      for (const key of PRAYER_KEYS) {
        if (!enabled[key]) continue;
        const time = FALLBACK_TIMES[key];
        await Notifications.scheduleNotificationAsync({
          content: { title: texts[key].title, body: texts[key].body, data: { adhkarType: key } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
            channelId: ADHKAR_CHANNEL_ID,
          },
        });
      }
    }
  } catch {
    // non-fatal
  }
}

/** Fire a notification a few seconds from now to verify the delivery pipeline
 *  end-to-end (permission → channel → display). Used by the in-app test button. */
async function sendTest(text: ReminderText): Promise<boolean> {
  if (!Notifications) return false;
  if (!(await ensurePermission())) return false;
  await ensureAndroidChannel();
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: text.title, body: text.body, data: { adhkarType: 'test' } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
        channelId: ADHKAR_CHANNEL_ID,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/** Snapshot of the device notification state, for the in-app diagnostics alert. */
async function getStatus(): Promise<{ granted: boolean; scheduled: number }> {
  if (!Notifications) return { granted: false, scheduled: 0 };
  try {
    const perm = await Notifications.getPermissionsAsync();
    const list = await Notifications.getAllScheduledNotificationsAsync();
    return { granted: perm.granted, scheduled: list.length };
  } catch {
    return { granted: false, scheduled: 0 };
  }
}

export const notificationScheduler = {
  rescheduleAdhkar,
  /** Create the Android notification channel up front (idempotent). */
  setupChannel: ensureAndroidChannel,
  sendTest,
  getStatus,
  /** False inside Expo Go, where expo-notifications is disabled (SDK 53). */
  isSupported: !isExpoGo && Notifications != null,
};
