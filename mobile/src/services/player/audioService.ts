import * as FileSystem from 'expo-file-system/legacy';
import { buildAudioHeaders } from '@/lib/audioAuth';

// `timed = true` is the Quran.com chapter file that verse timings are aligned
// to; the plain path is the backend/legacy file (different recording, opens
// with a basmalah). Separate filenames so a pre-existing legacy download can
// never be mistaken for timing-aligned audio.
function getLocalPath(surahId: number, reciterId: number, timed = false): string {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  return `${base}audio/surah_${surahId}_reciter_${reciterId}${timed ? '_timed' : ''}.mp3`;
}

async function isAudioCached(surahId: number, reciterId: number, timed = false): Promise<boolean> {
  const path = getLocalPath(surahId, reciterId, timed);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists;
}

async function downloadAudio(
  downloadUrl: string,
  surahId: number,
  reciterId: number,
  onProgress?: (progress: number) => void,
  timed = false
): Promise<string> {
  const localPath = getLocalPath(surahId, reciterId, timed);

  const dir = localPath.substring(0, localPath.lastIndexOf('/'));
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const downloadResumable = FileSystem.createDownloadResumable(
    downloadUrl,
    localPath,
    {},
    (downloadProgress) => {
      if (onProgress && downloadProgress.totalBytesExpectedToWrite > 0) {
        const progress =
          downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress(progress);
      }
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result) {
    throw new Error('Download failed');
  }

  return result.uri;
}

async function deleteAudio(surahId: number, reciterId: number): Promise<void> {
  for (const path of [getLocalPath(surahId, reciterId), getLocalPath(surahId, reciterId, true)]) {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path);
    }
  }
}

// --- Ruqyah recordings (Hospital module) — additive, keyed by recordingId ---
// The Mushaf functions above are unchanged. New audio for ruqyah recordings is
// stored as `audio/recording_{id}.mp3`.

const activeRecordingDownloads = new Map<number, FileSystem.DownloadResumable>();

function getRecordingPath(recordingId: number): string {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  return `${base}audio/recording_${recordingId}.mp3`;
}

async function isRecordingCached(recordingId: number): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(getRecordingPath(recordingId));
  return info.exists;
}

async function ensureAudioDir(localPath: string): Promise<void> {
  const dir = localPath.substring(0, localPath.lastIndexOf('/'));
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

async function downloadRecording(
  downloadUrl: string,
  recordingId: number,
  onProgress?: (progress: number, totalBytes: number) => void,
  // A previously persisted resume token (`DownloadResumable.savable().resumeData`). When
  // present we continue the partial download instead of starting over.
  resumeData?: string | null,
  // Called whenever the OS hands back a fresh resume token, so the caller can persist it for
  // continuation after an app kill.
  onSnapshot?: (resumeData: string) => void,
): Promise<{ uri: string; size: number }> {
  const localPath = getRecordingPath(recordingId);
  await ensureAudioDir(localPath);

  // Gated recording audio requires the bearer token (attached only for our own backend).
  const headers = await buildAudioHeaders(downloadUrl);

  const resumable = FileSystem.createDownloadResumable(
    downloadUrl,
    localPath,
    { headers },
    (p) => {
      if (onProgress && p.totalBytesExpectedToWrite > 0) {
        onProgress(
          p.totalBytesWritten / p.totalBytesExpectedToWrite,
          p.totalBytesExpectedToWrite,
        );
      }
      if (onSnapshot) {
        const token = resumable.savable().resumeData;
        if (token) onSnapshot(token);
      }
    },
    resumeData ?? undefined,
  );
  activeRecordingDownloads.set(recordingId, resumable);

  try {
    // Resume the partial download when we hold a token; fall back to a fresh download if the
    // token is stale/rejected by the OS.
    let result: Awaited<ReturnType<typeof resumable.downloadAsync>>;
    if (resumeData) {
      try {
        result = await resumable.resumeAsync();
      } catch {
        result = await resumable.downloadAsync();
      }
    } else {
      result = await resumable.downloadAsync();
    }
    if (!result) throw new Error('Download cancelled');
    const info = await FileSystem.getInfoAsync(result.uri);
    return {
      uri: result.uri,
      size: info.exists && !info.isDirectory ? info.size : 0,
    };
  } finally {
    activeRecordingDownloads.delete(recordingId);
  }
}

async function cancelRecordingDownload(recordingId: number): Promise<void> {
  const resumable = activeRecordingDownloads.get(recordingId);
  if (resumable) {
    try {
      await resumable.cancelAsync();
    } catch {
      /* already finished */
    }
    activeRecordingDownloads.delete(recordingId);
  }
  await FileSystem.deleteAsync(getRecordingPath(recordingId), { idempotent: true });
}

async function deleteRecording(recordingId: number): Promise<void> {
  await FileSystem.deleteAsync(getRecordingPath(recordingId), { idempotent: true });
}

async function getRecordingsStorageUsage(): Promise<number> {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  const dir = `${base}audio`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) return 0;
  const files = await FileSystem.readDirectoryAsync(dir);
  let total = 0;
  for (const f of files) {
    if (!f.startsWith('recording_')) continue;
    const info = await FileSystem.getInfoAsync(`${dir}/${f}`);
    if (info.exists && !info.isDirectory) total += info.size;
  }
  return total;
}

