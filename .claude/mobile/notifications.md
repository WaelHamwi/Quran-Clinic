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
- `expo-sensors` accelerometer, sampled at **5 Hz**. A pick-up transient lasts
  100–300 ms, so anything near 1 Hz simply misses it.
- **Two phases — settle, then arm.**
  - *Settling*: the phone must lie untouched for `wakeStillnessMinutes`
    (user-set, default 5, range 1–60). Sustained handling (≥3 samples over
    `MOTION_THRESHOLD`) restarts the period.
  - **Time spent backgrounded counts as settling** (`awaySince`). This is not an
    optimisation — it is what makes the feature possible at all. Sensors stop
    when the screen goes off, so a phone on a nightstand emits *no samples all
    night*: foreground-only stillness can never reach a period measured in
    minutes, and the reminder could never fire. The trade-off is that returning
    to the app inside the waking window after a long absence reads as waking up;
    that is bounded by the window and the once-a-day guard. The stamp is
    **persisted** (`lastActiveAt`) because Android kills backgrounded apps
    overnight, and **single-use** so one absence cannot arm the sensor twice.
  - **A credited absence is not enough on its own** (`REST_RUN_TO_ARM`). The
    sensor must also have *seen* the phone lying flat — 3 consecutive samples
    under `HELD_THRESHOLD`, not the looser `REST_EPSILON`, because the band
    between the two is exactly the tremor a hand produces. Without this the
    credit arms the sensor the instant sampling resumes, and the phone is in the
    user's hand precisely because handling it is what brought the app back: the
    reminder rang on opening the app or nudging a settings stepper. Mirrored in
    `WakeDetectionService.kt`, where it also covers a service restart.
  - *Armed*: once settled, the detector is deliberately **sensitive** and fires
    on either of two signals — two samples over `HOLD_THRESHOLD` (0.12 g, a
    pick-up), or `HELD_CONSECUTIVE` unbroken samples over `HELD_THRESHOLD`
    (0.03 g for 1.2 s, the phone simply sitting in a hand). No shake or gesture.
- **The JS detector plays the tone itself** (`ringtonePreview.playAlert`). It
  only ever fires in the foreground, so it need not trust the notification
  channel — which cannot be relied on to make a sound. Same reasoning as the
  service's `playTone`; only the OS-scheduled backstop still depends on it.
    A surface is dead flat *between* disturbances, so it is the **continuity**
    of faint movement — not its amplitude — that identifies a hand.
  - The reminder rings immediately on detection. There is deliberately **no**
    post-detection grace period: the settling period is the only time the user
    sets, and a second one was only ever confusing.
  - The settling run in front of the armed phase is the whole reason the low
    threshold is safe. Raising the period is the remedy for false alarms; it is
    the one knob the user is given.
- Three bands, not two: still (<0.06), **ambient** (0.06–0.15), handling (>0.15).
  Ambient vibration — traffic, a fan, a mattress — must NOT end a stillness run,
  or the gate never opens on a real nightstand.
- Only act within `wakingStartTime`–`wakingEndTime` (`notificationsSlice`).
- Fire the waking-adhkar notification at most once per day.
- Tapping it deep-links into `/adhkar` on the Waking tab.
## iOS — WHAT IS AND IS NOT POSSIBLE
**Background motion detection cannot be built on iOS.** There is no foreground
service and no sensors background mode; CoreMotion stops delivering the moment
the app is suspended. The only ways to stay alive are silent-audio or always-on
location, both of which are App Store rejections (guideline 2.5.4) and ruin
battery. Do not attempt them. On iOS the coverage is:
- foreground motion detection — works (the JS detector, `expo-sensors`);
- the scheduled reminder and end-of-window backstop — work with the app closed;
- the bundled ringtone — works (the plugin copies the files into the bundle;
  iOS caps notification sounds at 30 s, and ours are 12 s).
- `interruptionLevel: 'timeSensitive'` is the iOS stand-in for the Android alarm
  channel: it breaks through Focus modes and the scheduled summary. It needs the
  `com.apple.developer.usernotifications.time-sensitive` entitlement (declared in
  `app.json`) but **no** Apple approval. `critical` — the only level that
  bypasses the mute switch — does require an entitlement Apple must grant, so it
  is deliberately not used. iOS therefore has no alarm-volume equivalent.

## BACKGROUND DETECTION (Android foreground service)
`modules/wake-detection` is a **local Expo module** (autolinked from `./modules`,
no config plugin needed) that runs the same detection from a foreground service,
so a pick-up is caught with the app closed.

- **The thresholds in `WakeDetectionService.kt` must stay identical to
  `wakeDetection.ts`.** Two implementations of one behaviour: if they drift, the
  reminder behaves differently depending on whether the app happened to be open.
  Note Android reports m/s², so readings are divided by `GRAVITY_EARTH` to reach
  the shared g-based thresholds.
