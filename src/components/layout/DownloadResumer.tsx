import { useEffect } from 'react';
import { useDownloadManager } from '@/hooks/useDownloadManager';

// Module-level guard: resume runs once per app session even if this mounts more than once.
let resumeStarted = false;

/**
 * Headless launch hook: once the persisted store has rehydrated, continue any per-recording
 * download that a previous app session left unfinished. Renders nothing.
 */
export function DownloadResumer() {
  const { resumeIncomplete } = useDownloadManager();

  useEffect(() => {
    if (resumeStarted) return;
    resumeStarted = true;
    void resumeIncomplete();
  }, [resumeIncomplete]);

  return null;
}
