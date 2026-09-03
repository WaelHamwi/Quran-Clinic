import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { prayerTimesService, type DayPrayerTimes } from '@/services/notifications/prayerTimesService';
import {
  getRingtone,
  ringtoneChannelId,
  LEGACY_CHANNEL_IDS,
  MANAGED_CHANNEL_IDS,
  type RingtoneId,
  type SoundStream,
} from '@/services/notifications/ringtones';
import { parseHHMM } from '@/utils/wakingWindow';

// executionEnvironment is 'storeClient' when running inside Expo Go (SDK 48+).
// appOwnership was removed in SDK 49 so we cannot rely on it.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Lazy-load expo-notifications so its SDK 53 init warnings never fire in Expo Go.
 
const Notifications: typeof import('expo-notifications') | null = isExpoGo
  ? null
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay a runtime require so it's skipped entirely in Expo Go
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
}

export interface WakingSchedule {
  /** The timed reminder, delivered at the start of the waking window. */
  timed: boolean;
  /** Motion mode. The accelerometer only runs while the app is foregrounded, so
   *  a phone locked on the nightstand all night is never sampled. A backstop at
   *  the *end* of the window covers exactly that night, and is cancelled for the
   *  day as soon as the sensor does fire. Without it, motion mode delivered
   *  nothing at all to a user who slept with a locked phone. */
  motion: boolean;
  /** The user has already had a waking reminder today, so today's backstop is
   *  redundant. Read from the inbox, which persists and prunes daily, so a
   *  reschedule after an app restart cannot resurrect it. */
  remindedToday: boolean;
  start: string;
  end: string;
  ringtone: RingtoneId;
  stream: SoundStream;
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

/** The next SCHEDULE_DAYS calendar days, starting today. */
function upcomingDays(): Date[] {
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < SCHEDULE_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

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

// The waking reminders live on their own channel, so their ringtone, vibration
// and importance are independent of the three prayer-anchored reminders. Which
// channel that is depends on the chosen ringtone — see `ringtones.ts`.

// Notification category carrying the "I'm awake" button, which is what stops a
// repeating series without the user having to open the app.
export const WAKING_CATEGORY_ID = 'waking-reminder';
export const DISMISS_WAKING_ACTION = 'dismiss-waking';

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

/**
 * Create the channel carrying `ringtone` on `stream` and return its id.
 *
 * The stream choice is the difference between audible and silent, so it is the
 * user's to make — see `SoundStream`. `enforceAudibility` asks Android not to
 * duck the tone behind other audio; it is a no-op for non-system apps, but it
 * costs nothing and helps where it is honoured.
 */
async function ensureRingtoneChannel(
  ringtone: RingtoneId,
  stream: SoundStream,
): Promise<string> {
  const tone = getRingtone(ringtone);
  const channelId = ringtoneChannelId(ringtone, stream);
  if (!Notifications || Platform.OS !== 'android') return channelId;
  try {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: `Waking adhkar — ${tone.label.en}`,
      importance:
        tone.id === 'silent'
          ? Notifications.AndroidImportance.DEFAULT
          : Notifications.AndroidImportance.HIGH,
      sound: tone.fileName,
      audioAttributes: {
        usage:
          stream === 'alarm'
            ? Notifications.AndroidAudioUsage.ALARM
            : Notifications.AndroidAudioUsage.NOTIFICATION,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false },
      },
      vibrationPattern: [0, 400, 200, 400],
      enableVibrate: tone.id !== 'silent',
    });
  } catch {
    // non-fatal
  }
  return channelId;
}

/** What Android actually holds for the active channel. */
export interface ChannelState {
  id: string;
  /** False when channel creation failed outright. A notification sent to a
   *  missing channel still appears, but on expo's fallback channel — which is
   *  why the reminder can show up looking fine and yet be silent. */
  exists: boolean;
  /** The sound Android resolved. Null means the channel is genuinely silent —
   *  either the tone is `silent`, or the user muted it in the OS settings,
   *  which sticks permanently because channel settings are user-owned. */
  sound: string | null;
  importance: number | null;
  /** Null on a channel Android never created. */
  audioUsage: number | null;
}

/**
 * Read the live channel back off the device.
 *
 * Every failure mode here — a channel that was never created, one the user
 * silenced in Android's settings, one stuck on the wrong sound because channel
 * settings are immutable — is invisible from the JS side and produces the same
 * symptom: the reminder appears in the tray with no sound. This is the only way
 * to tell them apart without a logcat.
 */
