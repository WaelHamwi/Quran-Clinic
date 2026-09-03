import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    hospitalScreen__searchBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
    hospitalScreen__gridHeader: { gap: spacing.lg, paddingTop: spacing.sm },
    hospitalScreen__sectionTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      color: theme.success,
      textAlign: 'center',
      width: '100%',
    },
    'hospitalScreen__sectionTitle--rtl': {
      textAlign: 'right',
    },
  });
