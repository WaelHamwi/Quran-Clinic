# NOTIFICATIONS DESIGN

⚠ Expo Go limitation: since SDK 53, **remote push notifications do not work in Expo
Go** — a development build is needed for push. **Local/scheduled notifications still
work in Expo Go.** Build the adhkar reminders on local scheduled notifications; gate
push-token registration behind a dev-build check. `expo-notifications` and
`expo-sensors` are not yet installed — add them in this phase.

## NOTIFICATION TYPES
- `adhkar_morning` — scheduled after Fajr.
- `adhkar_evening` — scheduled after Asr.
- `adhkar_sleep` — scheduled before bedtime (user-defined time).
- `adhkar_waking` — triggered when the motion sensor detects wake-up within the
  user's waking-hours window.

## PRAYER TIMES
- Compute Fajr/Dhuhr/Asr/Maghrib/Isha from the device location, or fetch from a
  prayer-times API. Confirm the chosen source before building.
- Recompute daily; reschedule morning/evening notifications accordingly.

## WAKE DETECTION
- `expo-sensors` accelerometer; detect significant motion (magnitude over a threshold).
- Only act within `wakingStartTime`–`wakingEndTime` (`notificationsSlice`).
- Fire the waking-adhkar notification at most once per day.
- Tapping it deep-links into `/adhkar` on the Waking tab.

## USER PREFERENCES
Stored in `notificationsSlice` (persisted) and synced with the backend
(`GET/POST /notifications/preferences`):
`adhkarMorning`, `adhkarEvening`, `adhkarSleep`, `adhkarWaking` (booleans),
`wakingStartTime`, `wakingEndTime`, `pushToken`.

## notificationService.ts (device side)
- `scheduleAdhkarNotification(type, trigger)` — schedule a local notification.
- `cancelAllAdhkarNotifications()` — cancel all scheduled.
- `rescheduleAll(preferences, prayerTimes)` — recompute and reschedule.
- `registerForPushNotifications()` — dev build only; obtains a token, posts it via
  `POST /notifications/token`.
- `handleNotificationResponse(response)` — routes a tap to the right `/adhkar` tab.
- `startWakeDetection()` / `stopWakeDetection()` — accelerometer listener lifecycle.

## INTEGRATION
- On launch / when preferences change: `useNotificationPreferences` calls
  `rescheduleAll`.
- Permissions requested on first enable of any reminder, not at startup.
- Clean up sensor and notification listeners on unmount.
- Respect feature-visibility flags — if notifications are disabled for the app, skip
  scheduling entirely.
