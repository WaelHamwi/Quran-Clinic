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
  const [, setScrolled] = useState(false);
  const hasAutoPlayed = useRef(false);

  const contextId = node?.id ?? 0;

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
      player.loadAndPlay(recording, contextId, getLocalUri(recording.id));
      ruqyahService.incrementPlayCount(recording.id).catch(() => {
        dispatch(enqueue({ type: 'playCount', payload: { recordingId: recording.id } }));
      });
    },
    [player, getLocalUri, contextId, dispatch],
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
    const first = recordings[0];
    if (!first?.accessible) return;
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

        <View style={[s.sectionCard, player.isDarkMode && { backgroundColor: palette.brand[700] }]}>
          {(() => {
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
            const active = currentIndex >= 0 ? recordings[currentIndex] : recordings[0];
            if (!active) return null;
            const hasSegments = (active.segments?.length ?? 0) > 0;
            if (hasSegments) {
              return <KaraokeText segments={active.segments!} refreshing={refreshing} onRefresh={onRefresh} />;
            }
            return (
              <ScrollView
                contentContainerStyle={s.cardScroll}
                showsVerticalScrollIndicator={false}
                onScroll={() => setScrolled(true)}
                scrollEventThrottle={32}
                refreshControl={refreshCtrl}
              >
                {active.description && (
                  <Text style={[s.descText, { color: player.textColor, fontSize: player.fontSize, lineHeight: player.fontSize * 1.5 }]}>{pickText(active.description, isArabic)}</Text>
                )}
              </ScrollView>
            );
          })()}
        </View>
      </View>

      {player.currentRecording && !isGeneralMode && playerDiseaseId === contextId && (
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
