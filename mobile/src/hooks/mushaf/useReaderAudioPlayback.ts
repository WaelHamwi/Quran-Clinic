import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { showToast } from '@/store/slices/uiSlice';
import { addOtherDownload } from '@/store/slices/downloadsSlice';
import { audioService } from '@/services/player/audioService';
import { resolveRecitationUri } from '@/services/mushaf/mushafQueue';
import { useLanguage } from '@/context/LanguageContext';
import type { useMushafAudio } from '@/context/MushafAudioContext';
import type { useReaderRecitations } from '@/hooks/mushaf/useReaderRecitations';
import type { Translatable } from '@/types/translatable';

type MushafAudio = ReturnType<typeof useMushafAudio>;
type Recitations = ReturnType<typeof useReaderRecitations>;

type Params = {
  surahId: number;
  selectedReciterId: number | null;
  /** Undefined while the surah/page data driving playback hasn't loaded yet. */
  surahName: Translatable | undefined;
  audio: MushafAudio;
  recitations: Recitations;
  /** The timing-aligned Quran.com file URL, when the reciter has exact
   *  timestamps (from `resolveVerseHighlightState`) — preferred over the
   *  legacy backend recording so verse highlighting is exact. */
  timedUrl: string | null;
};

/**
 * Play/pause, offline download and load-retry glue shared by
 * every reader screen hosted under the root `useMushafAudio` engine — it
 * plays whatever surah recitation is "current" for that screen (the classic
 * reader's open surah, or the Madani reader's currently visible page's
 * surah). Also keeps the lock-screen "now playing" info in sync.
 */
export function useReaderAudioPlayback({
  surahId,
  selectedReciterId,
  surahName,
  audio,
  recitations,
  timedUrl,
}: Params) {
  const dispatch = useAppDispatch();
  const { language, t } = useLanguage();
  const { currentRecitation, unavailableReciterIds } = recitations;

  const { setNowPlaying } = audio;
  useEffect(() => {
    if (!surahName) return;
    const reciterName = currentRecitation?.reciter?.name;
    setNowPlaying({
      title: surahName[language] || surahName.ar,
      artist: (reciterName && (reciterName[language] || reciterName.ar)) || t.more.appName,
      albumTitle: t.more.appName,
    });
  }, [surahName, currentRecitation, language, t, setNowPlaying]);

  const handlePlay = useCallback(async () => {
    if (!currentRecitation || !selectedReciterId) return;
    // No playable audio for this reciter+surah — guide the user to pick another
    // instead of retrying a URL that will only fail again.
    if (audio.hasError || unavailableReciterIds.has(selectedReciterId)) {
      recitations.setShowReciterPicker(true);
      return;
    }
    if (audio.isPlaying) {
      await audio.pause();
      return;
    }
    // Only load if no source has been set — prevents restarting from 0 on every resume
    if (!audio.hasSource) {
      // Prefer the timing-aligned Quran.com file so verse highlighting is exact.
      // A fast play-tap can land before the timing fetch settles — wait for it
      // (bounded) instead of locking the session onto the legacy file, whose
      // highlight is only a drifting text-proportion estimate.
      const resolvedTimedUrl = timedUrl ?? (await recitations.resolveTimedAudioUrl());
      const timed = resolvedTimedUrl != null;
      const cached = await audioService.isAudioCached(surahId, selectedReciterId, timed);
      const uri = cached
        ? audioService.getLocalPath(surahId, selectedReciterId, timed)
        : resolvedTimedUrl ?? resolveRecitationUri(currentRecitation);
      await audio.loadAudio(uri);
    }
    if (surahName) audio.setPlayingSurah({ id: surahId, name: surahName });
    await audio.play();
  }, [currentRecitation, selectedReciterId, surahId, surahName, audio, unavailableReciterIds, recitations, timedUrl]);

  const handleDownload = useCallback(async () => {
    if (!currentRecitation || !selectedReciterId) return;
    recitations.setIsDownloading(true);
    try {
      const uri = await audioService.downloadAudio(
        timedUrl ?? resolveRecitationUri(currentRecitation),
        surahId,
        selectedReciterId,
        recitations.setDownloadProgress,
        timedUrl != null
      );
      recitations.setIsCached(true);

      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists && !info.isDirectory && surahName) {
        dispatch(
          addOtherDownload({
            id: `mushaf_${surahId}_${selectedReciterId}`,
            type: 'mushaf',
            title: surahName[language] || surahName.ar,
            subtitle: currentRecitation?.reciter?.name?.[language] || currentRecitation?.reciter?.name?.ar,
            size: info.size,
            downloadedAt: Date.now(),
          })
        );
      }

      dispatch(showToast({
        message: t.reader.downloadSuccess,
        type: 'success',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      dispatch(showToast({
        message: `${t.reader.downloadFailed}: ${message}`,
        type: 'error',
      }));
    } finally {
      recitations.setIsDownloading(false);
      recitations.setDownloadProgress(0);
    }
  }, [currentRecitation, selectedReciterId, surahId, surahName, recitations, timedUrl, dispatch, t, language]);

  // Retry audio load after a timeout (slow network). Clears the timeout flag
  // and attempts to load again.
  const handleRetryAudio = useCallback(async () => {
    if (!currentRecitation || !selectedReciterId) return;
    const resolvedTimedUrl = timedUrl ?? (await recitations.resolveTimedAudioUrl());
    const timed = resolvedTimedUrl != null;
    const cached = await audioService.isAudioCached(surahId, selectedReciterId, timed);
    const uri = cached
      ? audioService.getLocalPath(surahId, selectedReciterId, timed)
      : resolvedTimedUrl ?? resolveRecitationUri(currentRecitation);
    await audio.loadAudio(uri);
  }, [currentRecitation, selectedReciterId, surahId, audio, recitations, timedUrl]);

  return { handlePlay, handleDownload, handleRetryAudio };
}
