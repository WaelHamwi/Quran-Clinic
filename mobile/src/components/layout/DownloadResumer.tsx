import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useDownloadManager } from '@/hooks/common/useDownloadManager';
import { useAppSelector } from '@/store/hooks';
import { selectNetworkOnline } from '@/store/slices/uiSlice';

// Module-level guard: the initial launch-resume runs once per app session even if
// this mounts more than once.
let resumeStarted = false;

/**
 * Headless launch hook: continues any per-recording download a previous session
 * left unfinished. Beyond the initial launch, downloads don't run while the app
 * is fully backgrounded (RN pauses JS), so this also re-triggers `resumeIncomplete`
 * whenever the app returns to the foreground or connectivity comes back (FR-16.4)
 * — the realistic, native-module-free way to make a paused download continue
 * without the user having to force-quit and reopen the app.
 */
export function DownloadResumer() {
  const { resumeIncomplete } = useDownloadManager();
  const online = useAppSelector(selectNetworkOnline);

  useEffect(() => {
    if (resumeStarted) return;
    resumeStarted = true;
    void resumeIncomplete();
  }, [resumeIncomplete]);

  useEffect(() => {
    if (online) void resumeIncomplete();
  }, [online, resumeIncomplete]);

  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      if (status === 'active') void resumeIncomplete();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [resumeIncomplete]);

  return null;
}
