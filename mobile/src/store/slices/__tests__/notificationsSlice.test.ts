import reducer, {
  setAdhkarPref,
  setPreferences,
  setWakeMotionEnabled,
  setWakingHours,
  setAutoWakingHours,
  setWakingAuto,
  setWakeRepeatEnabled,
  setWakeRepeatInterval,
  setWakeRingtone,
  setWakeSoundStream,
  setWakeStillness,
  setLastActiveAt,
  setWakeSeriesIds,
  clearWakeSeriesIds,
  selectWakingWindow,
  WAKE_REPEAT_MIN_MINUTES,
  WAKE_REPEAT_MAX_MINUTES,
  WAKE_STILLNESS_MIN_MINUTES,
  WAKE_STILLNESS_MAX_MINUTES,
} from '@/store/slices/notificationsSlice';
import type { RootState } from '@/store/rootReducer';
import {
  DEFAULT_RINGTONE_ID,
  DEVICE_CHANNEL_ID,
  LEGACY_CHANNEL_IDS,
  MANAGED_CHANNEL_IDS,
  RINGTONES,
  getRingtone,
  ringtoneChannelId,
} from '@/services/notifications/ringtones';

const initial = reducer(undefined, { type: '@@INIT' });
const asRoot = (n: typeof initial) => ({ notifications: n }) as RootState;

describe('notificationsSlice waking window', () => {
  it('keeps the manual window when automatic mode overwrites its own pair', () => {
    let state = reducer(initial, setWakingHours({ start: '05:00', end: '06:15' }));
    state = reducer(state, setWakingAuto(true));
    state = reducer(state, setAutoWakingHours({ start: '04:12', end: '05:41' }));

    expect(selectWakingWindow(asRoot(state))).toEqual({ start: '04:12', end: '05:41' });
    expect(state.wakingStartTime).toBe('05:00');
    expect(state.wakingEndTime).toBe('06:15');
  });

  it('restores the manual window when automatic mode is turned off', () => {
    let state = reducer(initial, setWakingHours({ start: '05:00', end: '06:15' }));
    state = reducer(state, setWakingAuto(true));
    state = reducer(state, setAutoWakingHours({ start: '04:12', end: '05:41' }));
    state = reducer(state, setWakingAuto(false));

    expect(selectWakingWindow(asRoot(state))).toEqual({ start: '05:00', end: '06:15' });
  });

  it('reports the manual window while in manual mode', () => {
    const state = reducer(initial, setWakingHours({ start: '03:45', end: '07:00' }));
    expect(selectWakingWindow(asRoot(state))).toEqual({ start: '03:45', end: '07:00' });
  });
});

describe('notificationsSlice waking reminders are mutually exclusive', () => {
  it('starts with both off', () => {
    expect(initial.adhkarWaking).toBe(false);
    expect(initial.wakeMotionEnabled).toBe(false);
  });

  it('turning on the timed reminder turns motion detection off', () => {
    let state = reducer(initial, setWakeMotionEnabled(true));
    state = reducer(state, setAdhkarPref({ type: 'waking', enabled: true }));

    expect(state.adhkarWaking).toBe(true);
    expect(state.wakeMotionEnabled).toBe(false);
  });

  it('turning on motion detection turns the timed reminder off', () => {
    let state = reducer(initial, setAdhkarPref({ type: 'waking', enabled: true }));
    state = reducer(state, setWakeMotionEnabled(true));

    expect(state.wakeMotionEnabled).toBe(true);
    expect(state.adhkarWaking).toBe(false);
  });

  it('allows both to be off', () => {
    let state = reducer(initial, setWakeMotionEnabled(true));
    state = reducer(state, setWakeMotionEnabled(false));

    expect(state.adhkarWaking).toBe(false);
    expect(state.wakeMotionEnabled).toBe(false);
  });

  it('never leaves both on, whichever order they are set in', () => {
    let state = reducer(initial, setWakeMotionEnabled(true));
    state = reducer(state, setAdhkarPref({ type: 'waking', enabled: true }));
    state = reducer(state, setWakeMotionEnabled(true));
    state = reducer(state, setAdhkarPref({ type: 'waking', enabled: true }));

    expect(state.adhkarWaking && state.wakeMotionEnabled).toBe(false);
  });

  it('turning the timed reminder off leaves motion detection alone', () => {
    let state = reducer(initial, setWakeMotionEnabled(true));
    state = reducer(state, setAdhkarPref({ type: 'waking', enabled: false }));

    expect(state.wakeMotionEnabled).toBe(true);
  });

  it('a server payload enabling the timed reminder disarms motion detection', () => {
    const state = reducer(
      reducer(initial, setWakeMotionEnabled(true)),
      setPreferences({
        adhkar_morning_enabled: true,
        adhkar_evening_enabled: true,
        adhkar_sleep_enabled: true,
        adhkar_waking_enabled: true,
        waking_start_time: '04:30',
        waking_end_time: '06:00',
        waking_delay_minutes: 0,
      }),
    );

    expect(state.adhkarWaking).toBe(true);
    expect(state.wakeMotionEnabled).toBe(false);
  });
});

