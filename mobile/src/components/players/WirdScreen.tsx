import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { IconButton } from '@/components/common/IconButton';
import { WirdTabs } from '@/components/players/WirdTabs';
import { WirdSectionCard } from '@/components/players/WirdSectionCard';
import { WirdPlayerFooter } from '@/components/players/WirdPlayerFooter';
import { WirdIntroSheet } from '@/components/players/WirdIntroSheet';
import { useWirdScreenSource } from '@/hooks/player/useWirdScreenSource';
import type { WirdSourceKind } from '@/types/wird';
import { useWirdPlayback } from '@/hooks/player/useWirdPlayback';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/diseaseScreen.styles';
import { palette } from '@/theme/colors';

type Props = {
  /** Which resource backs this screen — see `WirdSourceKind`. */
  kind: WirdSourceKind;
};

/**
 * Shared wird player screen behind both `/hospital/disease/[slug]` and
 * `/hospital/recordings/[slug]`. An owner has at most two TABS — summarized
 * (مختصرة, free) and detailed (مطوّلة, subscribers) — switched only via the
 * segmented type tabs (Figma 19214:3234); the reader area itself has no
 * swapping. Either tab may hold several recordings, which play back-to-back as
 * one ruqyah with the text following along. `useWirdScreenSource` normalizes
 * the data, `useWirdPlayback` runs the playback state machine, and the `Wird*`
 * components render the UI.
 */
export function WirdScreen({ kind }: Props) {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const level = params.level === 'subcategory' ? 'subcategory' : 'category';
  const skipIntro = params.skipIntro === '1';
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  const src = useWirdScreenSource(kind, slug, level);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Intro sheet (Figma 19164:3739) gates the wird: nothing plays on arrival —
  // playback only ever starts from an explicit choice (intro card, tab, or play).
  const [introDismissed, setIntroDismissed] = useState(false);
  const introVisible =
    !skipIntro &&
    !introDismissed &&
    !src.isLoading &&
    !src.error &&
    src.hasEntity &&
    src.recordings.length > 0;
  // `skipIntro` so returning here from the mini player lands straight on the
  // wird that is already playing instead of re-gating it behind the intro sheet.
  const originRoute =
    kind === 'disease'
      ? `/hospital/disease/${slug}?skipIntro=1`
      : `/hospital/recordings/${slug}?level=${level}&skipIntro=1`;
  const wird = useWirdPlayback(src.recordings, src.contextId, originRoute);

  if (src.isLoading) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={src.title} showBack />
        <Loader fullScreen message={t.common.loading} />
      </Screen>
    );
  }

  if (src.error || !src.hasEntity) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={src.title} showBack />
        <EmptyState icon="cloud-offline-outline" title={t.common.error} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header
        title={src.title}
        showBack
        right={
          <IconButton
            icon={src.favorited ? 'heart' : 'heart-outline'}
            color={src.favorited ? theme.primary : theme.textSecondary}
            onPress={src.onToggleFavorite}
          />
        }
      />

      {/* ── Main content area ─────────────────────────────────── */}
      <View style={s.content}>
        <WirdTabs
          groups={wird.groups}
          displayIndex={wird.displayIndex}
          onSelect={wird.handlePlay}
        />

        {/* Advisory alert — disease only, until dismissed (Figma 18024:1107) */}
        {src.supportsAlert && !alertDismissed && src.recordings.length > 0 && (
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

        <WirdSectionCard
          viewedLocked={wird.viewedLocked}
          sessions={wird.sessions}
          displayed={wird.displayed}
          isDarkMode={wird.player.isDarkMode}
          refreshing={src.refreshing}
          onRefresh={src.onRefresh}
          onSubscribe={() => router.push('/hospital/disease/subscription')}
          onReturn={() => wird.goToWird(0)}
          emptyText={src.emptyText}
        />
      </View>

      {/* ── Bottom audio player panel — Figma node 18032:3119 ─── */}
      <WirdPlayerFooter
        hasCurrent={!!wird.player.currentRecording}
        isGeneralMode={wird.isQueueActive}
        isOwnPlayer={wird.isOwnPlayer}
        viewedLocked={wird.viewedLocked}
        local={{
          onPrevious: wird.handlePrevious,
          onNext: wird.handleNext,
          hasPrevious: wird.hasPrevious,
          hasNext: wird.hasNext,
        }}
        displayed={wird.displayed}
        contextId={src.contextId}
        title={src.title}
        onPlayDisplayed={() => { if (wird.displayed) wird.handlePlay(wird.displayed); }}
      />

      <WirdIntroSheet
        visible={introVisible}
        title={src.title}
        recordings={src.recordings}
        onClose={() => {
          setIntroDismissed(true);
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
        onSelect={(recording) => {
          setIntroDismissed(true);
          if (!recording.accessible) {
            router.push('/hospital/disease/subscription?from=intro' as never);
            return;
          }
          wird.handlePlay(recording);
        }}
        onOpenInstructions={() => {
          setIntroDismissed(true);
          router.push('/tawjihat/listening-instructions' as never);
        }}
      />
    </Screen>
  );
}
