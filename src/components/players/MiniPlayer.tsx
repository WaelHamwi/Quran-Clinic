import React, { useMemo, useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { selectMiniPlayerVisible } from '@/store/slices/playerSlice';
import type { Theme } from '@/theme/colors';
import { spacing, hitSlop } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { usePlayer } from '@/hooks/usePlayer';
import { useGeneralRuqyah } from '@/hooks/useGeneralRuqyah';

/** Floating playback bar pinned above the tab bar while ruqyah audio plays. */
function MiniPlayerBase() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => StyleSheet.create(createStyles(theme)), [theme]);
  const visible = useAppSelector(selectMiniPlayerVisible);
  const { currentRecording, isPlaying, isLoading, position, duration, togglePlay, stop, seekTo } =
    usePlayer();
  const { playNext, playPrevious, hasPrevious, hasNext, isGeneralMode } = useGeneralRuqyah();

  // ── Seekable progress bar ─────────────────────────────────────────────────
  const barWidthRef = useRef(0);
  const durationRef = useRef(duration);
  const seekToRef = useRef(seekTo);
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
  // ─────────────────────────────────────────────────────────────────────────

  if (!visible || !currentRecording) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      {/* Seekable progress track — taller hit area so finger can land on it */}
      <View
        style={styles.progressWrap}
        onLayout={(e) => { barWidthRef.current = e.nativeEvent.layout.width; }}
        {...panResponder.panHandlers}
      >
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="musical-notes" size={18} color={theme.primary} />
        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={1}>
            {t.disease.session(currentRecording.session_number)}
          </Text>
          <Text style={styles.label}>{t.player.nowPlaying}</Text>
        </View>

        {/* Prev / next skip buttons — only visible in general ruqyah queue mode */}
        {isGeneralMode && (
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

        {isGeneralMode && (
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

function createStyles(theme: Theme) {
  return {
    container: {
      backgroundColor: theme.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },
    // Tall touch area so the finger can comfortably land anywhere on the bar
    progressWrap: {
      height: 16,
      justifyContent: 'center' as const,
      paddingHorizontal: 0,
    },
    progressTrack: {
      height: 3,
      backgroundColor: theme.border,
      overflow: 'hidden' as const,
    },
    progressFill: {
      height: 3,
      backgroundColor: theme.primary,
    },
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    texts: { flex: 1 },
    title: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: theme.text },
    label: { fontSize: fontSize.xs, color: theme.textMuted },
  };
}

export const MiniPlayer = React.memo(MiniPlayerBase);
