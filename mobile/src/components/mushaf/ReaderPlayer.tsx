import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createReaderStyles } from '@/styles/reader.styles';
import { palette } from '@/theme/colors';
import type { Recitation } from '@/types/recitation';

type Props = {
  currentRecitation: Recitation | undefined;
  isLoadingRecitations: boolean;
  isContextReady: boolean;
  audio: { isPlaying: boolean; isLoading: boolean };
  showAudioError: boolean;
  showAudioLoadTimeout: boolean;
  onPlay: () => void;
  onRetryLoad?: () => void;
  onOpenReciterPicker: () => void;
  /** Reports the overlay's actual rendered height so the caller can size
   *  verse-list bottom padding and the bookmark FAB instead of guessing. */
  onHeightChange?: (height: number) => void;
};

/** Bottom audio control, reduced to a single play FAB in the bottom-right
 *  corner, directly under the bookmark FAB. Progress + time live in the
 *  header's seek row; reciter, speed and offline save live in
 *  `PlayerSettingsModal`, opened from the header's settings button. */
export function ReaderPlayer({
  currentRecitation,
  isLoadingRecitations,
  isContextReady,
  audio,
  showAudioError,
  showAudioLoadTimeout,
  onPlay,
  onRetryLoad,
  onOpenReciterPicker,
  onHeightChange,
}: Props) {
  const { t, isArabic } = useLanguage();
  const styles = useStyles(createReaderStyles);
  const { bottom: bottomInset, right: rightInset } = useSafeAreaInsets();

  const reportHeight = (e: LayoutChangeEvent) => onHeightChange?.(e.nativeEvent.layout.height);

  // Nothing renders while reciters are still resolving — report 0 so callers
  // don't hold onto a stale height from a previous player/banner state.
  const rendersNothing = !currentRecitation && (isLoadingRecitations || !isContextReady);
  React.useEffect(() => {
    if (rendersNothing) onHeightChange?.(0);
  }, [rendersNothing, onHeightChange]);

  if (!currentRecitation) {
    if (isLoadingRecitations || !isContextReady) return null;
    return (
      <TouchableOpacity
        style={[styles.noReciterBanner, { paddingBottom: Math.max(bottomInset, 14) }]}
        onPress={onOpenReciterPicker}
        activeOpacity={0.7}
        onLayout={reportHeight}
      >
        <View style={[styles.noReciterRow, isArabic && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="mic-outline" size={16} color={palette.mushaf.titleBorderGold} />
          <Text style={styles.noReciterText}>{t.reader.selectReciterHint}</Text>
          <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={14} color={palette.mushaf.titleBorderGold} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.playerMini,
        { paddingBottom: Math.max(bottomInset, 12), right: 16 + rightInset },
      ]}
      onLayout={reportHeight}
      pointerEvents="box-none"
    >
      {showAudioError && (
        <TouchableOpacity
          style={styles.playerErrorCompact}
          onPress={onOpenReciterPicker}
          activeOpacity={0.8}
          accessibilityLabel={t.reader.recitationUnavailable}
        >
          <Ionicons name="alert-circle-outline" size={18} color={palette.system.error[500]} />
        </TouchableOpacity>
      )}

      {showAudioLoadTimeout && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={onRetryLoad}
          disabled={audio.isLoading}
          accessibilityLabel={t.reader.retryLoading}
        >
          <Ionicons name="refresh" size={20} color={palette.mushaf.titleBorderGold} />
        </TouchableOpacity>
      )}

      {!showAudioLoadTimeout && (
        <TouchableOpacity style={styles.playButton} onPress={onPlay} disabled={audio.isLoading}>
          {audio.isLoading ? (
            <ActivityIndicator color={palette.mushaf.titleBorderGold} size="small" />
          ) : (
            <Text style={styles.playButtonText}>{audio.isPlaying ? '⏸' : '▶'}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
