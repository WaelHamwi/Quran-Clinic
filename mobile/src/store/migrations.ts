import { notificationsInitialState } from '@/store/slices/notificationsSlice';

// v2: reset hasCompletedOnboarding so all existing devices see onboarding on next launch.
// v3: favorites moved from numeric ids to composite `${kind}:${id}` keys + carry a route.
// v4: backfill notification defaults — see below.
export const migrations = {
  2: (state: any) => ({
    ...state,
    onboarding: {
      hasCompletedOnboarding: false,
      sponsorShownThisSession: false,
      currentStep: 0,
    },
  }),
  3: (state: any) => {
    const oldItems = state?.favorites?.items ?? {};
    const items: Record<string, any> = {};
    for (const [key, value] of Object.entries<any>(oldItems)) {
      // Skip entries already migrated (composite string keys).
      if (key.includes(':')) {
        items[key] = value;
        continue;
      }
      const id = value?.id ?? Number(key);
      items[`disease:${id}`] = {
        ...value,
        favoriteKind: 'disease',
        route: `/hospital/disease/${value?.slug ?? ''}`,
      };
    }
    return { ...state, favorites: { ...state?.favorites, items } };
  },
  // The default stateReconciler (autoMergeLevel1) swaps in the persisted slice
  // wholesale, so every field added to `notifications` after a device last wrote
  // its state came back `undefined` — the delay and repeat steppers rendered
  // "undefined min". Backfill the defaults underneath whatever the device
  // already stored, so the user's own settings still win.
  4: (state: any) => ({
    ...state,
    notifications: { ...notificationsInitialState, ...(state?.notifications ?? {}) },
  }),
  // v5: the two-way `wakeSoundMode` ('app' | 'device') became a full ringtone
  // choice. 'device' is still a ringtone id, so it carries over as-is; 'app'
  // meant "the OS notification tone", which is now 'default'.
  5: (state: any) => {
    const { wakeSoundMode, ...rest } = state?.notifications ?? {};
    return {
      ...state,
      notifications: {
        ...notificationsInitialState,
        ...rest,
        wakeRingtone: wakeSoundMode === 'device' ? 'device' : 'default',
      },
    };
  },
  // v6: the accelerometer's stillness period became a user setting. Devices
  // already on v5 run no earlier migration, so the new field needs backfilling
  // or the stepper renders "undefined min" — the same trap as v4.
  6: (state: any) => ({
    ...state,
    notifications: { ...notificationsInitialState, ...(state?.notifications ?? {}) },
  }),
  // v7: `lastActiveAt` — same backfill trap as v4 and v6.
  7: (state: any) => ({
    ...state,
    notifications: { ...notificationsInitialState, ...(state?.notifications ?? {}) },
  }),
  // v8: background (foreground-service) detection and its sampling rate.
  8: (state: any) => ({
    ...state,
    notifications: { ...notificationsInitialState, ...(state?.notifications ?? {}) },
  }),
  // v9: backstop identifiers, so the foreground service can cancel today's copy
  // when the sensor beats it to the wake-up.
  9: (state: any) => ({
    ...state,
    notifications: { ...notificationsInitialState, ...(state?.notifications ?? {}) },
  }),
  // v10: the waking tone used to be pinned to the alarm stream, which is silent
  // on any phone whose alarm volume is down even while every other app rings.
  // Existing devices are moved onto the notification stream — the audible
  // default — rather than inheriting the setting that produced the silence.
  10: (state: any) => ({
    ...state,
    notifications: {
      ...notificationsInitialState,
      ...(state?.notifications ?? {}),
      wakeSoundStream: 'notification',
    },
  }),
  // v11: background detection became the default. Anyone who had already turned
  // motion detection on was running the JS detector alone, which cannot fire
  // with the screen off — the case the feature exists for.
  11: (state: any) => ({
    ...state,
    notifications: {
      ...notificationsInitialState,
      ...(state?.notifications ?? {}),
      wakeBackgroundEnabled: true,
    },
  }),
};

export const PERSIST_VERSION = 11;
