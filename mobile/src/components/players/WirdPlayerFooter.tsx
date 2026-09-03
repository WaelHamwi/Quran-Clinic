import React from 'react';
import { AudioPlayer } from '@/components/players/AudioPlayer';
import type { AccessibleRecording } from '@/types/recording';

type NavControls = {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
};

type Props = {
  /** Whether the engine has a loaded recording at all. */
  hasCurrent: boolean;
  /** A queue (general ruqyah / favorites) currently owns the engine. */
  isGeneralMode: boolean;
  /** The live engine track was started from this screen. */
  isOwnPlayer: boolean;
  viewedLocked: boolean;
  /** Prev/next wiring for this screen's own playback. */
  local: NavControls;
  /** This screen's currently-shown wird (for the ready/preview player). */
  displayed?: AccessibleRecording;
  /** The disease / node id this screen scopes downloads to. */
  contextId: number;
  /** This wird's name — what a download of it is filed under. */
  title: string;
  /** Start playing this screen's shown wird (takes over the engine). */
  onPlayDisplayed: () => void;
};

/**
 * Bottom audio-player panel for THIS screen's wird.
 *  - Live player when the engine is playing a wird started here.
 *  - Ready/paused preview of this screen's wird while a queue owns the engine —
 *    tapping play takes over and starts it.
 * Queue (general ruqyah / favorites) playback is never shown here; it lives in
 * the global MiniPlayer. Figma node 18032:3119.
 */
export function WirdPlayerFooter({
  hasCurrent,
  isGeneralMode,
  isOwnPlayer,
  viewedLocked,
  local,
  displayed,
  contextId,
  title,
  onPlayDisplayed,
}: Props) {
  if (viewedLocked) return null;

  // The engine is playing this screen's own wird.
  if (hasCurrent && !isGeneralMode && isOwnPlayer) {
    return (
      <AudioPlayer
        onPrevious={local.onPrevious}
        onNext={local.onNext}
        hasPrevious={local.hasPrevious}
        hasNext={local.hasNext}
        wirdTitle={title}
      />
    );
  }

  // A queue owns the engine — show this screen's wird ready to play instead of
  // the queue track, so each screen stays independent.
  if (isGeneralMode && displayed) {
    return (
      <AudioPlayer
        previewRecording={displayed}
        previewDiseaseId={contextId}
        wirdTitle={title}
        onPreviewPlay={onPlayDisplayed}
        hasPrevious={false}
        hasNext={false}
      />
    );
  }

  return null;
}
