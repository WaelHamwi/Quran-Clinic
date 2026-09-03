import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { AdhkarTime } from '@/types/adhkar';
import type { NotificationPreferences } from '@/types/notification';
import type { RootState } from '@/store/rootReducer';
import {
  DEFAULT_RINGTONE_ID,
  type RingtoneId,
  type SoundStream,
} from '@/services/notifications/ringtones';

/** Upper bound on the post-detection grace period, and the stepper's increment. */
/** How often the accelerometer is polled. Lower is more responsive and costs
 *  more battery; the labels the user sees are in `i18n`. */
export const WAKE_SAMPLE_INTERVALS_MS = [100, 200, 500] as const;
export type WakeSampleIntervalMs = (typeof WAKE_SAMPLE_INTERVALS_MS)[number];

/** Bounds for how long the phone must lie untouched before the sensor arms. */
export const WAKE_STILLNESS_MIN_MINUTES = 1;
export const WAKE_STILLNESS_MAX_MINUTES = 60;

/** Bounds for the gap between repeats of an undismissed wake reminder. */
export const WAKE_REPEAT_MIN_MINUTES = 1;
export const WAKE_REPEAT_MAX_MINUTES = 30;


export interface NotificationsState {
  adhkarMorning: boolean;
  adhkarEvening: boolean;
  adhkarSleep: boolean;
  /** The *timed* waking reminder, fired at the start of the waking window.
   *  Mutually exclusive with `wakeMotionEnabled`. */
  adhkarWaking: boolean;
  /** The *motion-detected* waking reminder (accelerometer, SRS FR-14.2).
   *  Mutually exclusive with `adhkarWaking`; both may be off. Local-only. */
  wakeMotionEnabled: boolean;
  /** When true the waking window is derived from prayer times, not set manually.
   *  Local-only preference — not part of the backend NotificationPreferences payload. */
  wakingAuto: boolean;
  /** The user's hand-set window. Kept separate from the prayer-derived one so
   *  switching to automatic and back doesn't destroy what they typed. */
  wakingStartTime: string;
  wakingEndTime: string;
  /** The window computed from today's Fajr → sunrise. */
  wakingAutoStartTime: string;
  wakingAutoEndTime: string;
  /** How long the phone must lie untouched before the accelerometer arms.
   *  Once armed, the lightest handling fires the reminder — the stillness run is
   *  what makes that safe, so this is the knob that trades false alarms against
   *  how long the phone has to be left alone. */
  wakeStillnessMinutes: number;
  /** Run detection in a foreground service, so a pick-up is caught with the app
   *  closed. Android forces a permanent notification in return, which is why
   *  this is the user's choice and not the default. Android-only. */
  wakeBackgroundEnabled: boolean;
  wakeSampleIntervalMs: WakeSampleIntervalMs;
  /** Keep re-ringing the waking reminder until the user dismisses it. */
  wakeRepeatEnabled: boolean;
  wakeRepeatIntervalMinutes: number;
  /** Ringtone for both waking reminders — the timed one and the motion-detected
   *  one. Device-specific, so deliberately not synced to the backend. */
  wakeRingtone: RingtoneId;
  /** Which audio stream the tone plays on. Defaults to the notification stream
   *  because it is audible whenever any other app's notifications are; the
   *  alarm stream is louder and beats silent mode, but rides a separate volume
   *  slider that is silent on plenty of phones. See `SoundStream`. */
  wakeSoundStream: SoundStream;
  /** When the app was last backgrounded, or null once it has been spent.
   *  Persisted because Android routinely kills a backgrounded app overnight —
   *  the in-memory stamp dies with the process, and without this the settling
   *  period would restart from zero on the next launch. Single-use: cleared the
   *  moment wake detection consumes it, so returning to a *running* app cannot
   *  arm the sensor twice off one absence. */
  lastActiveAt: number | null;
  /** Identifiers of the queued end-of-window backstops, and the moment each one
   *  fires. Handed to the foreground service so that, when the sensor catches
   *  the wake-up first, it can cancel *today's* backstop and leave the coming
   *  days' alone. The backstop itself is always scheduled through the OS, so it
   *  survives the service being killed — which is the whole point of it. */
  backstopIds: string[];
  backstopTimes: number[];
  /** Identifiers of the wake reminders currently queued, so the series can be
   *  cancelled on dismissal — persisted so it survives an app restart. */
  wakeSeriesIds: string[];
  pushToken: string | null;
  permissionGranted: boolean;
}

