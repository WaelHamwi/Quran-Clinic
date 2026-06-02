import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { AudioPlayer } from '@/components/players/AudioPlayer';
import { FeedbackControl } from '@/components/forms/FeedbackControl';
import { useDisease } from '@/hooks/useDisease';
import { useRecordings, type AccessibleRecording } from '@/hooks/useRecordings';
import { usePlayer } from '@/hooks/usePlayer';
import { useDownloadManager } from '@/hooks/useDownloadManager';
import { useRefresh } from '@/hooks/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch } from '@/store/hooks';
import { palette } from '@/theme/colors';
import { enqueue } from '@/store/slices/offlineQueueSlice';
import { ruqyahService } from '@/services/ruqyahService';
import { feedbackService } from '@/services/feedbackService';
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
  const { getLocalUri } = useDownloadManager();
  const [feedbackDone, setFeedbackDone] = useState(false);

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

  const handleFeedback = useCallback(
    ({ useful, comment }: { useful: boolean; comment: string }) => {
      const payload = {
        service_type: 'disease',
        service_id: diseaseId,
        was_beneficial: useful,
        comment: comment || null,
      };
      feedbackService.submitFeedback(payload).catch(() => {
        dispatch(enqueue({ type: 'feedback', payload }));
      });
      setFeedbackDone(true);
    },
    [diseaseId, dispatch],
  );

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
              {recordings.map((r) => {
                const active = player.isCurrent(r.id);
                const label =
                  pickText(r.title, isArabic) || t.disease.session(r.session_number);
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

        {/* Section card — Figma node 18032:3107 */}
        <View style={s.sectionCard}>
          <ScrollView
            contentContainerStyle={s.cardScroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.brand[500]}
                colors={[palette.brand[500]]}
              />
            }
          >
            {disease.description ? (
              <Text style={s.descText}>{pickText(disease.description, isArabic)}</Text>
            ) : (
              <Text style={s.emptyText}>{t.disease.noRecordings}</Text>
            )}

            <View style={s.feedbackWrap}>
              <FeedbackControl onSubmit={handleFeedback} submitted={feedbackDone} />
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ── Bottom audio player panel — Figma node 18032:3119 ─── */}
      {player.currentRecording && (
        <AudioPlayer
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < recordings.length - 1}
        />
      )}
    </Screen>
  );
}
