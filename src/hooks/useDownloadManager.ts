import { useCallback, useMemo } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  startTask,
  updateProgress,
  completeTask,
  failTask,
  cancelTask,
  removeDownload,
  clearAll as clearAllAction,
  selectCompletedDownloads,
  selectStorageUsed,
  selectWifiOnly,
  type DownloadTask,
} from '@/store/slices/downloadsSlice';
import { showToast } from '@/store/slices/uiSlice';
import type { RootState } from '@/store/rootReducer';
import { audioService } from '@/services/audioService';
import type { Recording } from '@/types/recording';

const selectTasks = (s: RootState): Record<number, DownloadTask> => s.downloads.tasks;

/** Wraps `downloadsSlice` + `audioService` — the per-recording download manager. */
export function useDownloadManager() {
  const dispatch = useAppDispatch();
  const completed = useAppSelector(selectCompletedDownloads);
  const tasks = useAppSelector(selectTasks);
  const storageUsed = useAppSelector(selectStorageUsed);
  const wifiOnly = useAppSelector(selectWifiOnly);

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

      dispatch(startTask(recording.id));
      try {
        const { uri, size } = await audioService.downloadRecording(
          recording.audio_url,
          recording.id,
          (progress, totalBytes) =>
            dispatch(updateProgress({ recordingId: recording.id, progress, totalBytes })),
        );
        dispatch(
          completeTask({
            recordingId: recording.id,
            diseaseId,
            title: recording.title.ar || recording.title.en || `#${recording.id}`,
            sessionNumber: recording.session_number,
            localPath: uri,
            size,
            downloadedAt: Date.now(),
          }),
        );
      } catch (e) {
        dispatch(
          failTask({ recordingId: recording.id, error: (e as Error).message ?? 'failed' }),
        );
      }
    },
    [dispatch, completed, wifiOnly],
  );

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
      cancel,
      deleteDownload,
      clearAll,
      getTask,
      isDownloaded,
      getLocalUri,
    }),
    [
      completed,
      storageUsed,
      wifiOnly,
      download,
      cancel,
      deleteDownload,
      clearAll,
      getTask,
      isDownloaded,
      getLocalUri,
    ],
  );
}
