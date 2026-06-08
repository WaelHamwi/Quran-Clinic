import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  PanResponder,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '@/services/api';
import { audioService } from '@/services/audioService';
import { offlineStorage } from '@/services/offlineStorage';
import { quranService } from '@/services/quranService';
import { useMushafContext } from '@/context/MushafContext';
import { ReciterPickerModal } from '@/components/mushaf/ReciterPickerModal';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAudio, PLAYBACK_SPEEDS, type PlaybackSpeed } from '@/hooks/useAudio';
import { useSurah } from '@/hooks/useSurah';
import { useVerseTiming } from '@/hooks/useVerseTiming';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/theme/colors';
import { createReaderStyles, READER_GRADIENT_COLORS } from '@/styles/reader.styles';
import type { Verse } from '@/types/verse';
import type { Recitation } from '@/types/recitation';

const TOTAL_SURAHS = 114;

const SPEED_LABELS: Record<PlaybackSpeed, string> = {
  0.5:  '0.5×',
  0.75: '0.75×',
  1:    '1×',
  1.5:  '1.5×',
  2:    '2×',
};

const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;
function toEastern(n: number): string {
  return String(n).split('').map(d => EASTERN_DIGITS[+d]).join('');
}

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// Resolve the streamable URI for a recitation.
// CDN/remote recitations expose an absolute `audio_url` we can stream directly —
// this also sidesteps the local API base, which is unreachable from a device
// when the backend isn't on the LAN (the recitation data itself may have arrived
// from production via the per-request fallback while API_URL still points local).
// Only backend-stored files (relative path) need the API proxy endpoint.
function resolveRecitationUri(recitation: Recitation): string {
  const url = recitation.audio_url ?? '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}/recitations/${recitation.id}/audio`;
}

// ─── SurahHeader ─────────────────────────────────────────────────────────────
const SurahHeader = React.memo(function SurahHeader({
  surah,
  language,
  t,
}: {
  surah: { id: number; name: { ar: string; en?: string | null }; transliteration: string; total_verses: number; type: string };
  language: 'ar' | 'en';
  t: { reader: { verses: string }; mushaf: { meccan: string; medinan: string } };
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);
  // Basmalah precedes every surah except Al-Fatiha (verse 1 IS the basmalah) and At-Tawbah (no basmalah)
  const showBasmalah = surah.id !== 1 && surah.id !== 9;

  return (
    <View style={styles.surahHeader}>
      <View style={styles.surahHeaderBanner}>
        {/* Arabic name shown calligraphically — mushaf always displays the Arabic canonical name */}
        <Text style={styles.surahHeaderName}>﴿ {surah.name.ar} ﴾</Text>
        <Text style={styles.surahHeaderMeta}>
          {surah.transliteration} · {toEastern(surah.total_verses)} {t.reader.verses} · {surah.type === 'meccan' ? t.mushaf.meccan : t.mushaf.medinan}
        </Text>
      </View>
      {showBasmalah && (
        <Text style={styles.basmalah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
      )}
    </View>
  );
});

// ─── SeekBar ──────────────────────────────────────────────────────────────────
const SeekBar = React.memo(function SeekBar({
  positionMillis,
  durationMillis,
  onSeek,
}: {
  positionMillis: number;
  durationMillis: number;
  onSeek: (ms: number) => void;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);

  const viewRef = useRef<View>(null);
  // Stores absolute screen position via measure() — more accurate than onLayout x during drag
  const trackRef = useRef({ pageX: 0, width: 1 });
  const durationRef = useRef(durationMillis);
  durationRef.current = durationMillis;
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const pctFromPageX = (pageX: number) => {
    const { pageX: tx, width } = trackRef.current;
    return Math.max(0, Math.min(1, (pageX - tx) / width));
  };

  const panHandlers = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setDragProgress(pctFromPageX(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        // pageX is absolute — stays correct as finger slides past the track edges
        setDragProgress(pctFromPageX(e.nativeEvent.pageX));
      },
      onPanResponderRelease: (e) => {
        const pct = pctFromPageX(e.nativeEvent.pageX);
        onSeekRef.current(pct * durationRef.current);
        setDragProgress(null);
      },
      onPanResponderTerminate: () => {
        setDragProgress(null);
      },
    })
  ).current;

  const progress =
    dragProgress !== null
      ? dragProgress
      : durationMillis > 0
      ? positionMillis / durationMillis
      : 0;

  const fillPct = `${(progress * 100).toFixed(2)}%`;

  return (
    <View
      ref={viewRef}
      style={styles.seekTrack}
      onLayout={() => {
        // measure() gives absolute pageX; onLayout only gives parent-relative position
        viewRef.current?.measure((_x, _y, width, _h, pageX) => {
          trackRef.current = { pageX, width: width || 1 };
        });
      }}
      {...panHandlers.panHandlers}
    >
      <View style={[styles.seekFill, { width: fillPct as any }]} />
      <View style={[styles.seekThumb, { left: fillPct as any }]} />
    </View>
  );
});

