import { useCallback, useState } from 'react';
import { wakeDetectionService } from '@modules/wake-detection';

interface WakeBackground {
  /** Android only — iOS grants no equivalent foreground service. */
  backgroundSupported: boolean;
  batteryExempt: boolean;
  onBackgroundToggle: (value: boolean) => void;
  onFixBattery: () => void;
}

export function useWakeBackground(
  updateWakeBackground: (value: boolean) => Promise<unknown>,
  requestBatteryExemption: () => void,
): WakeBackground {
  const backgroundSupported = wakeDetectionService.isSupported();
  const [batteryExempt, setBatteryExempt] = useState(() =>
    wakeDetectionService.isBatteryOptimizationIgnored(),
  );

  // Re-read on every toggle: the user grants the exemption in Android's own
  // settings, so the app only learns about it on the way back.
  const refreshBatteryExempt = useCallback(() => {
    setBatteryExempt(wakeDetectionService.isBatteryOptimizationIgnored());
  }, []);

  const onBackgroundToggle = useCallback(
    (value: boolean) => {
      void updateWakeBackground(value).then(refreshBatteryExempt);
    },
    [updateWakeBackground, refreshBatteryExempt],
  );

  const onFixBattery = useCallback(() => {
    requestBatteryExemption();
  }, [requestBatteryExemption]);

  return { backgroundSupported, batteryExempt, onBackgroundToggle, onFixBattery };
}
