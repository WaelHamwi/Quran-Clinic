import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    // Modal scrim — intentional fixed translucent black, not a theme surface.
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },

    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      maxHeight: '80%',
      paddingBottom: 0,
    },

    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    headerTitle: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
    },

    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.fieldBg,
      alignItems: 'center',
      justifyContent: 'center',
    },

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
      height: 40,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.fieldBg,
      paddingHorizontal: spacing.md,
    },

    searchInput: {
      flex: 1,
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      padding: 0,
    },

    list: {
      paddingBottom: 32,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    rowSelected: {
      backgroundColor: theme.brandSubtle,
    },

    rowName: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      flex: 1,
    },

    rowNameSelected: {
      color: theme.primary,
      fontFamily: fontFamily.alexandria,
    },

    checkIcon: {
      marginLeft: spacing.xs,
    },

    empty: {
      textAlign: 'center',
      paddingVertical: spacing.xl,
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      color: theme.textMuted,
    },
  });