// ─── VerseRow ─────────────────────────────────────────────────────────────────
const VerseRow = React.memo(function VerseRow({
  item,
  showEnglish,
  isActive,
}: {
  item: Verse;
  showEnglish: boolean;
  isActive: boolean;
}) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);

  const hasEn = Boolean(item.text.en);
  return (
    <View style={[styles.verseRow, isActive && styles.verseRowActive]}>
      <View style={[styles.verseNumberCircle, isActive && styles.verseNumberCircleActive]}>
        <Text style={[styles.verseNumber, isActive && styles.verseNumberActive]}>
          {toEastern(item.verse_number)}
        </Text>
      </View>
      <View style={styles.verseTexts}>
        <Text style={[styles.verseArabic, isActive && styles.verseArabicActive]}>
          {item.text.ar}
        </Text>
        {showEnglish && hasEn && (
          <Text style={[styles.verseEnglish, isActive && styles.verseEnglishActive]}>
            {item.text.en}
          </Text>
        )}
        {showEnglish && !hasEn && (
          <Text style={styles.verseEnglishMissing}>{t.reader.translationMissing}</Text>
        )}
      </View>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MushafReaderScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const surahId = Number(id);
  const router = useRouter();

  const { selectedReciterId, setSelectedReciterId, isContextReady } = useMushafContext();
  const { data: surah, isLoading, error, refetch: refetchSurah, isRefetching: isSurahRefetching } = useSurah(surahId);
  const audio = useAudio();
  const { theme } = useTheme();
  const { t, language, isArabic } = useLanguage();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);

  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [isLoadingRecitations, setIsLoadingRecitations] = useState(true);
  const [isRefreshingRecitations, setIsRefreshingRecitations] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isCached, setIsCached] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [activeVerseIndex, setActiveVerseIndex] = useState(-1);
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [reciterSearch, setReciterSearch] = useState('');

  const flatListRef = useRef<FlatList<Verse>>(null);
  const lastScrolledIndexRef = useRef(-1);

  const currentRecitation = recitations.find((r) => r.reciter_id === selectedReciterId);

  const reciters = useMemo(
    () => recitations.flatMap((r) => (r.reciter ? [r.reciter] : [])),
    [recitations]
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

  // Precise per-verse timestamps from Quran.com v4 (same recitation ID the seeder uses)
  const { data: verseTiming } = useVerseTiming(surahId, currentRecitation?.reciter?.name?.en ?? undefined);

  // Text-length proportional fractions — fallback while verseTiming is loading
  const verseStartFractions = useMemo(() => {
    if (!surah) return [] as number[];
    const lengths = surah.verses.map((v) => Math.max(v.text.ar.replace(/\s/g, '').length, 8));
    const total = lengths.reduce((a, b) => a + b, 0);
    let cum = 0;
    return lengths.map((len) => { const s = cum / total; cum += len; return s; });
  }, [surah]);

  // Always-fresh lookup function in a ref — handleSeek/handleSkip read this without
  // needing verseTiming in their own deps (avoids SeekBar re-renders on timing load).
  const getIdxAtMsRef = useRef<(ms: number) => number>(() => -1);
  getIdxAtMsRef.current = (posMs: number): number => {
    if (verseTiming && verseTiming.length > 0) {
      for (let i = verseTiming.length - 1; i >= 0; i--) {
        if (posMs >= verseTiming[i].timestampFrom) return i;
      }
      return 0;
    }
    if (verseStartFractions.length === 0 || audio.durationMillis === 0) return -1;
    const progress = posMs / audio.durationMillis;
    for (let i = verseStartFractions.length - 1; i >= 0; i--) {
      if (progress >= verseStartFractions[i]) return i;
    }
    return 0;
  };

  useEffect(() => {
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
    audioService.isAudioCached(surahId, selectedReciterId).then(setIsCached);
  }, [currentRecitation, surahId, selectedReciterId]);

  useEffect(() => {
    return () => {
      audio.unload();
    };
  }, []);

  useEffect(() => {
    if (!surah || audio.durationMillis === 0) { setActiveVerseIndex(-1); return; }
    const idx = getIdxAtMsRef.current(audio.positionMillis);
    if (idx < 0) return;
    // Update highlight — React bails out if idx hasn't changed, so no extra re-render
    setActiveVerseIndex(idx);
    // Scroll is a side-effect and must live outside the setState callback
    if (audio.isPlaying && idx !== lastScrolledIndexRef.current) {
      lastScrolledIndexRef.current = idx;
      try {
        flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.25 });
      } catch {
        flatListRef.current?.scrollToOffset({ offset: idx * 90, animated: true });
      }
    }
  }, [audio.positionMillis, audio.durationMillis, audio.isPlaying, surah]);

  useEffect(() => {
    if (!audio.isPlaying) {
      lastScrolledIndexRef.current = -1;
    }
  }, [audio.isPlaying]);

  const handlePlay = useCallback(async () => {
    if (!currentRecitation || !selectedReciterId) return;
    if (audio.isPlaying) {
      await audio.pause();
      return;
    }
    // Only load if no source has been set — prevents restarting from 0 on every resume
    if (!audio.hasSource) {
      const cached = await audioService.isAudioCached(surahId, selectedReciterId);
      const uri = cached
        ? audioService.getLocalPath(surahId, selectedReciterId)
        : resolveRecitationUri(currentRecitation);
      await audio.loadAudio(uri);
    }
    await audio.play();
  }, [currentRecitation, selectedReciterId, surahId, audio]);

  const handleDownload = useCallback(async () => {
    if (!currentRecitation || !selectedReciterId) return;
    setIsDownloading(true);
    try {
      await audioService.downloadAudio(
        resolveRecitationUri(currentRecitation),
        surahId,
        selectedReciterId,
        setDownloadProgress
      );
      setIsCached(true);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [currentRecitation, selectedReciterId, surahId]);

  const handleSeek = useCallback(
    (ms: number) => {
      const clipped = Math.max(0, ms);
      audio.seekTo(clipped);
      // Snap highlight immediately — don't wait for positionMillis to async-update
      const idx = getIdxAtMsRef.current(clipped);
      if (idx >= 0) {
        setActiveVerseIndex(idx);
        lastScrolledIndexRef.current = idx;
        try {
          flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.25 });
        } catch {
          flatListRef.current?.scrollToOffset({ offset: idx * 90, animated: true });
        }
      }
    },
    [audio]
  );

  const handleSkip = useCallback(
    (deltaSecs: number) => {
      const newMs = Math.max(0, audio.positionMillis + deltaSecs * 1000);
      audio.seekTo(newMs);
      const idx = getIdxAtMsRef.current(newMs);
      if (idx >= 0) {
        setActiveVerseIndex(idx);
        lastScrolledIndexRef.current = idx;
        try {
          flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.25 });
        } catch {
          flatListRef.current?.scrollToOffset({ offset: idx * 90, animated: true });
        }
      }
    },
    [audio]
  );

  const handleSetRate = useCallback((spd: PlaybackSpeed) => {
    audio.setRate(spd);
  }, [audio]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshingRecitations(true);
    try {
      await refetchSurah();
      const res = await quranService.getSurahRecitations(surahId);
      const list = res.data ?? [];
      setRecitations(list);
      offlineStorage.saveRecitations(list).catch(() => {});
    } catch {
      // keep existing data on failure
    } finally {
      setIsRefreshingRecitations(false);
    }
  }, [refetchSurah, surahId]);

  const goToPrev = useCallback(() => {
    if (surahId > 1) router.replace(`/mushaf/${surahId - 1}` as any);
  }, [surahId, router]);

  const goToNext = useCallback(() => {
    if (surahId < TOTAL_SURAHS) router.replace(`/mushaf/${surahId + 1}` as any);
  }, [surahId, router]);

  const extraData = useMemo(
    () => ({ showEnglish, activeVerseIndex }),
    [showEnglish, activeVerseIndex]
  );

  const renderVerse = useCallback(
    ({ item, index }: { item: Verse; index: number }) => (
      <VerseRow item={item} showEnglish={showEnglish} isActive={index === activeVerseIndex} />
    ),
    [showEnglish, activeVerseIndex]
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      flatListRef.current?.scrollToOffset({
        offset: info.index * info.averageItemLength,
        animated: false,
      });
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.25,
        });
      }, 200);
    },
    []
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>{t.reader.loading}</Text>
      </View>
    );
  }

  if (error || !surah) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t.reader.error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetchSurah()}>
          <Text style={styles.retryBtnText}>{t.reader.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasAudio = audio.durationMillis > 0;

  return (
    <LinearGradient
      colors={READER_GRADIENT_COLORS}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >

      {/* ── Figma 18085:1435 — white glass card over gradient ─────────────── */}
      <View style={styles.contentWrapper}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={[styles.header, isArabic && styles.headerRtl]}>
          {/* First nav: prev (LTR left / RTL right) */}
          <TouchableOpacity
            style={[styles.navBtn, surahId <= 1 && styles.navBtnDisabled]}
            onPress={goToPrev}
            disabled={surahId <= 1}
          >
            <Ionicons
              name={isArabic ? 'chevron-forward' : 'chevron-back'}
              size={22}
              color={palette.brand[500]}
            />
          </TouchableOpacity>

          {/* Center: surah name in active app language */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{surah.name[language]}</Text>
            <Text style={styles.headerSub}>
              {surah.transliteration} · {surah.total_verses} {t.reader.verses}
            </Text>
          </View>

          {/* EN/AR translation toggle */}
          <TouchableOpacity
            style={[styles.langToggle, showEnglish && styles.langToggleActive]}
            onPress={() => setShowEnglish((v) => !v)}
          >
            <Text style={[styles.langToggleText, showEnglish && styles.langToggleTextActive]}>
              {showEnglish ? 'EN' : 'AR'}
            </Text>
          </TouchableOpacity>

          {/* Second nav: next (LTR right / RTL left) */}
          <TouchableOpacity
            style={[styles.navBtn, surahId >= TOTAL_SURAHS && styles.navBtnDisabled]}
            onPress={goToNext}
            disabled={surahId >= TOTAL_SURAHS}
          >
            <Ionicons
              name={isArabic ? 'chevron-back' : 'chevron-forward'}
              size={22}
              color={palette.brand[500]}
            />
          </TouchableOpacity>
        </View>

        {/* ── Verse list ────────────────────────────────────────────────────── */}
        <FlatList<Verse>
          style={{ flex: 1 }}
          ref={flatListRef}
          data={surah.verses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderVerse}
          extraData={extraData}
          contentContainerStyle={styles.verseList}
          initialNumToRender={20}
          maxToRenderPerBatch={15}
          windowSize={21}
          onScrollToIndexFailed={onScrollToIndexFailed}
          ListHeaderComponent={
            <SurahHeader surah={surah} language={language} t={t} />
          }
          refreshControl={
            <RefreshControl
              refreshing={isSurahRefetching || isRefreshingRecitations}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
              progressBackgroundColor={theme.surface}
            />
          }
        />

      </View>

      {/* ── Player ──────────────────────────────────────────────────────────── */}
      {currentRecitation ? (
        <View style={[styles.player, { paddingBottom: Math.max(bottomInset, 24) }]}>
          <View style={styles.playerTopRow}>
            <TouchableOpacity
              style={styles.playerReciterBlock}
              onPress={() => setShowReciterPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.playerReciterLabel}>
                {'🎙  ' + t.reader.reciter.toUpperCase()}
              </Text>
              <Text style={styles.playerReciter} numberOfLines={1}>
                {currentRecitation.reciter?.name?.[language] ?? '—'}
              </Text>
            </TouchableOpacity>
            {isCached ? (
              <View style={styles.cachedBadge}>
                <Text style={styles.cachedText}>{t.reader.saved}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={handleDownload}
                disabled={isDownloading}
              >
                <Text style={styles.downloadText}>
                  {isDownloading ? `${Math.round(downloadProgress * 100)}%` : t.reader.save}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {hasAudio && (
            <SeekBar
              positionMillis={audio.positionMillis}
              durationMillis={audio.durationMillis}
              onSeek={handleSeek}
            />
          )}
          {!hasAudio && <View style={styles.seekTrackEmpty} />}

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{fmt(audio.positionMillis)}</Text>
            <Text style={styles.timeText}>{fmt(audio.durationMillis)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleSkip(-5)}
              disabled={!hasAudio}
            >
              <Text style={styles.skipBtnText}>−5s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlay}
              disabled={audio.isLoading}
            >
              {audio.isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.playButtonText}>{audio.isPlaying ? '⏸' : '▶'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleSkip(5)}
              disabled={!hasAudio}
            >
              <Text style={styles.skipBtnText}>+5s</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.speedRow}>
            {PLAYBACK_SPEEDS.map((spd) => {
              const active = audio.rate === spd;
              return (
                <TouchableOpacity
                  key={spd}
                  style={[styles.speedChip, active && styles.speedChipActive]}
                  onPress={() => handleSetRate(spd)}
                >
                  <Text style={[styles.speedChipText, active && styles.speedChipTextActive]}>
                    {SPEED_LABELS[spd]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : isLoadingRecitations || !isContextReady ? null : (
        <TouchableOpacity
          style={[styles.noReciterBanner, { paddingBottom: Math.max(bottomInset, 14) }]}
          onPress={() => setShowReciterPicker(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.noReciterRow, isArabic && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="mic-outline" size={16} color={palette.brand[500]} />
            <Text style={styles.noReciterText}>{t.reader.selectReciterHint}</Text>
            <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={14} color={palette.brand[500]} />
          </View>
        </TouchableOpacity>
      )}
      <ReciterPickerModal
        visible={showReciterPicker}
        onClose={() => { setShowReciterPicker(false); setReciterSearch(''); }}
        filteredReciters={filteredReciters}
        selectedReciterId={selectedReciterId}
        onSelect={handleReciterSelect}
        reciterSearch={reciterSearch}
        onSearchChange={setReciterSearch}
      />
    </LinearGradient>
  );
}
