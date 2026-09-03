import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setRecording } from '@/store/slices/playerSlice';
import { recordPlay } from '@/store/slices/recordingHistorySlice';

/**
 * Mirrors playCountListener's trigger (player/setRecording fires once per genuine
 * new-track load, from every playback entry point) but purely local — no network
 * call, so no offline-queue branching is needed.
 */
export const recordingHistoryListener = createListenerMiddleware();

recordingHistoryListener.startListening({
  actionCreator: setRecording,
  effect: (action, listenerApi) => {
    if (action.payload.recording) {
      listenerApi.dispatch(recordPlay(action.payload.recording));
    }
  },
});
