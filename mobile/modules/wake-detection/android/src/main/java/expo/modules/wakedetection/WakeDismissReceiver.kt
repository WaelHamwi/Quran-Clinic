package expo.modules.wakedetection

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * "I'm awake", or the notification being swiped away — either way the user has
 * answered, so the queued repeats must stop without opening the app.
 */
class WakeDismissReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != WakeDetectionService.ACTION_DISMISS) return
    try {
      context.startService(
        Intent(context, WakeDetectionService::class.java)
          .setAction(WakeDetectionService.ACTION_DISMISS)
      )
    } catch (_: Exception) {
      // Service already gone; nothing left to silence.
    }
  }
}