- **Only one detector runs at a time.** When the service is active the JS
  detector stands down and the JS end-of-window backstop is not scheduled —
  the service delivers its own backstop at the window end. Otherwise both fire.
- Prefers the **wake-up accelerometer** variant (keeps reporting while the CPU
  sleeps, no wake lock); falls back to a `PARTIAL_WAKE_LOCK` where absent.
- Samples only inside the waking window, on a day it has not already fired;
  an inexact `setAndAllowWhileIdle` alarm brings it back at the next boundary.
  `armedDay`/`lastFiredDay` live in SharedPreferences because Android may
  destroy and recreate the service between the window opening and closing.
- Class names in the module's `AndroidManifest.xml` are **fully qualified** — a
  relative `.Name` in a library manifest resolves against the *app's* package.
- **The service plays the tone itself** (`playTone`, `MediaPlayer` + vibration)
  and posts the notification with `setSilent(true)`. A channel's sound cannot be
  guaranteed to make a noise — it is frozen at creation, the user owns it
  afterwards, and it may sit on a muted stream — and all three failures deliver
  the notification silently and look identical from the app side. Playing it
  directly is the only way the motion reminder is guaranteed audible. If the
  requested stream's volume is zero, the other one is used.
  The OS-scheduled **backstop cannot do this** — no process is running when it
  fires, so it depends on the channel, and that is an accepted limit.
- A settings change restarts the stillness run (`startSampling` compares the
  running config). Without it, lowering the period satisfies the smaller
  threshold against the old accumulated time and rings instantly, while the user
  is still holding the phone on the settings screen.
- The service is useless without a battery-optimisation exemption; the settings
  screen surfaces that and links to the OS screen.

- **Sensors only run in the foreground.** Motion mode therefore also books a
  *backstop* at the **end** of the waking window (dated, rolling 7 days) so a
  phone locked all night still gets the reminder. `cancelTodayBackstop()` drops
  today's copy the moment the sensor fires; `remindedToday` (from the inbox)
  keeps a later reschedule from resurrecting it.
- The inbox is what tells detection it has already reminded the user today, so
  any notification that is not a real reminder must never be typed `waking`.

## RINGTONES (`ringtones.ts`)
Both waking reminders — the timed one and the motion-detected one — share one
user-chosen ringtone. Four tones ship with the app (`assets/sounds/tone_*.wav`,
registered under the `expo-notifications` plugin's `sounds` array in `app.json`),
plus `default` (OS tone), `device` (whatever the user set in system settings) and
`silent`.

- **A channel's sound and audio attributes are immutable once created**, so the
  channel id carries both the tone and the stream (`adhkar-waking-<tone>-<alm|
  ntf>-<CHANNEL_VERSION>`). Switching either means moving to a different channel
  and deleting the one left behind — never editing a channel in place.
  Android also *restores* a deleted channel's old settings if you re-create it
  under the same id, which is why `CHANNEL_VERSION` exists: bump it whenever the
  bundled sounds change, and move the outgoing ids to `LEGACY_CHANNEL_IDS`.
- The `device` channel (`adhkar-waking`) is the one the user owns. It is created
  but **never deleted or versioned**, so a tone they picked in Android's settings
  survives, and it ignores the stream preference.
- **Stream choice is the user's** (`wakeSoundStream`, default `notification`).
  `alarm` is semantically right for a wake-up and survives silent mode, but it
  rides the alarm volume slider — a phone with that slider down delivers the
  reminder in total silence while every other app still rings. The notification
  stream is audible whenever other apps are, so it is the default.
- Adding a bundled tone means a **new native build** — `sounds` is copied into
  `res/raw` at prebuild, so an OTA update alone cannot deliver it. A missing raw
  resource does not error: `SoundResolver` silently falls back to the OS default
  tone, so the tone appears "not to work" with nothing in the logs.
- Bundled tones can be previewed in-app (`ringtonePreview`, ~4.5 s via
  `expo-audio`), but that plays on the *media* stream and stays audible even when
  the reminder is silent. `playToneTest` posts through the real channel, which is
  the only way to exercise the actual delivery path; it carries no `adhkarType`,
  so unlike the old test button it cannot type itself into the inbox or stand
  detection down for the day.
- `inspectChannel` reads the live channel back off the device. A channel that was
  never created, or one the user muted in Android's settings, delivers the
  reminder to the tray silently and is invisible from the JS side — this is the
  only way to tell those apart without a logcat.

## USER PREFERENCES
Stored in `notificationsSlice` (persisted) and synced with the backend
(`GET/POST /notifications/preferences`):
`adhkarMorning`, `adhkarEvening`, `adhkarSleep`, `adhkarWaking` (booleans),
`wakingStartTime`, `wakingEndTime`, `pushToken`. `wakeRingtone` and
`wakeStillnessMinutes` are device-specific and deliberately **not** synced to
the backend.

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
