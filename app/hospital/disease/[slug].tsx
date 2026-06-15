import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { IconButton } from '@/components/common/IconButton';
import { ICON_FOREGROUND } from '@/components/layout/Header.styles';
import { AudioPlayer } from '@/components/players/AudioPlayer';
import { KaraokeText } from '@/components/players/KaraokeText';
import { VerseText } from '@/components/players/VerseText';
import { WirdPager } from '@/components/players/WirdPager';
import { WirdMenuSheet } from '@/components/players/WirdMenuSheet';
import { LockedWird } from '@/components/players/LockedWird';
import { useDisease } from '@/hooks/useDisease';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecordings, type AccessibleRecording } from '@/hooks/useRecordings';
import { usePlayer } from '@/hooks/usePlayer';
import { useGeneralRuqyah } from '@/hooks/useGeneralRuqyah';
import { useDownloadManager } from '@/hooks/useDownloadManager';
import { useRefresh } from '@/hooks/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { palette } from '@/theme/colors';
import { enqueue } from '@/store/slices/offlineQueueSlice';
import { selectPlayerDiseaseId } from '@/store/slices/playerSlice';
import { ruqyahService } from '@/services/ruqyahService';
import { pickText } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { diseaseScreenStyles as s, TAB_ICON_COLOR } from '@/styles/diseaseScreen.styles';

export default function DiseaseDetailScreen() {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { t, isArabic } = useLanguage();
  const dispatch = useAppDispatch();

  const { disease, isLoading, error, refetch: refetchDisease } = useDisease(slug);
  const diseaseId = disease?.id ?? 0;
  const { recordings, refetch: refetchRecordings } = useRecordings(diseaseId);
  const { isFavorited, toggleFavorite } = useFavorites();

  const refetchAll = useCallback(
    () => Promise.all([refetchDisease(), refetchRecordings()]),
    [refetchDisease, refetchRecordings],
  );
  const { refreshing, onRefresh } = useRefresh(refetchAll);
  const player = usePlayer();
  const { stop: playerStop } = player;
  const { playNext: generalNext, playPrevious: generalPrev, hasPrevious: generalHasPrev, hasNext: generalHasNext, isGeneralMode } = useGeneralRuqyah();
  const playerDiseaseId = useAppSelector(selectPlayerDiseaseId);
  const { getLocalUri } = useDownloadManager();
  const [alertDismissed, setAlertDismissed] = useState(false);
  const hasAutoPlayed = useRef(false);

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
      player.loadAndPlay(recording, diseaseId, getLocalUri(recording.id));
      ruqyahService.incrementPlayCount(recording.id).catch(() => {
        dispatch(enqueue({ type: 'playCount', payload: { recordingId: recording.id } }));
      });
    },
    [player, getLocalUri, diseaseId, dispatch],
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

  if (isLoading) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={t.hospital.diseases} showBack />
        <Loader fullScreen message={t.common.loading} />
      </Screen>
    );
  }

  if (error || !disease) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={t.hospital.diseases} showBack />
        <EmptyState icon="cloud-offline-outline" title={t.common.error} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header
        title={pickText(disease.name, isArabic)}
        showBack
        right={
          <IconButton
            icon={isFavorited(disease.id) ? 'heart' : 'heart-outline'}
            color={isFavorited(disease.id) ? palette.brand[500] : ICON_FOREGROUND}
            onPress={() => toggleFavorite(disease)}
          />
        }
      />

   

      {/* ── Main content area ─────────────────────────────────── */}
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

        {/* Advisory alert — shown for first wird only (Figma node 18024:1107) */}
        {!alertDismissed && recordings.length > 0 && displayIndex === 0 && (
          <View style={s.alert}>
            {isArabic ? (
              <Pressable onPress={() => setAlertDismissed(true)} hitSlop={8}>
                <Ionicons name="close" size={14} color={palette.system.warning[900]} />
              </Pressable>
            ) : (
              <Ionicons name="alert-circle-outline" size={20} color={palette.system.warning[900]} />
            )}
            <View style={s.alertContent}>
              <Text style={[s.alertTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.disease.alertTitle}
              </Text>
              <Text style={[s.alertBody, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t.disease.alertBody}
              </Text>
            </View>
            {isArabic ? (
              <Ionicons name="alert-circle-outline" size={20} color={palette.system.warning[900]} />
            ) : (
              <Pressable onPress={() => setAlertDismissed(true)} hitSlop={8}>
                <Ionicons name="close" size={14} color={palette.system.warning[900]} />
              </Pressable>
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
              const active = displayed;
              const refreshCtrl = (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={palette.brand[500]}
                  colors={[palette.brand[500]]}
                />
              );
              if (!active) {
                return (
                  <ScrollView contentContainerStyle={s.cardScroll} showsVerticalScrollIndicator={false} refreshControl={refreshCtrl} />
                );
              }
              const hasSegments = (active.segments?.length ?? 0) > 0;
              if (hasSegments) {
                return <KaraokeText segments={active.segments!} refreshing={refreshing} onRefresh={onRefresh} />;
              }
              if (active.description) {
                return <VerseText text={active.description} refreshing={refreshing} onRefresh={onRefresh} />;
              }
              return (
                <ScrollView contentContainerStyle={s.cardScroll} showsVerticalScrollIndicator={false} refreshControl={refreshCtrl} />
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

      {/* ── Bottom audio player panel — Figma node 18032:3119 ─── */}
      {player.currentRecording && !isGeneralMode && playerDiseaseId === diseaseId && !viewedLocked && (
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
