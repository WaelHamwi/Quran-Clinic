import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { AudioPlayer } from '@/components/players/AudioPlayer';
import { KaraokeText } from '@/components/players/KaraokeText';
import { VerseText } from '@/components/players/VerseText';
import { WirdPager } from '@/components/players/WirdPager';
import { WirdMenuSheet } from '@/components/players/WirdMenuSheet';
import { LockedWird } from '@/components/players/LockedWird';
import { useCategory } from '@/hooks/useCategory';
import { useSubcategory } from '@/hooks/useSubcategory';
import { usePlayer } from '@/hooks/usePlayer';
import { useGeneralRuqyah } from '@/hooks/useGeneralRuqyah';
import { useDownloadManager } from '@/hooks/useDownloadManager';
import { useRefresh } from '@/hooks/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsPaid } from '@/store/slices/authSlice';
import { selectPlayerDiseaseId } from '@/store/slices/playerSlice';
import { enqueue } from '@/store/slices/offlineQueueSlice';
import { ruqyahService } from '@/services/ruqyahService';
import { pickText } from '@/utils/formatters';
import { palette } from '@/theme/colors';
import { diseaseScreenStyles as s, TAB_ICON_COLOR } from '@/styles/diseaseScreen.styles';
import type { AccessibleRecording } from '@/hooks/useRecordings';

