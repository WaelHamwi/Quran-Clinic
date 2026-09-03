import { useCallback, useEffect, useState } from 'react';
import {
  notificationScheduler,
  type ChannelState,
} from '@/services/notifications/notificationScheduler';

interface ChannelStatus {
  permissionGranted: boolean;
  onFixPermission: () => void;
  /** The reminder would arrive without a sound despite a tone being chosen. */
  channelSilent: boolean;
  refreshChannel: () => void;
}

export function useNotificationChannelStatus(
  readChannelState: () => Promise<ChannelState>,
  wakeRingtone: string,
): ChannelStatus {
  // Assume granted until proven otherwise, so the warning never flashes on open.
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [channel, setChannel] = useState<ChannelState | null>(null);

  useEffect(() => {
    void notificationScheduler.hasPermission().then(setPermissionGranted);
  }, []);

  const refreshChannel = useCallback(() => {
    void readChannelState().then(setChannel);
  }, [readChannelState]);

  useEffect(() => refreshChannel(), [refreshChannel]);

  const onFixPermission = useCallback(() => {
    void notificationScheduler.requestPermission().then(setPermissionGranted);
  }, []);

  // A channel Android never created, or one the user muted in its own settings,
  // still delivers the reminder to the tray — silently. Neither is visible from
  // the app side, so the live channel is the only honest signal.
  const channelSilent =
    channel != null && wakeRingtone !== 'silent' && (!channel.exists || channel.sound == null);

  return { permissionGranted, onFixPermission, channelSilent, refreshChannel };
}
