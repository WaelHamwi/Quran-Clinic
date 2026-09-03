import { Dimensions, StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

const { height: wh } = Dimensions.get('window');

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    // Modal scrim — intentional fixed translucent black, not a theme surface.
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingBottom: spacing.xl,
    },
    handle: {
      width: 60,
      height: 4,
      borderRadius: 4,
      backgroundColor: theme.cardBorder,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.cardBorder,
    },
    title: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontFamily: fontFamily.alexandriaSemiBold,
      color: theme.text,
    },
    closeBtn: { padding: 6 },
    closeBtnText: { fontSize: fontSize.lg, color: theme.textMuted, lineHeight: 22 },

    searchWrap: {
      paddingHorizontal: spacing.lg,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.cardBorder,
    },
    searchInput: {
      height: 40,
      backgroundColor: theme.card,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: spacing.lg,
      fontSize: fontSize.sm,
      fontFamily: fontFamily.alexandriaLight,
      color: theme.text,
    },

    list: { maxHeight: Math.round(wh * 0.45) },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.cardBorder,
    },
    rowActive: { backgroundColor: theme.brandSubtle },
    rowContent: { flex: 1 },
    rowName: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontFamily: fontFamily.alexandriaMedium,
      color: theme.text,
    },
    rowNameActive: {
      color: theme.primary,
      fontFamily: fontFamily.alexandriaBold,
    },
    rowNameAr: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      fontFamily: fontFamily.alexandria,
      marginTop: 2,
    },
    check: { fontSize: fontSize.lg, color: theme.primary, marginLeft: 10 },
    noneName: {
      fontSize: fontSize.sm,
      color: theme.textMuted,
      fontFamily: fontFamily.alexandria,
      fontStyle: 'italic',
    },
  });
