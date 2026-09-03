import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { useMushafAudio } from '@/context/MushafAudioContext';
import { hitSlop } from '@/theme/spacing';
import { createStyles } from './MushafMiniPlayer.styles';

/** Floating bar above the tab bar while a Mushaf recitation keeps playing
 *  outside the reader — tap the title to jump back to the surah. */
function MushafMiniPlayerBase() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const styles = useStyles(createStyles);
  const router = useRouter();
  const audio = useMushafAudio();
  const surah = audio.playingSurah;

  if (!surah || !audio.hasSource) return null;

  const progress = audio.durationMillis > 0 ? audio.positionMillis / audio.durationMillis : 0;
  const title = language === 'ar' ? surah.name.ar : (surah.name.en ?? surah.name.ar);

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <Ionicons name="book" size={18} color={theme.primary} />
        <Pressable
          style={styles.texts}
          onPress={() => router.push(`/mushaf/${surah.id}` as never)}
        >
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.label}>{t.player.nowPlaying}</Text>
        </Pressable>
        <Pressable
          onPress={() => (audio.isPlaying ? audio.pause() : audio.play())}
          hitSlop={hitSlop}
        >
          <Ionicons
            name={audio.isLoading ? 'hourglass-outline' : audio.isPlaying ? 'pause' : 'play'}
            size={24}
            color={theme.text}
          />
        </Pressable>
        <Pressable onPress={() => audio.unload()} hitSlop={hitSlop}>
          <Ionicons name="close" size={22} color={theme.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

export const MushafMiniPlayer = React.memo(MushafMiniPlayerBase);
