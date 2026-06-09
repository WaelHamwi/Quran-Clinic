import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { AudioPlayer } from '@/components/players/AudioPlayer';
import { KaraokeText } from '@/components/players/KaraokeText';
import { VerseText } from '@/components/players/VerseText';
import { useDisease } from '@/hooks/useDisease';
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

  const currentIndex = useMemo(
    () => recordings.findIndex((r) => player.isCurrent(r.id)),
    [recordings, player],
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
      player.loadAndPlay(recording, diseaseId, getLocalUri(recording.id));
      ruqyahService.incrementPlayCount(recording.id).catch(() => {
        dispatch(enqueue({ type: 'playCount', payload: { recordingId: recording.id } }));
      });
    },
    [player, getLocalUri, diseaseId, dispatch, t],
  );

  const handlePrevious = useCallback(() => {
    const prev = recordings[currentIndex - 1];
    if (prev) handlePlay(prev);
  }, [currentIndex, recordings, handlePlay]);

  const handleNext = useCallback(() => {
    const next = recordings[currentIndex + 1];
    if (next) handlePlay(next);
  }, [currentIndex, recordings, handlePlay]);

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
      <Header title={pickText(disease.name, isArabic)} showBack />

      {/* ── Main content area ─────────────────────────────────── */}
      <View style={s.content}>
        {/* Session tabs — Figma node 18032:3101 */}
        {recordings.length > 0 && (
          <View style={s.tabsWrap}>
            <View style={s.tabGroup}>
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
          </View>
        )}

        {/* Advisory alert — shown for first wird only (Figma node 18024:1107) */}
        {!alertDismissed && recordings.length > 0 && (currentIndex === 0 || currentIndex === -1) && (
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

        {/* Section card — Figma node 18032:3107 */}
        <View style={[s.sectionCard, player.isDarkMode && { backgroundColor: palette.brand[700] }]}>
          {(() => {
            const active = currentIndex >= 0 ? recordings[currentIndex] : recordings[0];
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
          })()}
        </View>
      </View>

      {/* ── Bottom audio player panel — Figma node 18032:3119 ─── */}
      {player.currentRecording && !isGeneralMode && playerDiseaseId === diseaseId && (
        <AudioPlayer
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < recordings.length - 1}
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
