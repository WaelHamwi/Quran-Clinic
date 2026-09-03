import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';
import { QCF4_PAGE_FOOTER_HEIGHT, QCF4_PAGE_H_PADDING, QCF4_PAGE_TOP_PADDING } from '@/constants/qcf4';

// palette.mushaf.* refs — fixed parchment surface exception (see reader.styles.ts).
export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    page: {
      flex: 1,
      paddingHorizontal: QCF4_PAGE_H_PADDING / 2,
      paddingTop: QCF4_PAGE_TOP_PADDING,
    },
    linesFull: {
      flex: 1,
    },
    footer: {
      height: QCF4_PAGE_FOOTER_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerText: {
      fontSize: fontSize.xs,
      color: palette.mushaf.verseNumber,
      fontFamily: fontFamily.alexandriaBold,
      letterSpacing: 0.6,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    errorText: {
      fontSize: fontSize.sm,
      color: palette.text.tertiary,
      fontFamily: fontFamily.alexandria,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    retryBtn: {
      backgroundColor: palette.mushaf.bannerFill,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 999,
    },
    retryBtnText: {
      fontSize: fontSize.xs,
      color: palette.mushaf.verseNumber,
      fontFamily: fontFamily.alexandriaBold,
    },
  });