async function inspectChannel(
  ringtone: RingtoneId,
  stream: SoundStream,
): Promise<ChannelState> {
  const id = ringtoneChannelId(ringtone, stream);
  const missing: ChannelState = { id, exists: false, sound: null, importance: null, audioUsage: null };
  if (!Notifications || Platform.OS !== 'android') return missing;
  try {
    const channel = await Notifications.getNotificationChannelAsync(id);
    if (!channel) return missing;
    return {
      id,
      exists: true,
      sound: channel.sound ?? null,
      importance: channel.importance,
      audioUsage: channel.audioAttributes?.usage ?? null,
    };
  } catch {
    return missing;
  }
}

/**
 * Make `ringtone` the active tone and tear down the channels for the others.
 *
 * A channel's sound is user-owned once it exists — re-creating it with a
 * different sound is ignored — so switching tone means moving to a different
 * channel and deleting the one left behind. Deleting also keeps the app from
 * accumulating a list of dead channels in Android's notification settings.
 * The `device` channel is exempt: it is where the user's own customisations
 * live, so it is only ever created, never removed.
 */
async function applyRingtone(ringtone: RingtoneId, stream: SoundStream): Promise<string> {
  const active = await ensureRingtoneChannel(ringtone, stream);
  if (!Notifications || Platform.OS !== 'android') return active;
  for (const id of [...MANAGED_CHANNEL_IDS, ...LEGACY_CHANNEL_IDS]) {
    if (id === active) continue;
    try {
      await Notifications.deleteNotificationChannelAsync(id);
    } catch {
      // never existed — fine
    }
  }
  return active;
}

/** Register the "I'm awake" action shown on the waking reminder. */
async function ensureWakingCategory(dismissLabel: string): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.setNotificationCategoryAsync(
      WAKING_CATEGORY_ID,
      [
        {
          identifier: DISMISS_WAKING_ACTION,
          buttonTitle: dismissLabel,
          options: { opensAppToForeground: false },
        },
      ],
      // Makes iOS report a swipe-away as a dismissal instead of staying silent,
      // so swiping also stops the series there.
      { customDismissAction: true },
    );
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

/** Hard ceiling on a repeating series, so it can never nag indefinitely. */
export const WAKE_REPEAT_MAX = 12;

export interface WakeSeriesOptions {
  /** Keep re-ringing until the user dismisses it. */
  repeat: boolean;
  repeatIntervalMinutes: number;
  /** Label for the "I'm awake" button that stops the series. */
  dismissLabel: string;
  ringtone: RingtoneId;
  stream: SoundStream;
}

/**
 * Ring the waking reminder now and, when `repeat` is on, queue follow-ups every
 * `repeatIntervalMinutes` until the user dismisses it.
 *
 * The repeats are a queue of individually scheduled notifications rather than
 * one repeating trigger, because each one has to be cancellable the moment the
 * user says they are awake. Returns the identifiers so the caller can do
 * exactly that; the queue is capped at WAKE_REPEAT_MAX either way.
 *
 * Always goes through a TIME_INTERVAL trigger, never `trigger: null`, because
 * `channelId` can only be set on a trigger object: with a null trigger, Android
 * drops the notification onto the default channel, losing the HIGH importance
 * and the ringtone configured on the waking channel. One second is the shortest
 * such trigger, and is imperceptible.
 */
async function scheduleWakeSeries(
  text: ReminderText,
  options: WakeSeriesOptions,
): Promise<string[]> {
  if (!Notifications) return [];
  try {
    if (!(await ensurePermission())) return [];
    const channelId = await ensureRingtoneChannel(options.ringtone, options.stream);
    await ensureWakingCategory(options.dismissLabel);
    const sound = getRingtone(options.ringtone).fileName ?? false;

    const firstAt = 1;
    const step = Math.max(1, Math.round(options.repeatIntervalMinutes)) * 60;
    const count = options.repeat ? WAKE_REPEAT_MAX + 1 : 1;

    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: text.title,
          body: text.body,
          // iOS has no channels, so the tone has to ride on the content there.
          sound,
          // iOS counterpart to the Android alarm channel: breaks through Focus
          // modes and the scheduled summary instead of being held back until
          // the next digest. Ignored on Android.
          interruptionLevel: 'timeSensitive',
          categoryIdentifier: WAKING_CATEGORY_ID,
          data: { adhkarType: 'waking', wakeSeries: true },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: firstAt + i * step,
          repeats: false,
          channelId,
        },
      });
      ids.push(id);
    }
    return ids;
  } catch {
    return [];
  }
}

