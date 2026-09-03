import { migrations, PERSIST_VERSION } from '@/store/migrations';
import { notificationsInitialState } from '@/store/slices/notificationsSlice';
import { DEFAULT_RINGTONE_ID } from '@/services/notifications/ringtones';

describe('persist migration 4 — notification defaults backfill', () => {
  // What a device that last wrote its state before the wake settings existed
  // has sitting in AsyncStorage.
  const legacyNotifications = {
    adhkarMorning: true,
    adhkarEvening: false,
    adhkarSleep: true,
    adhkarWaking: true,
    wakingAuto: true,
    wakingStartTime: '05:00',
    wakingEndTime: '06:30',
    wakingAutoStartTime: '04:12',
    wakingAutoEndTime: '05:41',
    pushToken: 'tok',
    permissionGranted: true,
  };

  it('fills in every field the old state never had', () => {
    const migrated = migrations[4]({ notifications: legacyNotifications });

    expect(migrated.notifications.wakeStillnessMinutes).toBe(5);
    expect(migrated.notifications.wakeRepeatEnabled).toBe(false);
    expect(migrated.notifications.wakeRepeatIntervalMinutes).toBe(5);
    expect(migrated.notifications.wakeRingtone).toBe(DEFAULT_RINGTONE_ID);
    expect(migrated.notifications.wakeMotionEnabled).toBe(false);
    expect(migrated.notifications.wakeSeriesIds).toEqual([]);
  });

  it('leaves no undefined field behind', () => {
    const migrated = migrations[4]({ notifications: legacyNotifications });

    for (const key of Object.keys(notificationsInitialState)) {
      expect(migrated.notifications[key]).toBeDefined();
    }
  });

  it('keeps the values the user had already chosen', () => {
    const migrated = migrations[4]({ notifications: legacyNotifications });

    expect(migrated.notifications.adhkarEvening).toBe(false);
    expect(migrated.notifications.wakingStartTime).toBe('05:00');
    expect(migrated.notifications.wakingAuto).toBe(true);
    expect(migrated.notifications.pushToken).toBe('tok');
  });

  it('does not disturb other slices', () => {
    const migrated = migrations[4]({
      notifications: legacyNotifications,
      auth: { token: 'abc' },
    });

    expect(migrated.auth).toEqual({ token: 'abc' });
  });

  it('survives a device with no persisted notifications at all', () => {
    expect(migrations[4]({}).notifications).toEqual(notificationsInitialState);
    expect(migrations[4](undefined).notifications).toEqual(notificationsInitialState);
  });

  it('is the newest migration, and the store persists at that version', () => {
    expect(Math.max(...Object.keys(migrations).map(Number))).toBe(PERSIST_VERSION);
  });
});

describe('migration 6 — the settling period becomes a setting', () => {
  it('backfills the default for a device that predates it', () => {
    expect(migrations[6]({ notifications: { wakeMotionEnabled: true } }).notifications)
      .toMatchObject({ wakeMotionEnabled: true, wakeStillnessMinutes: 5 });
  });

  it('keeps a period the user had already chosen', () => {
    expect(
      migrations[6]({ notifications: { wakeStillnessMinutes: 12 } }).notifications
        .wakeStillnessMinutes,
    ).toBe(12);
  });
});

describe('migration 5 — wakeSoundMode becomes a ringtone choice', () => {
  it("maps the old app tone onto the system default", () => {
    const migrated = migrations[5]({ notifications: { wakeSoundMode: 'app' } });

    expect(migrated.notifications.wakeRingtone).toBe('default');
    expect(migrated.notifications.wakeSoundMode).toBeUndefined();
  });

  it('keeps a device tone on the channel the user already customised', () => {
    expect(
      migrations[5]({ notifications: { wakeSoundMode: 'device' } }).notifications.wakeRingtone,
    ).toBe('device');
  });

  it('leaves the rest of the notification preferences intact', () => {
    const migrated = migrations[5]({
      notifications: { wakeSoundMode: 'app', wakingStartTime: '05:15', wakeMotionEnabled: true },
    });

    expect(migrated.notifications.wakingStartTime).toBe('05:15');
    expect(migrated.notifications.wakeMotionEnabled).toBe(true);
  });

  it('survives a device with no persisted notifications at all', () => {
    expect(migrations[5]({}).notifications.wakeRingtone).toBe('default');
    expect(migrations[5](undefined).notifications.wakeRingtone).toBe('default');
  });
});
