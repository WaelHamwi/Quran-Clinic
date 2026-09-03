package expo.modules.wakedetection

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import java.util.Calendar
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Detects the user waking up while the app is closed.
 *
 * The JS detector in `src/services/notifications/wakeDetection.ts` can only run
 * while the app is foregrounded, because Android stops delivering sensor events
 * once the process is backgrounded. This service exists to do the same job from
 * a foreground service, which keeps the sensor alive with the screen off. The
 * thresholds below are deliberately identical to the JS ones — the two must
 * agree, or the reminder behaves differently depending on whether the app
 * happened to be open.
 */
class WakeDetectionService : Service(), SensorEventListener {

  companion object {
    const val ACTION_START = "expo.modules.wakedetection.START"
    const val ACTION_STOP = "expo.modules.wakedetection.STOP"
    const val ACTION_SYNC = "expo.modules.wakedetection.SYNC"
    const val ACTION_DISMISS = "expo.modules.wakedetection.DISMISS"

    private const val ONGOING_NOTIFICATION_ID = 8801
    private const val REMINDER_NOTIFICATION_ID = 8802
    private const val SERVICE_CHANNEL_ID = "wake-detection-service"

    // Identical to the JS detector. See wakeDetection.ts for the reasoning.
    private const val REST_EPSILON = 0.06
    private const val MOTION_THRESHOLD = 0.15
    private const val HOLD_THRESHOLD = 0.12
    private const val HOLD_BURST_SAMPLES = 2
    private const val HELD_THRESHOLD = 0.03
    private const val HELD_DURATION_MS = 1000L
    private const val WAKE_BURST_SAMPLES = 3
    private const val BURST_WINDOW_MS = 1500L
    // The sensor must have seen the phone lying flat before it may arm, so a
    // service that starts (or restarts) with the phone already in a hand cannot
    // ring straight away. Mirrors REST_RUN_TO_ARM in wakeDetection.ts.
    private const val REST_RUN_TO_ARM = 3

    fun start(context: Context) {
      val intent = Intent(context, WakeDetectionService::class.java).setAction(ACTION_START)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      context.startService(
        Intent(context, WakeDetectionService::class.java).setAction(ACTION_STOP)
      )
    }
  }

  private var config: WakeConfig? = null
  private var sensorManager: SensorManager? = null
  private var sensor: Sensor? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var sampling = false
  // The settings the current sampling run was started with, so a change to
  // either can be told apart from a plain restart. See startSampling.
  private var samplingStillnessMinutes = -1
  private var samplingIntervalMs = -1

  private val handler = Handler(Looper.getMainLooper())
  private var repeatsPosted = 0

  private var stillSince: Long? = null
  private var heldSince: Long? = null
  private var restRun = 0
  private var restObserved = false
  private val burst = ArrayDeque<Long>()