export const notificationsInitialState: NotificationsState = {
  adhkarMorning: false,
  adhkarEvening: false,
  adhkarSleep: false,
  adhkarWaking: false,
  wakeMotionEnabled: false,
  wakingAuto: false,
  wakingStartTime: '04:30',
  wakingEndTime: '07:30',
  wakingAutoStartTime: '04:30',
  wakingAutoEndTime: '07:30',
  wakeStillnessMinutes: 5,
  // On by default: detection with the app closed *is* the feature, and the JS
  // detector cannot do it — Android stops delivering sensor events once the
  // screen goes off. Left opt-in, turning motion detection on silently gave a
  // detector that could never fire overnight. Nothing starts until
  // `wakeMotionEnabled` is also on, so this costs nothing on its own.
  wakeBackgroundEnabled: true,
  wakeSampleIntervalMs: 200,
  wakeRepeatEnabled: false,
  wakeRepeatIntervalMinutes: 5,
  wakeRingtone: DEFAULT_RINGTONE_ID,
  wakeSoundStream: 'notification',
  lastActiveAt: null,
  backstopIds: [],
  backstopTimes: [],
  wakeSeriesIds: [],
  pushToken: null,
  permissionGranted: false,
};

/** Notification preferences. Persisted; synced with the backend. */
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: notificationsInitialState,
  reducers: {
    setAdhkarPref(state, action: PayloadAction<{ type: AdhkarTime; enabled: boolean }>) {
      switch (action.payload.type) {
        case 'morning':
          state.adhkarMorning = action.payload.enabled;
          break;
        case 'evening':
          state.adhkarEvening = action.payload.enabled;
          break;
        case 'sleep':
          state.adhkarSleep = action.payload.enabled;
          break;
        case 'waking':
          state.adhkarWaking = action.payload.enabled;
          // The timed and motion-detected waking reminders are two ways to
          // deliver the same adhkar, so only one may be armed at a time.
          if (action.payload.enabled) state.wakeMotionEnabled = false;
          break;
      }
    },
    setWakeMotionEnabled(state, action: PayloadAction<boolean>) {
      state.wakeMotionEnabled = action.payload;
      if (action.payload) state.adhkarWaking = false;
    },
    setWakingHours(state, action: PayloadAction<{ start: string; end: string }>) {
      state.wakingStartTime = action.payload.start;
      state.wakingEndTime = action.payload.end;
    },
    setAutoWakingHours(state, action: PayloadAction<{ start: string; end: string }>) {
      state.wakingAutoStartTime = action.payload.start;
      state.wakingAutoEndTime = action.payload.end;
    },
    setWakingAuto(state, action: PayloadAction<boolean>) {
      state.wakingAuto = action.payload;
    },
    setWakeStillness(state, action: PayloadAction<number>) {
      const minutes = Math.round(action.payload);
      if (!Number.isFinite(minutes)) return;
      state.wakeStillnessMinutes = Math.min(
        WAKE_STILLNESS_MAX_MINUTES,
        Math.max(WAKE_STILLNESS_MIN_MINUTES, minutes),
      );
    },
    setWakeRepeatEnabled(state, action: PayloadAction<boolean>) {
      state.wakeRepeatEnabled = action.payload;
    },
    setWakeRepeatInterval(state, action: PayloadAction<number>) {
      const minutes = Math.round(action.payload);
      if (!Number.isFinite(minutes)) return;
      state.wakeRepeatIntervalMinutes = Math.min(
        WAKE_REPEAT_MAX_MINUTES,
        Math.max(WAKE_REPEAT_MIN_MINUTES, minutes),
      );
    },
    setWakeRingtone(state, action: PayloadAction<RingtoneId>) {
      state.wakeRingtone = action.payload;
    },
    setWakeSoundStream(state, action: PayloadAction<SoundStream>) {
      state.wakeSoundStream = action.payload;
    },
    setWakeBackgroundEnabled(state, action: PayloadAction<boolean>) {
      state.wakeBackgroundEnabled = action.payload;
    },
    setWakeSampleInterval(state, action: PayloadAction<WakeSampleIntervalMs>) {
      if (!WAKE_SAMPLE_INTERVALS_MS.includes(action.payload)) return;
      state.wakeSampleIntervalMs = action.payload;
    },
    setLastActiveAt(state, action: PayloadAction<number | null>) {
      state.lastActiveAt = action.payload;
    },
    setBackstops(state, action: PayloadAction<{ ids: string[]; times: number[] }>) {
      state.backstopIds = action.payload.ids;
      state.backstopTimes = action.payload.times;
    },
    setWakeSeriesIds(state, action: PayloadAction<string[]>) {
      state.wakeSeriesIds = action.payload;
    },
    clearWakeSeriesIds(state) {
      state.wakeSeriesIds = [];
    },
    setPushToken(state, action: PayloadAction<string | null>) {
      state.pushToken = action.payload;
    },
    setPermissionGranted(state, action: PayloadAction<boolean>) {
      state.permissionGranted = action.payload;
    },
    setPreferences(state, action: PayloadAction<NotificationPreferences>) {
      const p = action.payload;
      state.adhkarMorning = p.adhkar_morning_enabled;
      state.adhkarEvening = p.adhkar_evening_enabled;
      state.adhkarSleep = p.adhkar_sleep_enabled;
      state.adhkarWaking = p.adhkar_waking_enabled;
      // The server only knows the timed reminder, so a remote "on" has to stand
      // the motion one down or the device would end up with both armed.
      if (p.adhkar_waking_enabled) state.wakeMotionEnabled = false;
      // The server stores whichever window was in effect; it has no notion of
      // the auto/manual split, so restore it as the manual one.
      if (p.waking_start_time) state.wakingStartTime = p.waking_start_time;
      if (p.waking_end_time) state.wakingEndTime = p.waking_end_time;
    },
  },
});