describe('notificationsSlice wake repeat', () => {
  it('is off by default with a 5-minute interval', () => {
    expect(initial.wakeRepeatEnabled).toBe(false);
    expect(initial.wakeRepeatIntervalMinutes).toBe(5);
  });

  it('toggles the repeat flag', () => {
    expect(reducer(initial, setWakeRepeatEnabled(true)).wakeRepeatEnabled).toBe(true);
  });

  it('clamps the interval to its bounds', () => {
    expect(reducer(initial, setWakeRepeatInterval(0)).wakeRepeatIntervalMinutes).toBe(
      WAKE_REPEAT_MIN_MINUTES,
    );
    expect(reducer(initial, setWakeRepeatInterval(999)).wakeRepeatIntervalMinutes).toBe(
      WAKE_REPEAT_MAX_MINUTES,
    );
    expect(reducer(initial, setWakeRepeatInterval(10)).wakeRepeatIntervalMinutes).toBe(10);
  });

  it('ignores a non-finite interval', () => {
    const state = reducer(initial, setWakeRepeatInterval(15));
    expect(reducer(state, setWakeRepeatInterval(NaN)).wakeRepeatIntervalMinutes).toBe(15);
  });
});

describe('notificationsSlice settling period', () => {
  it('defaults to five minutes', () => {
    expect(initial.wakeStillnessMinutes).toBe(5);
  });

  it('clamps to the supported range', () => {
    expect(reducer(initial, setWakeStillness(0)).wakeStillnessMinutes).toBe(
      WAKE_STILLNESS_MIN_MINUTES,
    );
    expect(reducer(initial, setWakeStillness(999)).wakeStillnessMinutes).toBe(
      WAKE_STILLNESS_MAX_MINUTES,
    );
  });

  it('ignores a non-finite period', () => {
    const state = reducer(initial, setWakeStillness(8));
    expect(reducer(state, setWakeStillness(NaN)).wakeStillnessMinutes).toBe(8);
  });

  // Persisted so an app killed overnight still knows how long it was away;
  // single-use so returning to a running app cannot arm the sensor twice.
  it('records and then spends the absence stamp', () => {
    expect(initial.lastActiveAt).toBeNull();
    const away = reducer(initial, setLastActiveAt(1_700_000_000_000));
    expect(away.lastActiveAt).toBe(1_700_000_000_000);
    expect(reducer(away, setLastActiveAt(null)).lastActiveAt).toBeNull();
  });
});

describe('notificationsSlice wake sound and series', () => {
  it('defaults to a bundled ringtone', () => {
    expect(initial.wakeRingtone).toBe(DEFAULT_RINGTONE_ID);
    expect(getRingtone(initial.wakeRingtone).preview).not.toBeNull();
  });

  it('switches the ringtone', () => {
    expect(reducer(initial, setWakeRingtone('dawn')).wakeRingtone).toBe('dawn');
    expect(reducer(initial, setWakeRingtone('device')).wakeRingtone).toBe('device');
  });

  it('defaults to the notification stream, which is audible whenever other apps are', () => {
    expect(initial.wakeSoundStream).toBe('notification');
  });

  // The JS detector cannot fire with the screen off, so motion detection without
  // the foreground service is a feature that silently never works.
  it('runs detection in the background by default', () => {
    expect(initial.wakeBackgroundEnabled).toBe(true);
  });

  it('switches the sound stream', () => {
    expect(reducer(initial, setWakeSoundStream('alarm')).wakeSoundStream).toBe('alarm');
  });

  it('gives every ringtone its own channel, since a channel sound is immutable', () => {
    const channels = RINGTONES.map((r) => ringtoneChannelId(r.id, 'notification'));
    expect(new Set(channels).size).toBe(channels.length);
  });

  it('separates the streams too, since audio attributes are equally immutable', () => {
    for (const r of RINGTONES) {
      if (r.id === 'device') continue;
      expect(ringtoneChannelId(r.id, 'alarm')).not.toBe(ringtoneChannelId(r.id, 'notification'));
    }
  });

  it('pins the device tone to the user-owned channel on both streams', () => {
    expect(ringtoneChannelId('device', 'alarm')).toBe(DEVICE_CHANNEL_ID);
    expect(ringtoneChannelId('device', 'notification')).toBe(DEVICE_CHANNEL_ID);
  });

  it('never lists the user-owned device channel as one the app may delete', () => {
    expect(MANAGED_CHANNEL_IDS).not.toContain(DEVICE_CHANNEL_ID);
    expect(LEGACY_CHANNEL_IDS).not.toContain(DEVICE_CHANNEL_ID);
  });

  it('tracks and clears the queued series identifiers', () => {
    const queued = reducer(initial, setWakeSeriesIds(['a', 'b', 'c']));
    expect(queued.wakeSeriesIds).toEqual(['a', 'b', 'c']);
    expect(reducer(queued, clearWakeSeriesIds()).wakeSeriesIds).toEqual([]);
  });
});