  private var player: MediaPlayer? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    sensorManager = getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    // The wake-up variant keeps reporting while the application processor
    // sleeps, which is the whole point here and far cheaper than holding a wake
    // lock. Not every device has one, hence the fallback below.
    sensor = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER, true)
        ?: sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    } else {
      sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    config = WakeConfig.load(this)
    val current = config

    if (current == null || !current.enabled) {
      stopEverything()
      return START_NOT_STICKY
    }

    startForegroundSafely(current)

    when (intent?.action) {
      ACTION_STOP -> {
        stopEverything()
        return START_NOT_STICKY
      }
      ACTION_DISMISS -> cancelRepeats()
      else -> Unit
    }

    syncSampling()
    // STICKY so Android brings the service back if it reclaims the process.
    return START_STICKY
  }

  override fun onDestroy() {
    stopSampling()
    releasePlayer()
    handler.removeCallbacksAndMessages(null)
    super.onDestroy()
  }

  // ── Foreground notification ────────────────────────────────────────────────

  private fun startForegroundSafely(cfg: WakeConfig) {
    ensureServiceChannel()
    val notification = NotificationCompat.Builder(this, SERVICE_CHANNEL_ID)
      .setContentTitle(cfg.serviceTitle)
      .setContentText(cfg.serviceBody)
      .setSmallIcon(applicationInfo.icon)
      .setOngoing(true)
      .setSilent(true)
      .setPriority(NotificationCompat.PRIORITY_MIN)
      .setContentIntent(launchAppIntent())
      .build()

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        startForeground(
          ONGOING_NOTIFICATION_ID,
          notification,
          ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        )
      } else {
        startForeground(ONGOING_NOTIFICATION_ID, notification)
      }
    } catch (_: Exception) {
      // Notifications denied, or a background-start restriction. Nothing can be
      // done from here; the JS-side backstop reminder still covers the user.
    }
  }

  private fun ensureServiceChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java) ?: return
    if (manager.getNotificationChannel(SERVICE_CHANNEL_ID) != null) return
    val channel = NotificationChannel(
      SERVICE_CHANNEL_ID,
      "Wake detection",
      NotificationManager.IMPORTANCE_MIN
    )
    channel.setShowBadge(false)
    channel.enableVibration(false)
    channel.setSound(null, null)
    manager.createNotificationChannel(channel)
  }

  private fun launchAppIntent(): PendingIntent? {
    val launch = packageManager.getLaunchIntentForPackage(packageName) ?: return null
    return PendingIntent.getActivity(
      this, 0, launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  // ── Sampling lifecycle ─────────────────────────────────────────────────────

  /**
   * Sample only while it can achieve something: inside the waking window, and
   * only on a day the reminder has not already been delivered. Outside that, an
   * alarm brings the service back at the next window start rather than leaving
   * the accelerometer running for the other twenty hours of the day.
   */
  private fun syncSampling() {
    val cfg = config ?: return
    val today = WakeConfig.today()
    val firedToday = WakeConfig.lastFiredDay(this) == today
    val inWindow = isWithinWindow(minutesOfDay(), cfg.startTime, cfg.endTime)

    if (!firedToday && inWindow) {
      WakeConfig.markArmedToday(this)
      startSampling(cfg)
      scheduleWakeAt(nextBoundaryMillis(cfg.endTime))
      return
    }

    stopSampling()
    // No backstop is delivered here. The JS scheduler books it through the OS,
    // which keeps it alive even when this service is killed by the system or an
    // OEM battery manager — precisely the case a backstop exists to cover.
    // Posting one here as well would only ever double up.
    scheduleWakeAt(nextBoundaryMillis(cfg.startTime))
  }

  private fun startSampling(cfg: WakeConfig) {
    if (sampling) {
      // Unchanged settings: leave the stillness run alone, or every routine
      // restart would reset a period that is measured in minutes.
      if (cfg.stillnessMinutes == samplingStillnessMinutes &&
        cfg.sampleIntervalMs == samplingIntervalMs
      ) {
        return
      }
      // Changed settings: the run has to start again from zero. The user has
      // the phone in their hand to make the change, so the stillness behind it
      // is no longer true — and shortening the period would otherwise satisfy
      // the new, smaller threshold against the old accumulated time, arming the
      // sensor instantly and ringing while they are still on the settings
      // screen. Restarting also re-registers the listener at the new rate.
      stopSampling()
    }
    val manager = sensorManager ?: return
    val target = sensor ?: return

    resetDetectionState()
    val periodUs = cfg.sampleIntervalMs.coerceIn(50, 2000) * 1000
    val registered = manager.registerListener(this, target, periodUs)
    if (!registered) return
    sampling = true
    samplingStillnessMinutes = cfg.stillnessMinutes
    samplingIntervalMs = cfg.sampleIntervalMs

    // Only needed when the device has no wake-up accelerometer; without it the
    // CPU sleeps and no samples arrive with the screen off.
    if (!target.isWakeUpSensor) {
      val power = getSystemService(Context.POWER_SERVICE) as? PowerManager
      val lock = power?.newWakeLock(
        PowerManager.PARTIAL_WAKE_LOCK,
        "QuranicClinic:wakeDetection"
      )
      try {
        lock?.acquire()
        wakeLock = lock
      } catch (_: Exception) {
        wakeLock = null
      }
    }
  }

  private fun stopSampling() {
    if (sampling) sensorManager?.unregisterListener(this)
    sampling = false
    samplingStillnessMinutes = -1
    samplingIntervalMs = -1
    resetDetectionState()
    try {
      if (wakeLock?.isHeld == true) wakeLock?.release()
    } catch (_: Exception) {
      // already released
    }
    wakeLock = null
  }

  private fun stopEverything() {
    cancelRepeats()
    stopSampling()
    cancelScheduledWake()
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  private fun resetDetectionState() {
    stillSince = null
    heldSince = null
    restRun = 0
    restObserved = false
    burst.clear()
  }

  // ── Detection — must stay in step with wakeDetection.ts ────────────────────

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

  override fun onSensorChanged(event: SensorEvent?) {
    val cfg = config ?: return
    val values = event?.values ?: return
    if (values.size < 3) return

    // Android reports m/s²; the shared thresholds are in g.
    val magnitude = sqrt(
      values[0] * values[0] + values[1] * values[1] + values[2] * values[2]
    ) / SensorManager.GRAVITY_EARTH
    val deviation = abs(magnitude - 1.0)
    val at = System.currentTimeMillis()

    while (burst.isNotEmpty() && at - burst.first() > BURST_WINDOW_MS) burst.removeFirst()

    // Dead flat, by HELD_THRESHOLD rather than the looser REST_EPSILON: the band
    // between the two is exactly the faint tremor a hand produces, so counting
    // it would let a held phone satisfy the gate it is meant to fail.
    if (deviation < HELD_THRESHOLD) {
      restRun++
      if (restRun >= REST_RUN_TO_ARM) restObserved = true
    } else {
      restRun = 0
    }

    val stillnessMs = cfg.stillnessMinutes.coerceAtLeast(1) * 60_000L
    val settledAt = stillSince

    if (restObserved && settledAt != null && at - settledAt >= stillnessMs) {
      if (deviation >= HELD_THRESHOLD) {
        if (heldSince == null) heldSince = at
      } else {
        heldSince = null
      }
      if (deviation >= HOLD_THRESHOLD) burst.addLast(at)

      val pickedUp = burst.size >= HOLD_BURST_SAMPLES
      val held = heldSince?.let { at - it >= HELD_DURATION_MS } ?: false
      if (!pickedUp && !held) return

      if (WakeConfig.lastFiredDay(this) == WakeConfig.today()) return
      if (!isWithinWindow(minutesOfDay(), cfg.startTime, cfg.endTime)) return

      fireReminder(cfg)
      return
    }

    if (deviation < REST_EPSILON) {
      if (stillSince == null) stillSince = at
      burst.clear()
      return
    }

    if (deviation < MOTION_THRESHOLD) return

    burst.addLast(at)
    if (burst.size < WAKE_BURST_SAMPLES) return

    stillSince = null
    burst.clear()
  }

  // ── Delivering the reminder ────────────────────────────────────────────────

  private fun fireReminder(cfg: WakeConfig) {
    WakeConfig.markFiredToday(this)
    stopSampling()
    cancelTodaysBackstop(cfg)
    repeatsPosted = 0
    postReminder(cfg)
    if (cfg.repeat) scheduleNextRepeat(cfg)
    // Nothing more to sample today; come back at the next window start.
    scheduleWakeAt(nextBoundaryMillis(cfg.startTime))
  }

  /**
   * Drop the OS-scheduled backstop due today, now that the sensor has delivered
   * the reminder itself.
   *
   * Only today's — the coming days' copies must survive, or one detected
   * wake-up would silence the safety net for the rest of the week.
   *
   * Reached by reflection rather than a Gradle dependency on
   * expo-notifications: declaring one makes Gradle evaluate that autolinked
   * project out of order and configuration fails outright. Reflection also
   * means a binary without expo-notifications degrades instead of crashing.
   * The whole thing is guarded — the worst case is one redundant reminder at
   * the end of the window, which must never be allowed to take the service down.
   */
  private fun cancelTodaysBackstop(cfg: WakeConfig) {
    val endOfDay = Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY, 23)
      set(Calendar.MINUTE, 59)
      set(Calendar.SECOND, 59)
      set(Calendar.MILLISECOND, 999)
    }.timeInMillis

    val due = cfg.backstopIds.filterIndexed { index, _ ->
      val at = cfg.backstopTimes.getOrNull(index) ?: return@filterIndexed false
      at <= endOfDay
    }
    if (due.isEmpty()) return

    try {
      val cls = Class.forName("expo.modules.notifications.service.NotificationsService")
      val signature = arrayOf(
        Context::class.java,
        Collection::class.java,
        android.os.ResultReceiver::class.java
      )
      // @JvmStatic would put the method on the class itself; without it, it
      // lives on the synthetic Companion. Try both rather than assume.
      val staticMethod = runCatching { cls.getMethod("removeScheduledNotifications", *signature) }
        .getOrNull()
      if (staticMethod != null && java.lang.reflect.Modifier.isStatic(staticMethod.modifiers)) {
        staticMethod.invoke(null, this, due, null)
        return
      }
      val companion = cls.getDeclaredField("Companion").get(null)
      companion.javaClass
        .getMethod("removeScheduledNotifications", *signature)
        .invoke(companion, this, due, null)
    } catch (_: Throwable) {
      // Worst case the backstop also arrives at the end of the window.
    }
  }

  /**
   * Play the reminder tone directly, instead of leaving it to the channel.
   *
   * A notification channel's sound is fixed the moment it is created and is the
   * user's to change afterwards, so the app has no way to guarantee one makes a
   * sound: the channel may have been created before the tone existed in
   * `res/raw`, the user (or an OEM skin) may have muted it, or it may sit on a
   * stream whose volume is zero. All three deliver the notification silently and
   * are indistinguishable from the app side. Playing it here removes the channel
   * from the path entirely — which is the only way this is guaranteed audible.
   *
   * `postReminder` therefore posts silently, so the tone is never doubled.
   */
  private fun playTone(cfg: WakeConfig) {
    if (cfg.soundName.isEmpty()) return // the user chose the silent tone
    releasePlayer()

    val audio = getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    // The requested stream is honoured unless it is muted, in which case the
    // other one is tried: a reminder on a zero-volume stream is the exact
    // failure this whole method exists to prevent.
    val wantsAlarm = cfg.soundStream == "alarm"
    val preferred = if (wantsAlarm) AudioManager.STREAM_ALARM else AudioManager.STREAM_NOTIFICATION
    val fallback = if (wantsAlarm) AudioManager.STREAM_NOTIFICATION else AudioManager.STREAM_ALARM
    val stream = when {
      audio == null -> preferred
      audio.getStreamVolume(preferred) > 0 -> preferred
      audio.getStreamVolume(fallback) > 0 -> fallback
      else -> AudioManager.STREAM_ALARM
    }
    val usage =
      if (stream == AudioManager.STREAM_ALARM) AudioAttributes.USAGE_ALARM
      else AudioAttributes.USAGE_NOTIFICATION

    try {
      val uri = resolveToneUri(cfg.soundName) ?: return
      val attributes = AudioAttributes.Builder()
        .setUsage(usage)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
      player = MediaPlayer().apply {
        setAudioAttributes(attributes)
        setDataSource(this@WakeDetectionService, uri)
        isLooping = false
        setOnCompletionListener { releasePlayer() }
        setOnErrorListener { _, _, _ -> releasePlayer(); true }
        prepare()
        start()
      }
    } catch (_: Throwable) {
      // A codec or permission failure must never take the service down; the
      // vibration below still signals the reminder.
      releasePlayer()
    }

    vibrate()
  }

  /** The bundled tone if this binary has it, otherwise the OS default. A tone
   *  added by an OTA update is absent from `res/raw`, so this cannot assume. */
  private fun resolveToneUri(soundName: String): Uri? {
    if (soundName != "default") {
      val base = soundName.substringBeforeLast('.')
      val id = resources.getIdentifier(base, "raw", packageName)
      if (id != 0) return Uri.parse("android.resource://$packageName/raw/$base")
    }
    return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
      ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
  }

  private fun vibrate() {
    try {
      val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        (getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
      } else {
        @Suppress("DEPRECATION")
        getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
      } ?: return
      val pattern = longArrayOf(0, 400, 200, 400)
      vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
    } catch (_: Throwable) {
      // No vibrator, or permission withheld.
    }
  }

  private fun releasePlayer() {
    try {
      player?.release()
    } catch (_: Throwable) {
      // already released
    }
    player = null
  }

  private fun postReminder(cfg: WakeConfig) {
    val manager = getSystemService(NotificationManager::class.java) ?: return
    val dismissIntent = Intent(this, WakeDismissReceiver::class.java)
      .setAction(ACTION_DISMISS)
    val dismissPending = PendingIntent.getBroadcast(
      this, 1, dismissIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val builder = NotificationCompat.Builder(this, cfg.channelId)
      .setContentTitle(cfg.title)
      .setContentText(cfg.body)
      .setSmallIcon(applicationInfo.icon)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setAutoCancel(true)
      .setContentIntent(launchAppIntent())
      .addAction(0, cfg.dismissLabel, dismissPending)
      .setDeleteIntent(dismissPending)
      // playTone owns the sound; without this the channel would ring too.
      .setSilent(true)

    try {
      manager.notify(REMINDER_NOTIFICATION_ID, builder.build())
    } catch (_: Exception) {
      // Notification permission revoked between arming and firing.
    }

    // After the notification, so a revoked permission still leaves the reminder
    // audible — the tone does not depend on being allowed to post anything.
    playTone(cfg)
  }

  private fun scheduleNextRepeat(cfg: WakeConfig) {
    if (repeatsPosted >= cfg.repeatMax) return
    val delay = cfg.repeatIntervalMinutes.coerceAtLeast(1) * 60_000L
    handler.postDelayed({
      repeatsPosted++
      postReminder(cfg)
      scheduleNextRepeat(cfg)
    }, delay)
  }

  private fun cancelRepeats() {
    handler.removeCallbacksAndMessages(null)
    repeatsPosted = 0
    // "I'm awake" must silence a tone that is still playing, not just stop the
    // ones queued behind it.
    releasePlayer()
    try {
      getSystemService(NotificationManager::class.java)?.cancel(REMINDER_NOTIFICATION_ID)
    } catch (_: Exception) {
      // tray unavailable
    }
  }

  // ── Waking the service back up ─────────────────────────────────────────────

  private fun alarmPendingIntent(): PendingIntent {
    val intent = Intent(this, WakeDetectionService::class.java).setAction(ACTION_SYNC)
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      PendingIntent.getForegroundService(
        this, 2, intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    } else {
      PendingIntent.getService(
        this, 2, intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    }
  }

  /** Inexact-but-doze-proof: a few minutes of slack costs nothing here, and
   *  `setExact` would need SCHEDULE_EXACT_ALARM, which Play restricts. */
  private fun scheduleWakeAt(triggerAtMillis: Long) {
    val alarm = getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, alarmPendingIntent())
      } else {
        alarm.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, alarmPendingIntent())
      }
    } catch (_: Exception) {
      // Alarm quota exhausted — sampling still resumes next time the app opens.
    }
  }

  private fun cancelScheduledWake() {
    val alarm = getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
    try {
      alarm.cancel(alarmPendingIntent())
    } catch (_: Exception) {
      // nothing scheduled
    }
  }

  private fun minutesOfDay(): Int {
    val c = Calendar.getInstance()
    return c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE)
  }

  /** The next occurrence of "HH:MM", today if still ahead, otherwise tomorrow. */
  private fun nextBoundaryMillis(hhmm: String): Long {
    val minutes = parseHHMM(hhmm) ?: 0
    val c = Calendar.getInstance()
    c.set(Calendar.HOUR_OF_DAY, minutes / 60)
    c.set(Calendar.MINUTE, minutes % 60)
    c.set(Calendar.SECOND, 0)
    c.set(Calendar.MILLISECOND, 0)
    if (c.timeInMillis <= System.currentTimeMillis()) c.add(Calendar.DAY_OF_YEAR, 1)
    return c.timeInMillis
  }
}
