import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const countryPickerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: palette.white,
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
    backgroundColor: palette.border.primary,
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
    borderBottomColor: palette.border.tertiary,
  },

  headerTitle: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: palette.text.primary,
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.bg.disabled,
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
    borderColor: palette.border.primary,
    backgroundColor: palette.bg.disabled,
    paddingHorizontal: spacing.md,
  },

  searchInput: {
    flex: 1,
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.primary,
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
    borderBottomColor: palette.border.tertiary,
  },

  rowSelected: {
    backgroundColor: palette.brand[25],
  },

  rowName: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.primary,
    flex: 1,
  },

  rowNameSelected: {
    color: palette.brand[500],
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
    color: palette.text.tertiary,
  },
});
