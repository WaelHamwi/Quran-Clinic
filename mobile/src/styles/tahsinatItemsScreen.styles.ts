import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

export const tahsinatItemsScreenStyles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 24,
    gap: 20,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    flex: 1,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  labelText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: palette.brand[500],
    textAlign: 'center',
  },
  arabicText: {
    fontFamily: fontFamily.arabic,
    fontSize: 22,
    lineHeight: 40,
    color: palette.text.primary,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  hintText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 13,
    lineHeight: 20,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  bottomPanel: {
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.border.secondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 16,
    color: palette.text.tertiary,
  },
  // Next + Previous buttons sit side by side, gap 12 — mirrors Adhkar.
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.brand[25],
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtnText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 24,
    color: palette.brand[500],
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
});