/**
 * Stop a repeating wake series: drop everything still queued and clear anything
 * already sitting in the tray, so dismissing one copy silences the rest.
 */
async function cancelWakeSeries(ids: string[]): Promise<void> {
  if (!Notifications) return;
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // already fired or already cancelled
    }
  }
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const n of presented) {
      const data = n.request.content.data as { wakeSeries?: boolean } | undefined;
      if (data?.wakeSeries) await Notifications.dismissNotificationAsync(n.request.identifier);
    }
  } catch {
    // tray unavailable — non-fatal
  }
}

/** Milliseconds since the epoch at which a scheduled request will next fire. */
function triggerTime(trigger: unknown): number | null {
  const value = (trigger as { value?: unknown; date?: unknown } | null)?.value ??
    (trigger as { date?: unknown } | null)?.date;
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  return null;
}

/**
 * Drop the motion-mode backstop queued for the rest of today.
 *
 * Called the moment the sensor detects a wake-up, so the user is not reminded a
 * second time at the end of the window. Only today's copy goes — the following
 * days stay queued, which is why the backstop is dated rather than daily.
 */
async function cancelTodayBackstop(): Promise<void> {
  if (!Notifications) return;
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      const data = n.content.data as { backstop?: boolean } | undefined;
      if (data?.backstop !== true) continue;
      const at = triggerTime(n.trigger);
      if (at == null || at > endOfDay.getTime()) continue;
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  } catch {
    // Listing is unavailable on some platforms — the worst case is one extra
    // reminder at the end of the window, so this must never throw.
  }
}

/**
 * Clear the scheduled daily/prayer reminders while leaving an in-flight wake
 * series alone. A blanket cancelAll would silently stop a reminder that is
 * mid-ring just because the user opened the notification settings.
 */
async function cancelAllExceptWakeSeries(): Promise<void> {
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const survivors = scheduled.filter((n) => {
      const data = n.content.data as { wakeSeries?: boolean } | undefined;
      return data?.wakeSeries === true;
    });
    if (survivors.length === 0) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }
    for (const n of scheduled) {
      const data = n.content.data as { wakeSeries?: boolean } | undefined;
      if (data?.wakeSeries !== true) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch {
    // Listing is unavailable on some platforms — fall back to the blunt clear
    // rather than leaving stale reminders scheduled.
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// Cancel/reschedule is not atomic — two overlapping calls (rapid toggles, or a
// language change coinciding with a pref change) could interleave their
// cancelAll/schedule steps and leave a partial schedule. Chaining serializes
// every call so the final state always wins.
let rescheduleChain: Promise<ScheduledBackstops> = Promise.resolve({ ids: [], times: [] });

/**
 * (Re)schedule all adhkar reminders.
 *   morning/evening/sleep → fired at the day's Fajr/Asr/Isha (rolling 7-day window).
 *   waking → a daily reminder at `wakingTime` ("HH:MM"), the start of the user's
 *            waking window. This is the *fallback* for the accelerometer wake
 *            detection in `wakeDetection.ts`: sensors only run in the
 *            foreground, so a time-based trigger is what guarantees the waking
 *            adhkar still reach a user whose phone stayed locked all night.
 */
/** The end-of-window backstops now queued, and when each one fires. */
export interface ScheduledBackstops {
  ids: string[];
  times: number[];
}

const NO_BACKSTOPS: ScheduledBackstops = { ids: [], times: [] };

function rescheduleAdhkar(
  enabled: ScheduledReminders,
  texts: Record<ReminderKey, ReminderText>,
  waking: WakingSchedule,
): Promise<ScheduledBackstops> {
  const next = rescheduleChain
    .catch(() => NO_BACKSTOPS)
    .then(() => runReschedule(enabled, texts, waking));
  rescheduleChain = next;
  return next;
}

async function runReschedule(
  enabled: ScheduledReminders,
  texts: Record<ReminderKey, ReminderText>,
  waking: WakingSchedule,
): Promise<ScheduledBackstops> {
  const backstops: ScheduledBackstops = { ids: [], times: [] };
  if (!Notifications) return backstops;
  try {
    await cancelAllExceptWakeSeries();
    const anyEnabled =
      enabled.morning || enabled.evening || enabled.sleep || waking.timed || waking.motion;
    if (!anyEnabled) return backstops;
    if (!(await ensurePermission())) return backstops;
    await ensureAndroidChannel();

    // ── Waking ───────────────────────────────────────────────────────────────
    // Two independent reminders, both on the waking channel so the chosen tone
    // applies either way:
    //   timed  → every day at the start of the window.
    //   motion → a backstop at the *end* of the window, cancelled for the day
    //            as soon as the sensor fires.
    // They are deliberately not mutually exclusive. A user with both on wants
    // the backstop precisely because the sensor may never get a chance to run.
    if (waking.timed || waking.motion) {
      const channelId = await ensureRingtoneChannel(waking.ringtone, waking.stream);
      const sound = getRingtone(waking.ringtone).fileName ?? false;
      const content = {
        title: texts.waking.title,
        body: texts.waking.body,
        sound,
        // See scheduleWakeSeries — the iOS stand-in for the alarm channel.
        interruptionLevel: 'timeSensitive' as const,
      };

      if (waking.timed) {
        const at = parseHHMM(waking.start);
        if (at) {
          await Notifications.scheduleNotificationAsync({
            content: { ...content, data: { adhkarType: 'waking', backstop: false } },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: at.hour,
              minute: at.minute,
              channelId,
            },
          });
        }
      }

      if (waking.motion) {
        const at = parseHHMM(waking.end);
        if (at) {
          // Dated rather than daily, so the sensor firing can cancel just
          // today's copy without tearing down the whole series. Refreshed on
          // every launch, exactly like the prayer-anchored reminders.
          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);
          for (const date of upcomingDays()) {
            const when = new Date(date);
            when.setHours(at.hour, at.minute, 0, 0);
            if (when.getTime() <= Date.now()) continue;
            if (waking.remindedToday && when.getTime() <= endOfToday.getTime()) continue;
            const id = await Notifications.scheduleNotificationAsync({
              content: { ...content, data: { adhkarType: 'waking', backstop: true } },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: when,
                channelId,
              },
            });
            backstops.ids.push(id);
            backstops.times.push(when.getTime());
          }
        }
      }
    }

    // ── Morning / evening / sleep: anchored to prayer times. ─────────────────
    if (!(enabled.morning || enabled.evening || enabled.sleep)) return backstops;

    const dates = upcomingDays();

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
  return backstops;
}

