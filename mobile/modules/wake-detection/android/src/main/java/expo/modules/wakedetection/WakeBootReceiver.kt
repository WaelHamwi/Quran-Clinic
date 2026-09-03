package expo.modules.wakedetection

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Brings detection back after a reboot or an app update.
 *
 * Without this the service would stay dead until the user next opened the app —
 * which is precisely the situation background detection exists to cover.
 */
class WakeBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action ?: return
    if (action != Intent.ACTION_BOOT_COMPLETED && action != Intent.ACTION_MY_PACKAGE_REPLACED) {
      return
    }
    val config = WakeConfig.load(context) ?: return
    if (!config.enabled) return
    try {
      WakeDetectionService.start(context)
    } catch (_: Exception) {
      // Background-start restrictions on some OEM builds; the JS side restarts
      // it the next time the app is opened.
    }
  }
}
