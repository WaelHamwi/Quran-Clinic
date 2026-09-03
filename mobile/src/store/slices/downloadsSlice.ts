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
  // Persisted resume metadata — everything needed to restart/continue this download on the
  // next app launch without the original `Recording` object in hand.
  downloadUrl: string;
  diseaseId: number;
  /** The wird's own name, as shown on the screen it was downloaded from. */
  title: string;
  /** Which of the wird's two ruqyahs this is (مختصرة / مطوّلة) — the title
   *  alone can't tell them apart, since both belong to the same wird. */
  subtitle: string | null;
  sessionNumber: number;
  localPath: string;
  // Platform resume token captured from `DownloadResumable.savable()`. Populated only when
  // the OS hands one back (mainly iOS); when absent, an interrupted task is restarted fresh.
  resumeData: string | null;
}

export interface CompletedDownload {
  recordingId: number;
  diseaseId: number;
  title: string;
  /** Absent on entries saved before wird names were recorded. */
  subtitle?: string | null;
  sessionNumber: number;
  localPath: string;
  size: number;
  downloadedAt: number;
}

export type OtherDownloadType = 'mushaf' | 'qcf4';

export interface OtherDownload {
  id: string;
  type: OtherDownloadType;
  title: string;
  subtitle?: string;
  size: number;
  downloadedAt: number;
}

interface DownloadsState {
  tasks: Record<number, DownloadTask>;
  completed: Record<number, CompletedDownload>;
  otherDownloads: Record<string, OtherDownload>;
  storageUsed: number;
  wifiOnly: boolean;
}

const initialState: DownloadsState = {
  tasks: {},
  completed: {},
  otherDownloads: {},
  storageUsed: 0,
  wifiOnly: true,
};

/** Offline downloads. Only `completed` + `wifiOnly` are persisted (see store transforms). */
const downloadsSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    startTask(
      state,
      action: PayloadAction<{
        recordingId: number;
        downloadUrl: string;
        diseaseId: number;
        title: string;
        subtitle: string | null;
        sessionNumber: number;
        localPath: string;
      }>,
    ) {
      const { recordingId } = action.payload;
      state.tasks[recordingId] = {
        ...action.payload,
        status: 'downloading',
        progress: 0,
        totalBytes: 0,
        error: null,
        resumeData: null,
      };
    },
    saveResumeData(
      state,
      action: PayloadAction<{ recordingId: number; resumeData: string }>,
    ) {
      const task = state.tasks[action.payload.recordingId];
      if (task) task.resumeData = action.payload.resumeData;
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
      state.otherDownloads = {};
      state.storageUsed = 0;
    },
    addOtherDownload(state, action: PayloadAction<OtherDownload>) {
      const { id } = action.payload;
      state.otherDownloads[id] = action.payload;
      state.storageUsed += action.payload.size;
    },
    removeOtherDownload(state, action: PayloadAction<string>) {
      const entry = state.otherDownloads[action.payload];
      if (entry) {
        state.storageUsed = Math.max(0, state.storageUsed - entry.size);
        delete state.otherDownloads[action.payload];
      }
    },
    // Keeps an aggregate entry (e.g. the QCF4 font pack, which grows page by
    // page as the user reads) sized to what's actually on disk, adjusting
    // storageUsed by the delta so the storage bar stays accurate.
    setOtherDownloadSize(state, action: PayloadAction<{ id: string; size: number }>) {
      const entry = state.otherDownloads[action.payload.id];
      if (entry) {
        state.storageUsed = Math.max(0, state.storageUsed - entry.size + action.payload.size);
        entry.size = action.payload.size;
      }
    },
  },
});

export const {
  startTask,
  saveResumeData,
  updateProgress,
  completeTask,
  failTask,
  cancelTask,
  removeDownload,
  setWifiOnly,
  setStorageUsed,
  clearAll,
  addOtherDownload,
  removeOtherDownload,
  setOtherDownloadSize,
} = downloadsSlice.actions;
export default downloadsSlice.reducer;

export const selectCompletedDownloads = (s: RootState): Record<number, CompletedDownload> =>
  s.downloads.completed;
export const selectOtherDownloads = (s: RootState): Record<string, OtherDownload> =>
  s.downloads.otherDownloads;
/** Tasks interrupted mid-flight (pending/downloading) that should auto-resume on launch. */
export const selectResumableTasks = (s: RootState): DownloadTask[] =>
  Object.values(s.downloads.tasks).filter(
    (t) => t.status === 'downloading' || t.status === 'pending',
  );
export const selectDownloadTask = (s: RootState, recordingId: number): DownloadTask | undefined =>
  s.downloads.tasks[recordingId];
export const selectIsDownloaded = (s: RootState, recordingId: number): boolean =>
  recordingId in s.downloads.completed;
export const selectStorageUsed = (s: RootState): number => s.downloads.storageUsed;
export const selectWifiOnly = (s: RootState): boolean => s.downloads.wifiOnly;