/**
 * Ring the chosen tone through the real notification channel.
 *
 * The in-app preview plays through the media stream, so it proves only that the
 * WAV decodes — it stays audible even when the reminder itself is silent. This
 * goes down the exact path a reminder takes (same channel, same trigger shape),
 * which is the only way to confirm the tone before waiting for a real one.
 *
 * Deliberately carries no `adhkarType`, so the inbox ignores it and it cannot
 * mark the user as already-reminded for the day.
 */
async function playToneTest(
  text: ReminderText,
  ringtone: RingtoneId,
  stream: SoundStream,
): Promise<boolean> {
  if (!Notifications) return false;
  try {
    if (!(await ensurePermission())) return false;
    const channelId = await ensureRingtoneChannel(ringtone, stream);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: text.title,
        body: text.body,
        sound: getRingtone(ringtone).fileName ?? false,
        interruptionLevel: 'timeSensitive',
        data: { toneTest: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
        channelId,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export const notificationScheduler = {
  rescheduleAdhkar,
  /**
   * Ask for POST_NOTIFICATIONS.
   *
   * Motion detection schedules nothing up front — the foreground service posts
   * directly when it fires — so it never passes through the scheduling path
   * that normally prompts. Without this, a user whose only enabled reminder is
   * the motion one is never asked, and on Android 13+ the permission defaults
   * to denied: the service cannot even show its own ongoing notification, and
   * the reminder is dropped in silence.
   */
  requestPermission: ensurePermission,
  /** Current grant state, without prompting — for showing the user which gate
   *  is closed rather than leaving them to guess why nothing arrives. */
  hasPermission: async (): Promise<boolean> => {
    if (!Notifications) return false;
    try {
      return (await Notifications.getPermissionsAsync()).granted;
    } catch {
      return false;
    }
  },
  scheduleWakeSeries,
  cancelWakeSeries,
  cancelTodayBackstop,
  applyRingtone,
  inspectChannel,
  playToneTest,
  /** Create the Android notification channels up front (idempotent), sweeping
   *  away the ones left behind by an earlier tone, stream or app version. */
  setupChannel: async (ringtone: RingtoneId, stream: SoundStream): Promise<void> => {
    await ensureAndroidChannel();
    await applyRingtone(ringtone, stream);
  },
  /** False inside Expo Go, where expo-notifications is disabled (SDK 53). */
  isSupported: !isExpoGo && Notifications != null,
};
