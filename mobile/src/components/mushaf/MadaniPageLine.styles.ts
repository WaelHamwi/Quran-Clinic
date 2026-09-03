import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { palette } from '@/theme/colors';

// palette.mushaf.ink — fixed parchment-page ink, same documented exception
// as the classic reader's preserved surface (reader.styles.ts).
export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    slot: {
      justifyContent: 'center',
    },
    line: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lineJustified: {
      alignSelf: 'stretch',
      justifyContent: 'space-between',
    },
    lineCentered: {
      alignSelf: 'center',
    },
    text: {
      color: palette.mushaf.ink,
      includeFontPadding: false,
    },
    // Surah-title line — same gold used by the reader's toolbar/medallion
    // accents, so the title reads as its own clear heading against the
    // verse text above/below without a background band.
    surahHeaderText: {
      color: palette.mushaf.surahName,
    },
    // Active-verse word color during playback — same gold used for the
    // classic reader's active-verse text (palette.mushaf.accent).
    wordActive: {
      color: palette.mushaf.accent,
    },
  });
