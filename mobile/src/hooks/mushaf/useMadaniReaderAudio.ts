import { useCallback, useEffect, useMemo, useState } from 'react';
import { audioService } from '@/services/player/audioService';
import { useMushafContext } from '@/context/MushafContext';
import { useMushafAudio } from '@/context/MushafAudioContext';
import { useSurah } from '@/hooks/mushaf/useSurah';
import { useReaderRecitations } from '@/hooks/mushaf/useReaderRecitations';
import { useReaderAudioPlayback } from '@/hooks/mushaf/useReaderAudioPlayback';
import {
  computeVerseStartFractions,
  resolveActiveVerseIndex,
  resolveVerseHighlightState,
  resolveVerseStartMs,
} from '@/utils/verseTiming';

/**
 * Audio playback for the Madani (QCF4) reader — mirrors the classic reader's
 * playback stack (`useReaderRecitations` + `useReaderAudioPlayback` +
 * `resolveVerseHighlightState`/`resolveActiveVerseIndex` from
 * `utils/verseTiming`), just keyed on whichever surah is currently on
 * screen instead of the route's surah id, since Madani pages through the
 * whole Mushaf rather than opening one surah at a time.
 */
export function useMadaniReaderAudio(currentSurahId: number) {
  const { selectedReciterId, setSelectedReciterId, isContextReady } = useMushafContext();
  const audio = useMushafAudio();
  const { data: surah } = useSurah(currentSurahId);

  const recitations = useReaderRecitations({
    surahId: currentSurahId,
    selectedReciterId,
    setSelectedReciterId,
    audio,
  });
  const { currentRecitation, unavailableReciterIds, verseTiming } = recitations;

  const timedLocalPath =
    selectedReciterId != null ? audioService.getLocalPath(currentSurahId, selectedReciterId, true) : null;
  const { timedUrl, timingUsable, fallbackBasmalahLeadMs, isBasmalahActive } = surah
    ? resolveVerseHighlightState({
        surahId: surah.id,
        verseTiming,
        timingAudioUrl: recitations.timingAudioUrl,
        audioSourceUri: audio.sourceUri,
        timedLocalPath,
        durationMillis: audio.durationMillis,
        positionMillis: audio.positionMillis,
        isPlaying: audio.isPlaying,
      })
    : { timedUrl: null, timingUsable: false, fallbackBasmalahLeadMs: 0, isBasmalahActive: false };

  const { handlePlay, handleDownload, handleRetryAudio } = useReaderAudioPlayback({
    surahId: currentSurahId,
    selectedReciterId,
    surahName: surah?.name,
    audio,
    recitations,
    timedUrl,
  });

  // ── Active-verse resolution (drives the word highlight + page-follow) ──────
  const verseStartFractions = useMemo(
    () => (surah ? computeVerseStartFractions(surah.verses) : []),
    [surah]
  );
  const [activeVerseIndex, setActiveVerseIndex] = useState(-1);
  /* eslint-disable react-hooks/set-state-in-effect -- intentional: derives the active verse from external audio position, same pattern as useReaderScroll's equivalent effect */
  useEffect(() => {
    if (!surah || audio.durationMillis === 0) { setActiveVerseIndex(-1); return; }
    const idx = resolveActiveVerseIndex({
      positionMs: audio.positionMillis,
      durationMillis: audio.durationMillis,
      verseTiming: timingUsable ? verseTiming : undefined,
      verseStartFractions,
      basmalahLeadMs: fallbackBasmalahLeadMs,
    });
    setActiveVerseIndex(idx);
  }, [surah, audio.positionMillis, audio.durationMillis, timingUsable, verseTiming, verseStartFractions, fallbackBasmalahLeadMs]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeVerseKey =
    surah && activeVerseIndex >= 0 && activeVerseIndex < surah.verses.length
      ? `${surah.id}:${surah.verses[activeVerseIndex].verse_number}`
      : null;

  // Snaps the highlight immediately on manual scrub — doesn't wait for
  // positionMillis to async-update, mirroring the classic reader's handleSeek.
  const handleSeek = useCallback(
    (ms: number) => {
      const clipped = Math.max(0, ms);
      audio.seekTo(clipped);
      const idx = resolveActiveVerseIndex({
        positionMs: clipped,
        durationMillis: audio.durationMillis,
        verseTiming: timingUsable ? verseTiming : undefined,
        verseStartFractions,
        basmalahLeadMs: fallbackBasmalahLeadMs,
      });
      if (idx >= 0) setActiveVerseIndex(idx);
    },
    [audio, timingUsable, verseTiming, verseStartFractions, fallbackBasmalahLeadMs]
  );

  // ── Entry point: start the recitation somewhere other than the track's top ──
  const [pendingStartVerse, setPendingStartVerse] = useState<number | null>(null);

  // durationMillis is the readiness signal: an unloaded source has no length,
  // so it can neither be sought nor place a verse by text proportion.
  const seekToVerse = useCallback(
    (verseNumber: number): boolean => {
      if (audio.durationMillis === 0) return false;
      const ms = resolveVerseStartMs({
        verseIndex: verseNumber - 1,
        durationMillis: audio.durationMillis,
        verseTiming: timingUsable ? verseTiming : undefined,
        verseStartFractions,
        basmalahLeadMs: fallbackBasmalahLeadMs,
      });
      if (ms == null) return false;
      handleSeek(ms);
      return true;
    },
    [audio.durationMillis, timingUsable, verseTiming, verseStartFractions, fallbackBasmalahLeadMs, handleSeek]
  );

  /**
   * Starts (or resumes) playback, entering at `verseNumber` instead of wherever
   * the source currently sits. Null plays exactly as before. A track already
   * loaded is placed immediately; a fresh one has nothing to seek yet, so the
   * verse is held and applied by the effect below once it reports a length.
   */
  const playFrom = useCallback(
    async (verseNumber: number | null) => {
      // A tap while playing is a pause — it must not arm a jump for the resume.
      if (!audio.isPlaying) {
        const placed = verseNumber != null && seekToVerse(verseNumber);
        setPendingStartVerse(placed ? null : verseNumber);
      }
      await handlePlay();
    },
    [audio.isPlaying, seekToVerse, handlePlay]
  );

  /* eslint-disable react-hooks/set-state-in-effect -- intentional: drops a jump the surah change invalidated, and applies a held one as soon as the track reports a length */
  // A verse number means nothing once the reader is on another surah.
  useEffect(() => { setPendingStartVerse(null); }, [currentSurahId]);

  useEffect(() => {
    if (pendingStartVerse == null) return;
    if (seekToVerse(pendingStartVerse)) setPendingStartVerse(null);
  }, [pendingStartVerse, seekToVerse]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const hasAudio = audio.durationMillis > 0;
  const selectedReciterUnavailable =
    selectedReciterId != null && unavailableReciterIds.has(selectedReciterId);
  const showAudioError = (audio.hasError && !audio.loadTimedOut) || selectedReciterUnavailable;
  const showAudioLoadTimeout = audio.loadTimedOut && !audio.hasError;

  return {
    surah,
    isContextReady,
    selectedReciterId,

    currentRecitation,
    isLoadingRecitations: recitations.isLoadingRecitations,
    filteredReciters: recitations.filteredReciters,
    reciterSearch: recitations.reciterSearch,
    setReciterSearch: recitations.setReciterSearch,
    showReciterPicker: recitations.showReciterPicker,
    setShowReciterPicker: recitations.setShowReciterPicker,
    handleReciterSelect: recitations.handleReciterSelect,

    audio,
    hasAudio,
    showAudioError,
    showAudioLoadTimeout,
    isBasmalahActive,
    handlePlay,
    playFrom,
    handleRetryAudio,
    handleSeek,

    isCached: recitations.isCached,
    isDownloading: recitations.isDownloading,
    downloadProgress: recitations.downloadProgress,
    handleDownload,

    activeVerseIndex,
    activeVerseKey,
  };
}
