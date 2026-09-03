import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';
import type { Recording } from '@/types/recording';

/** Bounds the history so shuffling/filtering in useGeneralRuqyah stays cheap and storage stays small. */
const MAX_HISTORY_ENTRIES = 200;

export interface RecordingHistoryEntry {
  recording: Recording;
  lastPlayedAt: number;
}

interface RecordingHistoryState {
  entries: Record<number, RecordingHistoryEntry>;
}

const initialState: RecordingHistoryState = { entries: {} };

const recordingHistorySlice = createSlice({
  name: 'recordingHistory',
  initialState,
  reducers: {
    recordPlay(state, action: PayloadAction<Recording>) {
      const recording = action.payload;
      state.entries[recording.id] = { recording, lastPlayedAt: Date.now() };

      const ids = Object.keys(state.entries);
      if (ids.length > MAX_HISTORY_ENTRIES) {
        const oldest = ids
          .map((id) => state.entries[Number(id)])
          .sort((a, b) => a.lastPlayedAt - b.lastPlayedAt)
          .slice(0, ids.length - MAX_HISTORY_ENTRIES);
        for (const entry of oldest) delete state.entries[entry.recording.id];
      }
    },
    clearHistory(state) {
      state.entries = {};
    },
  },
});

export const { recordPlay, clearHistory } = recordingHistorySlice.actions;
export default recordingHistorySlice.reducer;

/** Most-recently-played first. */
export const selectRecordingHistory = createSelector(
  [(s: RootState) => s.recordingHistory.entries],
  (entries): Recording[] =>
    Object.values(entries)
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
      .map((e) => e.recording),
);

export const selectHasRecordingHistory = (s: RootState): boolean =>
  Object.keys(s.recordingHistory.entries).length > 0;