async function getMushafStorageUsage(): Promise<number> {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  const dir = `${base}audio`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) return 0;
  const files = await FileSystem.readDirectoryAsync(dir);
  let total = 0;
  for (const f of files) {
    if (!f.startsWith('surah_')) continue;
    if (!f.endsWith('.mp3')) continue;
    const info = await FileSystem.getInfoAsync(`${dir}/${f}`);
    if (info.exists && !info.isDirectory) total += info.size;
  }
  return total;
}

async function getQcf4StorageUsage(): Promise<number> {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  const dir = `${base}qcf4/fonts`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) return 0;
  const files = await FileSystem.readDirectoryAsync(dir);
  let total = 0;
  for (const f of files) {
    const info = await FileSystem.getInfoAsync(`${dir}/${f}`);
    if (info.exists && !info.isDirectory) total += info.size;
  }
  return total;
}

async function getTotalStorageUsage(): Promise<number> {
  const [ruqyah, mushaf, qcf4] = await Promise.all([
    getRecordingsStorageUsage(),
    getMushafStorageUsage(),
    getQcf4StorageUsage(),
  ]);
  return ruqyah + mushaf + qcf4;
}

async function deleteMushafAudio(surahId: number, reciterId: number): Promise<void> {
  await deleteAudio(surahId, reciterId);
}

async function deleteQcf4FontPack(): Promise<void> {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  const dir = `${base}qcf4`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(dir, { idempotent: true });
  }
}

/** Device-wide storage figures (bytes) used by the Downloads screen. */
async function getDeviceStorage(): Promise<{ free: number; total: number }> {
  try {
    const [free, total] = await Promise.all([
      FileSystem.getFreeDiskStorageAsync(),
      FileSystem.getTotalDiskCapacityAsync(),
    ]);
    return { free, total };
  } catch {
    return { free: 0, total: 0 };
  }
}

async function clearAllRecordings(): Promise<void> {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  const dir = `${base}audio`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) return;
  const files = await FileSystem.readDirectoryAsync(dir);
  for (const f of files) {
    if (f.startsWith('recording_')) {
      await FileSystem.deleteAsync(`${dir}/${f}`, { idempotent: true });
    }
  }
}

export const audioService = {
  // Mushaf
  getLocalPath,
  isAudioCached,
  downloadAudio,
  deleteAudio,
  deleteMushafAudio,
  // Ruqyah recordings
  getRecordingPath,
  isRecordingCached,
  downloadRecording,
  cancelRecordingDownload,
  deleteRecording,
  getRecordingsStorageUsage,
  // Storage calculations
  getMushafStorageUsage,
  getQcf4StorageUsage,
  getTotalStorageUsage,
  getDeviceStorage,
  // Cleanup
  deleteQcf4FontPack,
  clearAllRecordings,
};
