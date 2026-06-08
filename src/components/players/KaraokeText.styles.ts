import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

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
  segment: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 26,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  'segment--active': {
    fontFamily: fontFamily.alexandriaSemiBold,
    color: palette.brand[500],
  },
  'segment--rtl': {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
