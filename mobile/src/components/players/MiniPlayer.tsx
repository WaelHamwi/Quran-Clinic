import React, { useRef } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { useAppSelector } from '@/store/hooks';
import { selectMiniPlayerVisible, selectPlaybackOrigin } from '@/store/slices/playerSlice';
import { hitSlop } from '@/theme/spacing';
import { usePlayer } from '@/hooks/player/usePlayer';
import { useGeneralRuqyah } from '@/hooks/player/useGeneralRuqyah';
import { recordingTypeOf } from '@/utils/recordings';
import { createStyles } from './MiniPlayer.styles';

/** Floating playback bar pinned above the tab bar while ruqyah audio plays. */
function MiniPlayerBase() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useStyles(createStyles);
  const visible = useAppSelector(selectMiniPlayerVisible);
  const originRoute = useAppSelector(selectPlaybackOrigin);
  const { currentRecording, isPlaying, isLoading, position, duration, togglePlay, stop, seekTo } =
    usePlayer();
  const { playNext, playPrevious, hasPrevious, hasNext, isGeneralMode } = useGeneralRuqyah();

  // ── Seekable progress bar ─────────────────────────────────────────────────
  const barWidthRef = useRef(0);
  const durationRef = useRef(duration);
  const seekToRef = useRef(seekTo);
  /* eslint-disable react-hooks/refs -- always-fresh refs read by the PanResponder handlers below, created once via useRef so they see the latest values without recreating the responder every render */
  durationRef.current = duration;
  seekToRef.current = seekTo;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const w = barWidthRef.current;
        const dur = durationRef.current;
        if (w > 0 && dur > 0) {
          seekToRef.current(Math.max(0, Math.min(1, e.nativeEvent.locationX / w)) * dur);
        }
      },
      onPanResponderMove: (e) => {
        const w = barWidthRef.current;
        const dur = durationRef.current;
        if (w > 0 && dur > 0) {
          seekToRef.current(Math.max(0, Math.min(1, e.nativeEvent.locationX / w)) * dur);
        }
      },
      onPanResponderRelease: (e) => {
        const w = barWidthRef.current;
        const dur = durationRef.current;
        if (w > 0 && dur > 0) {
          seekToRef.current(Math.max(0, Math.min(1, e.nativeEvent.locationX / w)) * dur);
        }
      },
    }),
  ).current;
  /* eslint-enable react-hooks/refs */
  // ─────────────────────────────────────────────────────────────────────────

  // General ruqyah is driven entirely by its toggle button — no bottom bar for it.
  // The favorites queue (a different queue kind) keeps its bar with skip controls.
  if (!visible || !currentRecording || isGeneralMode) return null;

  const progress = duration > 0 ? position / duration : 0;
  // Skip controls appear whenever a multi-track queue (favorites) is playing.
  const canSkip = hasPrevious || hasNext;

  return (
    <View style={styles.container}>
      {/* Seekable progress track — taller hit area so finger can land on it */}
      <View
        style={styles.progressWrap}
        onLayout={(e) => { barWidthRef.current = e.nativeEvent.layout.width; }}
        // eslint-disable-next-line react-hooks/refs -- reading the stable, once-created PanResponder's handlers during render is the standard idiom
        {...panResponder.panHandlers}
      >
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="musical-notes" size={18} color={theme.primary} />
        <Pressable
          style={styles.texts}
          disabled={!originRoute}
          // navigate, not push: tapping twice returns to the wird screen already
          // on the stack instead of stacking a second copy of it.
          onPress={() => { if (originRoute) router.navigate(originRoute as never); }}
        >
          <Text style={styles.title} numberOfLines={1}>
            {recordingTypeOf(currentRecording) === 'detailed'
              ? t.disease.typeDetailed
              : t.disease.typeSummarized}
          </Text>
          <Text style={styles.label}>{t.player.nowPlaying}</Text>
        </Pressable>

        {/* Prev / next skip buttons — visible while a favorites queue is playing */}
        {canSkip && (
          <Pressable onPress={playPrevious} hitSlop={hitSlop} disabled={!hasPrevious}>
            <Ionicons
              name="play-skip-back"
              size={22}
              color={hasPrevious ? theme.text : theme.border}
            />
          </Pressable>
        )}

        <Pressable onPress={togglePlay} hitSlop={hitSlop}>
          <Ionicons
            name={isLoading ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
            size={24}
            color={theme.text}
          />
        </Pressable>

        {canSkip && (
          <Pressable onPress={playNext} hitSlop={hitSlop} disabled={!hasNext}>
            <Ionicons
              name="play-skip-forward"
              size={22}
              color={hasNext ? theme.text : theme.border}
            />
          </Pressable>
        )}

        <Pressable onPress={stop} hitSlop={hitSlop}>
          <Ionicons name="close" size={22} color={theme.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

export const MiniPlayer = React.memo(MiniPlayerBase);
