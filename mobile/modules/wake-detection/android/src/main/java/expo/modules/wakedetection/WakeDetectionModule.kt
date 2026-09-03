package expo.modules.wakedetection

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.Build
import android.provider.Settings
import android.net.Uri
import android.content.Intent
import android.os.PowerManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class WakeDetectionOptions : Record {
  @Field var startTime: String = "04:30"
  @Field var endTime: String = "07:30"
  @Field var stillnessMinutes: Int = 5
  @Field var sampleIntervalMs: Int = 200
  @Field var channelId: String = ""
  @Field var soundName: String = "default"
  @Field var soundStream: String = "notification"
  @Field var title: String = ""
  @Field var body: String = ""
  @Field var dismissLabel: String = ""
  @Field var repeat: Boolean = false
  @Field var repeatIntervalMinutes: Int = 5
  @Field var repeatMax: Int = 12
  @Field var serviceTitle: String = ""
  @Field var serviceBody: String = ""
  @Field var backstopIds: List<String> = emptyList()
  // Doubles because JS numbers cross the bridge as such; epoch millis exceed
  // Int range, so they must not be narrowed on the way in.
  @Field var backstopTimes: List<Double> = emptyList()
}

class WakeDetectionModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("No react context")

  override fun definition() = ModuleDefinition {
    Name("WakeDetection")

    Function("isSupported") {
      val manager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
      manager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null
    }

    Function("start") { options: WakeDetectionOptions ->
      WakeConfig(
        enabled = true,
        startTime = options.startTime,
        endTime = options.endTime,
        stillnessMinutes = options.stillnessMinutes,
        sampleIntervalMs = options.sampleIntervalMs,
        channelId = options.channelId,
        soundName = options.soundName,
        soundStream = options.soundStream,
        title = options.title,
        body = options.body,
        dismissLabel = options.dismissLabel,
        repeat = options.repeat,
        repeatIntervalMinutes = options.repeatIntervalMinutes,
        repeatMax = options.repeatMax,
        serviceTitle = options.serviceTitle,
        serviceBody = options.serviceBody,
        backstopIds = options.backstopIds,
        backstopTimes = options.backstopTimes.map { it.toLong() }
      ).save(context)
      WakeDetectionService.start(context)
      true
    }

    Function("stop") {
      // Persisted first: the boot receiver reads this, and must not resurrect a
      // service the user has just switched off.
      WakeConfig.setEnabled(context, false)
      WakeDetectionService.stop(context)
      true
    }

    /** True when the OS will let the service run indefinitely. When false the
     *  reminder still arrives via the scheduled backstop, just not on motion. */
    Function("isBatteryOptimizationIgnored") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return@Function true
      val power = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
      power?.isIgnoringBatteryOptimizations(context.packageName) ?: false
    }

    /** Opens the OS screen where the user can exempt the app. Android forbids
     *  granting this silently. */
    Function("requestIgnoreBatteryOptimization") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return@Function false
      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        .setData(Uri.parse("package:${context.packageName}"))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      try {
        context.startActivity(intent)
        true
      } catch (_: Exception) {
        // Some OEM builds hide the screen entirely.
        false
      }
    }
  }
}
