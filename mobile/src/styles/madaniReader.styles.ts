import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { palette } from '@/theme/colors';

// Shares the classic reader's fixed parchment canvas (palette.bg.mushaf) —
// same documented light/dark exception as reader.styles.ts.
export function createMadaniReaderStyles(_theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    contentWrapper: {
      flex: 1,
      backgroundColor: palette.bg.mushaf,
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 16,
    },
    readerFrame: {
      flex: 1,
      margin: 2,
      marginTop: 4,
      marginBottom: 2,
    },
  });
}
