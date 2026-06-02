import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { selectMiniPlayerVisible } from '@/store/slices/playerSlice';
import type { Theme } from '@/theme/colors';
import { spacing, hitSlop } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { pickText } from '@/utils/formatters';
import { usePlayer } from '@/hooks/usePlayer';
import { useGeneralRuqyah } from '@/hooks/useGeneralRuqyah';

/** Floating playback bar pinned above the tab bar while ruqyah audio plays. */
function MiniPlayerBase() {
  const { theme } = useTheme();
  const { isArabic, t } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const visible = useAppSelector(selectMiniPlayerVisible);
  const { currentRecording, isPlaying, isLoading, position, duration, togglePlay, stop } =
    usePlayer();
  const { playNext, playPrevious, hasPrevious, hasNext, isGeneralMode } = useGeneralRuqyah();

  if (!visible || !currentRecording) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <Ionicons name="musical-notes" size={18} color={theme.primary} />
        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={1}>
            {pickText(currentRecording.title, isArabic) ||
              t.disease.session(currentRecording.session_number)}
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
  return StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },
    progress: { height: 2, backgroundColor: theme.border },
    progressFill: { height: 2, backgroundColor: theme.primary },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    texts: { flex: 1 },
    title: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: theme.text },
    label: { fontSize: fontSize.xs, color: theme.textMuted },
  });
}

export const MiniPlayer = React.memo(MiniPlayerBase);