export default function CategoryRecordingsScreen() {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { t, isArabic } = useLanguage();
  const dispatch = useAppDispatch();
  const isPaid = useAppSelector(selectIsPaid);

  // Recordings can hang off a category OR a subcategory; the navigator passes
  // `?level=subcategory` for the latter. Both hooks are always called; the
  // inactive one is disabled via an empty slug.
  const level = params.level === 'subcategory' ? 'subcategory' : 'category';
  const catQ = useCategory(level === 'category' ? slug : '');
  const subQ = useSubcategory(level === 'subcategory' ? slug : '');
  const node = level === 'subcategory' ? subQ.subcategory : catQ.category;
  const rawRecordings = level === 'subcategory' ? subQ.recordings : catQ.recordings;
  const isLoading = level === 'subcategory' ? subQ.isLoading : catQ.isLoading;
  const error = level === 'subcategory' ? subQ.error : catQ.error;
  const refetch = level === 'subcategory' ? subQ.refetch : catQ.refetch;

  const recordings = useMemo<AccessibleRecording[]>(() => {
    return [...rawRecordings]
      .sort((a, b) => {
        if (a.is_free !== b.is_free) return a.is_free ? -1 : 1;
        return a.session_number - b.session_number;
      })
      .map((r) => ({
        ...r,
        accessible: !r.requires_subscription || isPaid,
      }));
  }, [rawRecordings, isPaid]);

  const { refreshing, onRefresh } = useRefresh(refetch);
  const player = usePlayer();
  const { stop: playerStop } = player;
  const { playNext: generalNext, playPrevious: generalPrev, hasPrevious: generalHasPrev, hasNext: generalHasNext, isGeneralMode } = useGeneralRuqyah();
  const playerDiseaseId = useAppSelector(selectPlayerDiseaseId);
  const { getLocalUri } = useDownloadManager();
  const hasAutoPlayed = useRef(false);

  const contextId = node?.id ?? 0;

  // More than three wird switches the tab strip for a pager + wird-list menu,
  // and lets the user browse to (locked) wird that aren't playing.
  const manyWird = recordings.length > 3;
  const [viewIndex, setViewIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  const currentIndex = useMemo(
    () => recordings.findIndex((r) => player.isCurrent(r.id)),
    [recordings, player],
  );

  // The wird shown on screen: the browsed one in pager mode, otherwise the
  // playing one (falling back to the first).
  const displayIndex = manyWird
    ? Math.min(viewIndex, recordings.length - 1)
    : currentIndex >= 0 ? currentIndex : 0;
  const displayed = recordings[displayIndex];
  const viewedLocked = manyWird && !!displayed && !displayed.accessible;

  const startPlayback = useCallback(
    (recording: AccessibleRecording) => {
      player.loadAndPlay(recording, contextId, getLocalUri(recording.id));
      ruqyahService.incrementPlayCount(recording.id).catch(() => {
        dispatch(enqueue({ type: 'playCount', payload: { recordingId: recording.id } }));
      });
    },
    [player, getLocalUri, contextId, dispatch],
  );

  const handlePlay = useCallback(
    (recording: AccessibleRecording) => {
      if (!recording.accessible) {
        router.push('/hospital/disease/subscription');
        return;
      }
      if (player.isCurrent(recording.id)) {
        player.togglePlay();
        return;
      }
      startPlayback(recording);
    },
    [player, startPlayback],
  );

  // Pager / menu navigation: browse to any wird. Accessible wird start playing;
  // locked wird pause playback and surface the paywall card in place.
  const goToWird = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= recordings.length) return;
      setViewIndex(idx);
      setMenuVisible(false);
      const rec = recordings[idx];
      if (!rec.accessible) {
        player.pause();
        return;
      }
      if (!player.isCurrent(rec.id)) startPlayback(rec);
    },
    [recordings, player, startPlayback],
  );

  // Keep the pager in sync when playback moves on its own (auto-play, auto-switch).
  useEffect(() => {
    if (manyWird && currentIndex >= 0) setViewIndex(currentIndex);
  }, [manyWird, currentIndex]);

  const hasPrevious = manyWird ? displayIndex > 0 : currentIndex > 0;
  const hasNext = manyWird
    ? displayIndex < recordings.length - 1
    : currentIndex < recordings.length - 1;

  const handlePrevious = useCallback(() => {
    if (manyWird) {
      goToWird(displayIndex - 1);
      return;
    }
    const prev = recordings[currentIndex - 1];
    if (prev) handlePlay(prev);
  }, [manyWird, goToWird, displayIndex, currentIndex, recordings, handlePlay]);

  const handleNext = useCallback(() => {
    if (manyWird) {
      goToWird(displayIndex + 1);
      return;
    }
    const next = recordings[currentIndex + 1];
    if (next) handlePlay(next);
  }, [manyWird, goToWird, displayIndex, currentIndex, recordings, handlePlay]);

  useEffect(() => {
    if (isGeneralMode || hasAutoPlayed.current || recordings.length === 0) return;
    if (currentIndex >= 0) {
      hasAutoPlayed.current = true;
      return;
    }
    const first = recordings.find((r) => r.accessible && r.audio_url);
    if (!first) return;
    hasAutoPlayed.current = true;
    handlePlay(first);
  }, [recordings, currentIndex, handlePlay, isGeneralMode]);

  // When the admin overrides the free session, the cached data refreshes every 30 s.
  // If the currently-playing recording just became locked, switch immediately to the
  // new free session (recordings[0] after the sort — is_free first).
  useEffect(() => {
    if (isGeneralMode || recordings.length === 0 || currentIndex < 0) return;
    const active = recordings[currentIndex];
    if (!active || active.accessible) return;
    const freeRecording = recordings[0];
    if (freeRecording?.accessible) {
      handlePlay(freeRecording);
    } else {
      playerStop();
    }
  }, [recordings, currentIndex, handlePlay, playerStop, isGeneralMode]);

  const title = node ? pickText(node.name, isArabic) : t.hospital.title;

  if (isLoading) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={title} showBack />
        <Loader fullScreen message={t.common.loading} />
      </Screen>
    );
  }

  if (error || !node) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={title} showBack />
        <EmptyState icon="cloud-offline-outline" title={t.common.error} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={title} showBack />

      <View style={s.content}>
        {/* Session tabs (≤3) or wird pager (>3) — Figma nodes 18032:3101 / 18900:2907 */}
        {recordings.length > 0 && (
          <View style={s.tabsWrap}>
            {manyWird ? (
              <WirdPager
                isArabic={isArabic}
                label={t.disease.session(displayIndex + 1)}
                position={t.disease.wirdPosition(displayIndex + 1, recordings.length)}
                locked={!displayed?.accessible}
                hasPrev={hasPrevious}
                hasNext={hasNext}
                onPrev={handlePrevious}
                onNext={handleNext}
                onPressLabel={() => setMenuVisible(true)}
              />
            ) : (
              <View style={[s.tabGroup, isArabic && s['tabGroup--rtl']]}>
                {recordings.map((r, idx) => {
                  const active = player.isCurrent(r.id);
                  const label = t.disease.session(idx + 1);
                  return (
                    <Pressable
                      key={r.id}
                      style={[s.tab, active && s['tab--active']]}
                      onPress={() => handlePlay(r)}
                    >
                      {!active && (
                        <Ionicons name="time-outline" size={12} color={TAB_ICON_COLOR} />
                      )}
                      <Text
                        style={[s.tabText, active && s['tabText--active']]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Section card — Figma nodes 18032:3107 / 18972:3492 (locked) */}
        <View style={[s.sectionCard, player.isDarkMode && { backgroundColor: palette.brand[700] }]}>
          {viewedLocked ? (
            <LockedWird
              onSubscribe={() => router.push('/hospital/disease/subscription')}
              onReturn={() => goToWird(0)}
            />
          ) : (
            (() => {
              const refreshCtrl = (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={palette.brand[500]}
                  colors={[palette.brand[500]]}
                />
              );
              if (recordings.length === 0) {
                return (
                  <ScrollView contentContainerStyle={s.cardScroll} showsVerticalScrollIndicator={false} refreshControl={refreshCtrl}>
                    <Text style={s.emptyText}>{t.disease.noRecordings}</Text>
                  </ScrollView>
                );
              }
              const active = displayed;
              if (!active) return null;
              const hasSegments = (active.segments?.length ?? 0) > 0;
              if (hasSegments) {
                return <KaraokeText segments={active.segments!} refreshing={refreshing} onRefresh={onRefresh} />;
              }
              if (active.description) {
                return <VerseText text={active.description} refreshing={refreshing} onRefresh={onRefresh} />;
              }
              return (
                <ScrollView
                  contentContainerStyle={s.cardScroll}
                  showsVerticalScrollIndicator={false}
                  refreshControl={refreshCtrl}
                />
              );
            })()
          )}
        </View>
      </View>

      {/* Wird list — Figma node 18975:3626 */}
      {manyWird && (
        <WirdMenuSheet
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          items={recordings}
          activeIndex={displayIndex}
          isArabic={isArabic}
          title={t.disease.wirdMenuTitle}
          sessionLabel={t.disease.session}
          onSelect={goToWird}
        />
      )}

      {player.currentRecording && !isGeneralMode && playerDiseaseId === contextId && !viewedLocked && (
        <AudioPlayer
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      )}
      {player.currentRecording && isGeneralMode && (
        <AudioPlayer
          onPrevious={generalPrev}
          onNext={generalNext}
          hasPrevious={generalHasPrev}
          hasNext={generalHasNext}
        />
      )}
    </Screen>
  );
}
