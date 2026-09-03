package expo.modules.wakedetection

import android.content.Context
import java.util.Calendar

/**
 * Everything the service needs to run without the app process being alive.
 *
 * It is persisted rather than passed only through the start intent because the
 * service is also started by the boot receiver and by its own re-arm alarm,
 * neither of which has any JS to ask.
 */
data class WakeConfig(
  val enabled: Boolean,
  val startTime: String,
  val endTime: String,
  val stillnessMinutes: Int,
  val sampleIntervalMs: Int,
  val channelId: String,
  /** Bundled tone filename ("tone_chime.wav"), "default" for the OS tone, or
   *  empty for silent. The service plays this itself rather than leaning on the
   *  channel — see `playTone`. */
  val soundName: String,
  /** "alarm" or "notification" — which stream `playTone` uses. */
  val soundStream: String,
  val title: String,
  val body: String,
  val dismissLabel: String,
  val repeat: Boolean,
  val repeatIntervalMinutes: Int,
  val repeatMax: Int,
  val serviceTitle: String,
  val serviceBody: String,
  /** Identifiers of the OS-scheduled backstops, paired with the moment each
   *  fires. Only the one due today is cancelled when the sensor wins the race. */
  val backstopIds: List<String>,
  val backstopTimes: List<Long>
) {
  fun save(context: Context) {
    prefs(context).edit()
      .putBoolean(KEY_ENABLED, enabled)
      .putString(KEY_START, startTime)
      .putString(KEY_END, endTime)
      .putInt(KEY_STILLNESS, stillnessMinutes)
      .putInt(KEY_SAMPLE, sampleIntervalMs)
      .putString(KEY_CHANNEL, channelId)
      .putString(KEY_SOUND, soundName)
      .putString(KEY_STREAM, soundStream)
      .putString(KEY_TITLE, title)
      .putString(KEY_BODY, body)
      .putString(KEY_DISMISS, dismissLabel)
      .putBoolean(KEY_REPEAT, repeat)
      .putInt(KEY_REPEAT_INTERVAL, repeatIntervalMinutes)
      .putInt(KEY_REPEAT_MAX, repeatMax)
      .putString(KEY_SERVICE_TITLE, serviceTitle)
      .putString(KEY_SERVICE_BODY, serviceBody)
      // Joined rather than a string set: order matters, because each id is
      // paired with the time at the same index.
      .putString(KEY_BACKSTOP_IDS, backstopIds.joinToString(LIST_SEPARATOR))
      .putString(KEY_BACKSTOP_TIMES, backstopTimes.joinToString(LIST_SEPARATOR))
      .apply()
  }

  companion object {
    private const val PREFS = "expo.modules.wakedetection.config"
    private const val KEY_ENABLED = "enabled"
    private const val KEY_START = "startTime"
    private const val KEY_END = "endTime"
    private const val KEY_STILLNESS = "stillnessMinutes"
    private const val KEY_SAMPLE = "sampleIntervalMs"
    private const val KEY_CHANNEL = "channelId"
    private const val KEY_SOUND = "soundName"
    private const val KEY_STREAM = "soundStream"
    private const val KEY_TITLE = "title"
    private const val KEY_BODY = "body"
    private const val KEY_DISMISS = "dismissLabel"
    private const val KEY_REPEAT = "repeat"
    private const val KEY_REPEAT_INTERVAL = "repeatIntervalMinutes"
    private const val KEY_REPEAT_MAX = "repeatMax"
    private const val KEY_SERVICE_TITLE = "serviceTitle"
    private const val KEY_SERVICE_BODY = "serviceBody"
    private const val KEY_LAST_FIRED_DAY = "lastFiredDay"
    private const val KEY_ARMED_DAY = "armedDay"
    private const val KEY_BACKSTOP_IDS = "backstopIds"
    private const val KEY_BACKSTOP_TIMES = "backstopTimes"
    // expo-notifications identifiers are UUIDs, so a comma can never appear
    // inside one and is safe as a separator.
    private const val LIST_SEPARATOR = ","

    private fun prefs(context: Context) =
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private fun splitList(value: String?): List<String> =
      if (value.isNullOrEmpty()) emptyList() else value.split(LIST_SEPARATOR)

    fun load(context: Context): WakeConfig? {
      val p = prefs(context)
      if (!p.contains(KEY_CHANNEL)) return null
      return WakeConfig(
        enabled = p.getBoolean(KEY_ENABLED, false),
        startTime = p.getString(KEY_START, "04:30") ?: "04:30",
        endTime = p.getString(KEY_END, "07:30") ?: "07:30",
        stillnessMinutes = p.getInt(KEY_STILLNESS, 5),
        sampleIntervalMs = p.getInt(KEY_SAMPLE, 200),
        channelId = p.getString(KEY_CHANNEL, "") ?: "",
        soundName = p.getString(KEY_SOUND, "default") ?: "default",
        soundStream = p.getString(KEY_STREAM, "notification") ?: "notification",
        title = p.getString(KEY_TITLE, "") ?: "",
        body = p.getString(KEY_BODY, "") ?: "",
        dismissLabel = p.getString(KEY_DISMISS, "OK") ?: "OK",
        repeat = p.getBoolean(KEY_REPEAT, false),
        repeatIntervalMinutes = p.getInt(KEY_REPEAT_INTERVAL, 5),
        repeatMax = p.getInt(KEY_REPEAT_MAX, 12),
        serviceTitle = p.getString(KEY_SERVICE_TITLE, "") ?: "",
        serviceBody = p.getString(KEY_SERVICE_BODY, "") ?: "",
        backstopIds = splitList(p.getString(KEY_BACKSTOP_IDS, "")),
        backstopTimes = splitList(p.getString(KEY_BACKSTOP_TIMES, "")).mapNotNull {
          it.toLongOrNull()
        }
      )
    }

    fun setEnabled(context: Context, value: Boolean) {
      prefs(context).edit().putBoolean(KEY_ENABLED, value).apply()
    }

    fun lastFiredDay(context: Context): String? =
      prefs(context).getString(KEY_LAST_FIRED_DAY, null)

    fun markFiredToday(context: Context) {
      prefs(context).edit().putString(KEY_LAST_FIRED_DAY, today()).apply()
    }

    /** The day sampling last began. Persisted rather than held in the service,
     *  which Android may destroy and recreate between the window opening and
     *  closing â€” the end-of-window backstop must survive that. */
    fun armedDay(context: Context): String? =
      prefs(context).getString(KEY_ARMED_DAY, null)

    fun markArmedToday(context: Context) {
      prefs(context).edit().putString(KEY_ARMED_DAY, today()).apply()
    }

    fun today(): String {
      val c = Calendar.getInstance()
      return "%04d-%02d-%02d".format(
        c.get(Calendar.YEAR),
        c.get(Calendar.MONTH) + 1,
        c.get(Calendar.DAY_OF_MONTH)
      )
    }
  }
}

/** Minutes since local midnight, or null when the value is not "HH:MM". */
fun parseHHMM(value: String): Int? {
  val parts = value.split(":")
  if (parts.size != 2) return null
  val hour = parts[0].toIntOrNull() ?: return null
  val minute = parts[1].toIntOrNull() ?: return null
  if (hour > 23 || minute > 59 || hour < 0 || minute < 0) return null
  return hour * 60 + minute
}

/**
 * Mirrors `isWithinWakingWindow` in `src/utils/wakingWindow.ts` â€” the window may
 * cross midnight, and a zero-length or malformed one matches nothing so a bad
 * preference can never make the reminder fire all day.
 */
fun isWithinWindow(nowMinutes: Int, start: String, end: String): Boolean {
  val from = parseHHMM(start) ?: return false
  val to = parseHHMM(end) ?: return false
  if (from == to) return false
  return if (from < to) nowMinutes in from..to else nowMinutes >= from || nowMinutes <= to
}
