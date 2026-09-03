import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { palette } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxxl,
      flexGrow: 1,
    },
    // Figma Shadows/xl: offset (0,16), radius 16, rgba(49,57,64,0.08)
    itemWrapper: {
      borderRadius: radius.md,
      backgroundColor: theme.card,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 8,
    },
    item: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      overflow: 'hidden',
    },
    itemSeparator: {
      height: spacing.sm,
    },
    sectionHeaderContainer: {
      paddingTop: 10,
      paddingBottom: spacing.sm,
      alignSelf: 'stretch',
    },
    sectionHeader: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      textAlign: 'right',
    },
    questionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      gap: spacing.sm,
    },
    questionText: {
      flex: 1,
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'right',
    },
    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginHorizontal: spacing.md,
    },
    answerContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    answerText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.lg,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    // palette.brand[25] is a constant brand accent — intentional non-theme ref (Figma node 19229:4601)
    highlightBox: {
      backgroundColor: palette.brand[25],
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    highlightText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'center',
    },
    answerBold: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.lg,
      color: theme.textSecondary,
    },
    answerVerse: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.lg,
      color: theme.primary,
    },
  });
