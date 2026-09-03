import { useCallback, useEffect, useState } from 'react';
import { ringtonePreview } from '@/services/notifications/ringtonePreview';
import type { RingtoneId } from '@/services/notifications/ringtones';

interface RingtonePreviewControl {
  playingId: RingtoneId | null;
  onPreview: (id: RingtoneId) => void;
  stopPreview: () => void;
}

export function useRingtonePreviewControl(
  previewRingtone: (id: RingtoneId) => boolean,
): RingtonePreviewControl {
  const [playingId, setPlayingId] = useState<RingtoneId | null>(null);

  // A preview must never outlive the screen.
  useEffect(() => () => ringtonePreview.stop(), []);

  // Tapping the tone that is already previewing stops it, so the row acts as a
  // play/stop toggle rather than restarting the same clip.
  const onPreview = useCallback(
    (id: RingtoneId) => {
      if (playingId === id) {
        ringtonePreview.stop();
        setPlayingId(null);
        return;
      }
      setPlayingId(previewRingtone(id) ? id : null);
    },
    [playingId, previewRingtone],
  );

  const stopPreview = useCallback(() => setPlayingId(null), []);

  return { playingId, onPreview, stopPreview };
}
