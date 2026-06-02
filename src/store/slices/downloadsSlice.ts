import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

export type DownloadStatus =
  | 'pending'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface DownloadTask {
  recordingId: number;
  status: DownloadStatus;
  progress: number;
  totalBytes: number;
  error: string | null;
}

export interface CompletedDownload {
  recordingId: number;
  diseaseId: number;
  title: string;
  sessionNumber: number;
  localPath: string;
  size: number;
  downloadedAt: number;
}

interface DownloadsState {
  tasks: Record<number, DownloadTask>;
  completed: Record<number, CompletedDownload>;
  storageUsed: number;
  wifiOnly: boolean;
}

const initialState: DownloadsState = {
  tasks: {},
  completed: {},
  storageUsed: 0,
  wifiOnly: true,
};

/** Offline downloads. Only `completed` + `wifiOnly` are persisted (see store transforms). */
const downloadsSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    startTask(state, action: PayloadAction<number>) {
      state.tasks[action.payload] = {
        recordingId: action.payload,
        status: 'downloading',
        progress: 0,
        totalBytes: 0,
        error: null,
      };
    },
    updateProgress(
      state,
      action: PayloadAction<{ recordingId: number; progress: number; totalBytes: number }>,
    ) {
      const task = state.tasks[action.payload.recordingId];
      if (task) {
        task.progress = action.payload.progress;
        task.totalBytes = action.payload.totalBytes;
        task.status = 'downloading';
      }
    },
    completeTask(state, action: PayloadAction<CompletedDownload>) {
      const { recordingId } = action.payload;
      delete state.tasks[recordingId];
      state.completed[recordingId] = action.payload;
      state.storageUsed += action.payload.size;
    },
    failTask(state, action: PayloadAction<{ recordingId: number; error: string }>) {
      const task = state.tasks[action.payload.recordingId];
      if (task) {
        task.status = 'failed';
        task.error = action.payload.error;
      }
    },
    cancelTask(state, action: PayloadAction<number>) {
      delete state.tasks[action.payload];
    },
    removeDownload(state, action: PayloadAction<number>) {
      const entry = state.completed[action.payload];
      if (entry) {
        state.storageUsed = Math.max(0, state.storageUsed - entry.size);
        delete state.completed[action.payload];
      }
    },
    setWifiOnly(state, action: PayloadAction<boolean>) {
      state.wifiOnly = action.payload;
    },
    setStorageUsed(state, action: PayloadAction<number>) {
      state.storageUsed = action.payload;
    },
    clearAll(state) {
      state.tasks = {};
      state.completed = {};
      state.storageUsed = 0;
    },
  },
});

export const {
  startTask,
  updateProgress,
  completeTask,
  failTask,
  cancelTask,
  removeDownload,
  setWifiOnly,
  setStorageUsed,
  clearAll,
} = downloadsSlice.actions;
export default downloadsSlice.reducer;

export const selectCompletedDownloads = (s: RootState): Record<number, CompletedDownload> =>
  s.downloads.completed;
export const selectDownloadTask = (s: RootState, recordingId: number): DownloadTask | undefined =>
  s.downloads.tasks[recordingId];
export const selectIsDownloaded = (s: RootState, recordingId: number): boolean =>
  recordingId in s.downloads.completed;
export const selectStorageUsed = (s: RootState): number => s.downloads.storageUsed;
export const selectWifiOnly = (s: RootState): boolean => s.downloads.wifiOnly;
