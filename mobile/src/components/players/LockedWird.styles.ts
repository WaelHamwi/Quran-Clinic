import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

export const lockedWirdStyles = StyleSheet.create({
  // Figma node 18972:3492 — section card, paddingTop 50, paddingH 30
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 30,
    paddingBottom: 30,
    justifyContent: 'space-between',
    gap: 40,
  },
  top: {
    alignItems: 'center',
    gap: 22,
  },
  iconCircle: {
    width: 102,
    height: 102,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[25],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 24,
    lineHeight: 32,
    color: palette.brand[500],
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: palette.brand[500],
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  primaryLabel: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.onBrand,
    textAlign: 'center',
  },
  secondaryBtn: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'center',
  },
});
