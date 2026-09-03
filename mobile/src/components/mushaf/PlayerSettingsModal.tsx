import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createReaderStyles } from '@/styles/reader.styles';
import { palette } from '@/theme/colors';
import type { PlaybackEndMode } from '@/context/MushafAudioContext';
import type { Recitation } from '@/types/recitation';

const END_MODES: PlaybackEndMode[] = ['next', 'repeat', 'stop'];
//dsadasda
type Props = {
  visible: boolean;
  onClose: () => void;
  currentRecitation: Recitation | undefined;
  onOpenReciterPicker: () => void;
  isCached: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: () => void;
  /** Omit entirely for a reader with no separate translation text (the
   *  Madani/QCF4 reader renders Arabic glyphs only) — the row is hidden. */
  showEnglish?: boolean;
  setShowEnglish?: React.Dispatch<React.SetStateAction<boolean>>;
  endMode: PlaybackEndMode;
  onSetEndMode: (m: PlaybackEndMode) => void;
};

/** Sheet for the player controls moved out of the (now minimal) bottom
 *  player: reciter choice and offline save. Opened from the header's settings
 *  button so the page only shows the play button + scrub line. */
export function PlayerSettingsModal({
  visible,
  onClose,
  currentRecitation,
  onOpenReciterPicker,
  isCached,
  isDownloading,
  downloadProgress,
  onDownload,
  showEnglish,
  setShowEnglish,
  endMode,
  onSetEndMode,
}: Props) {
  const { t, language, isArabic } = useLanguage();
  const styles = useStyles(createReaderStyles);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.bookmarkOverlay} onPress={onClose}>
        <Pressable style={styles.bookmarkSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.bookmarkSheetHandle} />
          <Text style={styles.bookmarkSheetTitle}>{t.reader.playerSettings}</Text>

          <TouchableOpacity
            style={[styles.settingsRow, isArabic && styles.rowRtl]}
            onPress={() => {
              onClose();
              onOpenReciterPicker();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsRowLabel}>{t.reader.reciter}</Text>
            <View style={[styles.settingsRowValue, isArabic && styles.rowRtl]}>
              <Text style={styles.settingsRowValueText} numberOfLines={1}>
                {currentRecitation?.reciter?.name?.[language] ?? '—'}
              </Text>
              <Ionicons
                name={isArabic ? 'chevron-back' : 'chevron-forward'}
                size={16}
                color={palette.mushaf.titleBorderGold}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.bookmarkDivider} />

          <View style={[styles.settingsRow, isArabic && styles.rowRtl]}>
            <Text style={styles.settingsRowLabel}>{t.reader.saveOffline}</Text>
            {isCached ? (
              <View style={styles.cachedBadge}>
                <Text style={styles.cachedText}>{t.reader.saved}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={onDownload}
                disabled={isDownloading || !currentRecitation}
              >
                <Text style={styles.downloadText}>
                  {isDownloading ? `${Math.round(downloadProgress * 100)}%` : t.reader.save}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {setShowEnglish && (
            <>
              <View style={styles.bookmarkDivider} />
              <View style={[styles.settingsRow, isArabic && styles.rowRtl]}>
                <Text style={styles.settingsRowLabel}>{t.reader.translation}</Text>
                <TouchableOpacity
                  style={[styles.langToggle, showEnglish && styles.langToggleActive]}
                  onPress={() => setShowEnglish((v) => !v)}
                >
                  <Text style={[styles.langToggleText, showEnglish && styles.langToggleTextActive]}>
                    {showEnglish ? 'EN' : 'AR'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.bookmarkDivider} />

          <Text style={styles.settingsSectionLabel}>{t.reader.onSurahEnd}</Text>
          <View style={styles.settingsSpeedRow}>
            {END_MODES.map((mode) => {
              const active = endMode === mode;
              const label =
                mode === 'next' ? t.reader.endNext : mode === 'repeat' ? t.reader.endRepeat : t.reader.endStop;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.settingsSpeedChip, active && styles.settingsSpeedChipActive]}
                  onPress={() => onSetEndMode(mode)}
                >
                  <Text
                    style={[styles.settingsSpeedChipText, active && styles.settingsSpeedChipTextActive]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
