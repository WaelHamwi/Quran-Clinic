import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

// Warm yellow at 30% opacity — readable on both light and dark reading surfaces.
const KARAOKE_HIGHLIGHT = 'rgba(255,214,0,0.30)';

/**
 * Amiri stacks harakat far above the baseline, so the Latin ratio clips them into
 * the line above. 1.85 matches what the Mushaf reader uses for the same font.
 */
export const lineHeightRatio = (isArabic: boolean) => (isArabic ? 1.85 : 1.625);

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
    },
    segmentWrap: {
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    'segmentWrap--active': {
      backgroundColor: KARAOKE_HIGHLIGHT,
    },
    segment: {
      fontFamily: fontFamily.alexandria,
      fontSize: 16,
      lineHeight: 26,
      color: theme.textMuted,
      textAlign: 'center',
    },
    // No colour here: the active line keeps the reader's chosen (contrast-checked)
    // text colour — `theme.text` would be dark-on-dark whenever the reading card
    // is dark while the app theme is light.
    'segment--active': {
      fontFamily: fontFamily.alexandriaSemiBold,
    },
    // Alexandria has no glyphs for the Quranic marks the ruqyah text is authored
    // with (superscript alef, wasla, the doubled-harakat stacks), so those
    // characters silently fell back to the system face and rendered thinner than
    // the letters around them. Amiri covers the full set.
    'segment--rtl': {
      fontFamily: fontFamily.arabic,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    'segment--rtlActive': {
      fontFamily: fontFamily.arabicBold,
    },
    sessionBlock: {
      gap: spacing.lg,
    },
    sessionDivider: {
      height: StyleSheet.hairlineWidth,
      alignSelf: 'center',
      width: '55%',
      marginVertical: spacing.md,
      backgroundColor: theme.textMuted,
      opacity: 0.35,
    },
  });
