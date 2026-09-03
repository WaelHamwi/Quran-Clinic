import { useCallback, useEffect, useMemo, useState } from 'react';
import { audioService } from '@/services/player/audioService';
import { offlineStorage } from '@/services/common/offlineStorage';
import { quranService } from '@/services/mushaf/quranService';
import { useReciterAvailability } from '@/hooks/mushaf/useReciterAvailability';
import { hasQurancomTiming, useVerseTiming } from '@/hooks/mushaf/useVerseTiming';
import type { Recitation } from '@/types/recitation';

type AudioSlice = {
  hasError: boolean;
  loadTimedOut: boolean;
  unload: () => void | Promise<void>;
  playingSurah: { id: number } | null;
};

type Params = {
  surahId: number;
  selectedReciterId: number | null;
  setSelectedReciterId: (id: number | null) => void;
  audio: AudioSlice;
};

export function useReaderRecitations({ surahId, selectedReciterId, setSelectedReciterId, audio }: Params) {
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [isLoadingRecitations, setIsLoadingRecitations] = useState(true);
  const [isRefreshingRecitations, setIsRefreshingRecitations] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isCached, setIsCached] = useState(false);
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [reciterSearch, setReciterSearch] = useState('');

  const currentRecitation = recitations.find((r) => r.reciter_id === selectedReciterId);

  // Detects reciters whose audio actually 404s for this surah so they can be
  // hidden from the picker (issue: don't show reciters not available here).
  const { unavailableReciterIds, markUnavailable } = useReciterAvailability(recitations);

  const reciters = useMemo(
    () =>
      recitations.flatMap((r) =>
        r.reciter && !unavailableReciterIds.has(r.reciter_id) ? [r.reciter] : []
      ),
    [recitations, unavailableReciterIds]
  );

  const filteredReciters = useMemo(() => {
    const q = reciterSearch.trim().toLowerCase();
    if (!q) return reciters;
    return reciters.filter(
      (r) => r.name.ar.toLowerCase().includes(q) || (r.name.en ?? '').toLowerCase().includes(q)
    );
  }, [reciters, reciterSearch]);

  const handleReciterSelect = useCallback(
    (id: number | null) => {
      setSelectedReciterId(id);
      setShowReciterPicker(false);
      setReciterSearch('');
      audio.unload();
    },
    [setSelectedReciterId, audio]
  );

  // Precise per-verse timestamps from Quran.com v4, plus the exact audio file
  // they are aligned to (the backend's legacy files are different recordings).
  const reciterNameEn = currentRecitation?.reciter?.name?.en ?? undefined;
  const timingQuery = useVerseTiming(surahId, reciterNameEn);
  const timingData = timingQuery.data;
  const verseTiming = timingData?.timings;
  const timingAudioUrl = timingData?.audioUrl ?? null;

  // Playback locks in whatever source it starts with, so a play-tap that lands
  // before the timing fetch settles would stick the whole session on the legacy
  // file (proportional, drifting highlight). When this reciter has exact timing,
  // wait briefly for the fetch instead of racing it; bounded so an offline or
  // hanging request can't block playback.
  const { refetch: refetchTiming } = timingQuery;
  const timingExpected = hasQurancomTiming(reciterNameEn);
  const resolveTimedAudioUrl = useCallback(async (): Promise<string | null> => {
    if (timingData) return timingData.audioUrl;
    if (!timingExpected) return null;
    try {
      const result = await Promise.race([
        // cancelRefetch:false joins the fetch already in flight instead of restarting it
        refetchTiming({ cancelRefetch: false }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);
      return result?.data?.audioUrl ?? null;
    } catch {
      return null;
    }
  }, [timingData, timingExpected, refetchTiming]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: mark loading before the fetch starts
    setIsLoadingRecitations(true);
    quranService
      .getSurahRecitations(surahId)
      .then((res) => {
        const list = res.data ?? [];
        setRecitations(list);
        offlineStorage.saveRecitations(list).catch(() => {});
      })
      .catch(async () => {
        const cached = await offlineStorage.getRecitationsBySurah(surahId);
        setRecitations(cached);
      })
      .finally(() => setIsLoadingRecitations(false));
  }, [surahId]);

  useEffect(() => {
    if (!currentRecitation || !selectedReciterId) return;
    // Check the variant playback will actually use: the timing-aligned file
    // when timings exist, the legacy backend file otherwise.
    audioService.isAudioCached(surahId, selectedReciterId, !!timingAudioUrl).then(setIsCached);
  }, [currentRecitation, surahId, selectedReciterId, timingAudioUrl]);

  // setParams doesn't remount — unload audio and clear the cached flag on surah change.
  // Skipped when the loaded source already belongs to this surah: the engine now
  // lives at the root and keeps playing across navigation, so re-entering the
  // playing surah must reconnect to it, not silence it.
  useEffect(() => {
    if (audio.playingSurah?.id !== surahId) audio.unload();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: clear the cached flag when the surah changes
    setIsCached(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on surah change; `audio` is a fresh object every render (would unload on every re-render if added)
  }, [surahId]);

  // Only mark as unavailable on a DEFINITIVE error (native player 404), not on
  // transient timeouts. A timeout could mean slow network, not a missing file.
  useEffect(() => {
    if (audio.hasError && selectedReciterId && !audio.loadTimedOut) {
      markUnavailable(selectedReciterId, currentRecitation?.audio_url);
    }
  }, [audio.hasError, audio.loadTimedOut, selectedReciterId, currentRecitation?.audio_url, markUnavailable]);

  const handleRefreshRecitations = useCallback(async () => {
    const res = await quranService.getSurahRecitations(surahId);
    const list = res.data ?? [];
    setRecitations(list);
    offlineStorage.saveRecitations(list).catch(() => {});
  }, [surahId]);

  return {
    recitations,
    currentRecitation,
    verseTiming,
    timingAudioUrl,
    resolveTimedAudioUrl,
    unavailableReciterIds,
    isLoadingRecitations,
    isRefreshingRecitations,
    setIsRefreshingRecitations,
    isCached,
    setIsCached,
    isDownloading,
    setIsDownloading,
    downloadProgress,
    setDownloadProgress,
    showReciterPicker,
    setShowReciterPicker,
    reciterSearch,
    setReciterSearch,
    filteredReciters,
    handleReciterSelect,
    handleRefreshRecitations,
  };
}