export const {
  setAdhkarPref,
  setWakingHours,
  setAutoWakingHours,
  setWakingAuto,
  setWakeStillness,
  setWakeBackgroundEnabled,
  setWakeSampleInterval,
  setWakeMotionEnabled,
  setWakeRepeatEnabled,
  setWakeRepeatInterval,
  setWakeRingtone,
  setWakeSoundStream,
  setLastActiveAt,
  setBackstops,
  setWakeSeriesIds,
  clearWakeSeriesIds,
  setPushToken,
  setPermissionGranted,
  setPreferences,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;

export const selectNotifications = (s: RootState): NotificationsState => s.notifications;

/** The waking window actually in effect — the prayer-derived one in automatic
 *  mode, the hand-set one otherwise. Everything that schedules or syncs the
 *  window must read it from here, never from the raw fields. */
export const selectWakingWindow = createSelector(
  selectNotifications,
  (n): { start: string; end: string } =>
    n.wakingAuto
      ? { start: n.wakingAutoStartTime, end: n.wakingAutoEndTime }
      : { start: n.wakingStartTime, end: n.wakingEndTime },
);
export const selectAdhkarEnabled = (s: RootState, type: AdhkarTime): boolean => {
  switch (type) {
    case 'morning':
      return s.notifications.adhkarMorning;
    case 'evening':
      return s.notifications.adhkarEvening;
    case 'sleep':
      return s.notifications.adhkarSleep;
    case 'waking':
      return s.notifications.adhkarWaking;
  }
};
