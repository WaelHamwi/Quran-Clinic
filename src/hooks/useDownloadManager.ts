import { useCallback, useMemo } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  startTask,
  saveResumeData,
  updateProgress,
  completeTask,
  failTask,
  cancelTask,
  removeDownload,
  clearAll as clearAllAction,
  setStorageUsed,
  selectCompletedDownloads,
  selectResumableTasks,
  selectStorageUsed,
  selectWifiOnly,
  type DownloadTask,
} from '@/store/slices/downloadsSlice';
import { showToast } from '@/store/slices/uiSlice';
import { store } from '@/store/store';
import type { RootState } from '@/store/rootReducer';
import { audioService } from '@/services/audioService';
import type { Recording } from '@/types/recording';

const selectTasks = (s: RootState): Record<number, DownloadTask> => s.downloads.tasks;

interface RunParams {
  recordingId: number;
  audioUrl: string;
  diseaseId: number;
  title: string;
  sessionNumber: number;
  resumeData?: string | null;
}

/** Wraps `downloadsSlice` + `audioService` — the per-recording download manager. */
export function useDownloadManager() {
  const dispatch = useAppDispatch();
  const completed = useAppSelector(selectCompletedDownloads);
  const tasks = useAppSelector(selectTasks);
  const storageUsed = useAppSelector(selectStorageUsed);
  const wifiOnly = useAppSelector(selectWifiOnly);

  // Shared download runner used by both a fresh tap and the relaunch resume path. Persists
  // resume tokens as they arrive (`saveResumeData`) so an app kill can continue the file.
  const runDownload = useCallback(
    async (params: RunParams) => {
      const { recordingId, audioUrl, diseaseId, title, sessionNumber, resumeData } = params;
      try {
        const { uri, size } = await audioService.downloadRecording(
          audioUrl,
          recordingId,
          (progress, totalBytes) =>
            dispatch(updateProgress({ recordingId, progress, totalBytes })),
          resumeData,
          (token) => dispatch(saveResumeData({ recordingId, resumeData: token })),
        );
        dispatch(
          completeTask({
            recordingId,
            diseaseId,
            title,
            sessionNumber,
            localPath: uri,
            size,
            downloadedAt: Date.now(),
          }),
        );
      } catch (e) {
        dispatch(failTask({ recordingId, error: (e as Error).message ?? 'failed' }));
      }
    },
    [dispatch],
  );

  const download = useCallback(
    async (recording: Recording, diseaseId: number) => {
      if (!recording.audio_url || recording.id in completed) return;

      if (wifiOnly) {
        const net = await NetInfo.fetch();
        if (net.type !== 'wifi') {
          dispatch(showToast({ message: 'Wi-Fi required to download', type: 'info' }));
          return;
        }
      }

      const title = `#${recording.session_number}`;
      dispatch(
        startTask({
          recordingId: recording.id,
          downloadUrl: recording.audio_url,
          diseaseId,
          title,
          sessionNumber: recording.session_number,
          localPath: audioService.getRecordingPath(recording.id),
        }),
      );
      await runDownload({
        recordingId: recording.id,
        audioUrl: recording.audio_url,
        diseaseId,
        title,
        sessionNumber: recording.session_number,
      });
    },
    [dispatch, completed, wifiOnly, runDownload],
  );

  // Continue any download left unfinished by a previous app session. Reads the store
  // directly so it reflects the just-rehydrated tasks rather than a stale render closure.
  const resumeIncomplete = useCallback(async () => {
    const state = store.getState();
    const pending = selectResumableTasks(state);
    if (pending.length === 0) return;

    if (state.downloads.wifiOnly) {
      const net = await NetInfo.fetch();
      // Off Wi-Fi: leave tasks parked; they'll resume on the next launch while on Wi-Fi.
      if (net.type !== 'wifi') return;
    }

    for (const t of pending) {
      if (t.recordingId in state.downloads.completed) continue;
      void runDownload({
        recordingId: t.recordingId,
        audioUrl: t.downloadUrl,
        diseaseId: t.diseaseId,
        title: t.title,
        sessionNumber: t.sessionNumber,
        resumeData: t.resumeData,
      });
    }
  }, [runDownload]);

  const cancel = useCallback(
    async (recordingId: number) => {
      await audioService.cancelRecordingDownload(recordingId);
      dispatch(cancelTask(recordingId));
    },
    [dispatch],
  );

  const deleteDownload = useCallback(
    async (recordingId: number) => {
      await audioService.deleteRecording(recordingId);
      dispatch(removeDownload(recordingId));
    },
    [dispatch],
  );

  const clearAll = useCallback(async () => {
    await audioService.clearAllRecordings();
    dispatch(clearAllAction());
  }, [dispatch]);

  /** Reconcile the persisted `storageUsed` with what's actually on disk and
   *  report the device's free/total capacity. Used by the Downloads screen. */
  const refreshStorage = useCallback(async (): Promise<{ free: number; total: number }> => {
    const [used, device] = await Promise.all([
      audioService.getRecordingsStorageUsage(),
      audioService.getDeviceStorage(),
    ]);
    dispatch(setStorageUsed(used));
    return device;
  }, [dispatch]);

  const getTask = useCallback((recordingId: number) => tasks[recordingId], [tasks]);
  const isDownloaded = useCallback(
    (recordingId: number) => recordingId in completed,
    [completed],
  );
  const getLocalUri = useCallback(
    (recordingId: number) => completed[recordingId]?.localPath ?? null,
    [completed],
  );

  return useMemo(
    () => ({
      downloads: completed,
      storageUsed,
      wifiOnly,
      download,
      resumeIncomplete,
      cancel,
      deleteDownload,
      clearAll,
      refreshStorage,
      getTask,
      isDownloaded,
      getLocalUri,
    }),
    [
      completed,
      storageUsed,
      wifiOnly,
      download,
      resumeIncomplete,
      cancel,
      deleteDownload,
      clearAll,
      refreshStorage,
      getTask,
      isDownloaded,
      getLocalUri,
    ],
  );
}
