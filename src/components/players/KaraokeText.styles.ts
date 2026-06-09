import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// Warm yellow at 30% opacity — readable on both light (white card) and dark (brand[700]) backgrounds
const KARAOKE_HIGHLIGHT = 'rgba(255,214,0,0.30)';

export const karaokeTextStyles = StyleSheet.create({
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
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  'segmentWrap--active': {
    backgroundColor: KARAOKE_HIGHLIGHT,
  },
  segment: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 26,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  'segment--active': {
    fontFamily: fontFamily.alexandriaSemiBold,
    color: palette.text.primary,
  },
  'segment--rtl': {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
