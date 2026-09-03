import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { radius, space, spacing } from '@/theme/spacing';

// Warm yellow at 30% opacity — matches the KaraokeText segment highlight.
const DESC_HIGHLIGHT = 'rgba(255,214,0,0.30)';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingTop: spacing.xl,
      gap: 20,
    },

    tabsWrap: {
      paddingHorizontal: 20,
    },
    tabGroup: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.border,
    },
    'tabGroup--rtl': {
      flexDirection: 'row-reverse',
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },
    'tab--active': {
      backgroundColor: theme.primary,
    },
    tabText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'center',
    },
    'tabText--active': {
      color: theme.textOnBrand,
    },

    sectionCard: {
      flex: 1,
      marginHorizontal: 20,
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      overflow: 'hidden',
    },
    cardScroll: {
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: spacing.xxxl,
      gap: spacing.md,
    },
    titleText: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      color: theme.text,
      textAlign: 'center',
    },
    descHighlight: {
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    'descHighlight--active': {
      backgroundColor: DESC_HIGHLIGHT,
    },
    descText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    feedbackWrap: {
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.cardBorder,
    },
    emptyText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: 22,
      color: theme.textMuted,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },

    // First-wird advisory alert — semantic warning tones kept as palette refs.
    alert: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.system.warning[25],
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: radius.sm,
      paddingHorizontal: space.md,
      paddingVertical: space.lg,
      gap: space.sm,
      marginHorizontal: 20,
    },
    alertContent: {
      flex: 1,
      gap: space.xs,
    },
    alertTitle: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: palette.system.warning[900],
    },
    alertBody: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: palette.system.warning[800],
    },
  });
