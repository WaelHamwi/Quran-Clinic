import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setRecording } from '@/store/slices/playerSlice';
import { enqueue } from '@/store/slices/offlineQueueSlice';
import { selectNetworkOnline } from '@/store/slices/uiSlice';
import { ruqyahService } from '@/services/content/ruqyahService';
import type { RootState } from '@/store/rootReducer';

/**
 * Reports a ruqyah "play" to the CMS so the per-recording `plays_count` counter
 * grows each time a user actually listens.
 *
 * `player/setRecording` is the single signal fired by every playback entry point
 * — a single tap (`usePlayer.loadAndPlay`), the favorites queue, the general
 * ruqyah queue plus its next/previous controls, and PlayerContext auto-advance —
 * and it fires only when a NEW track loads (not on resume/pause/seek). Listening
 * here counts each play exactly once without scattering the trigger across call
 * sites or risking a missed path.
 *
 * Online: fire-and-forget POST. Offline (or on failure): queue the increment for
 * replay on reconnect — mirroring the favorites/feedback offline-sync pattern.
 */
export const playCountListener = createListenerMiddleware();

playCountListener.startListening({
  actionCreator: setRecording,
  effect: (action, listenerApi) => {
    const recordingId = action.payload.recording?.id;
    if (!recordingId) return;

    const online = selectNetworkOnline(listenerApi.getState() as RootState);
    if (online) {
      ruqyahService.incrementPlayCount(recordingId).catch(() => {
        listenerApi.dispatch(enqueue({ type: 'playCount', payload: { recordingId } }));
      });
    } else {
      listenerApi.dispatch(enqueue({ type: 'playCount', payload: { recordingId } }));
    }
  },
});
