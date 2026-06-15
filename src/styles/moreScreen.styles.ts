import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const BANNER_CLOSE_COLOR = palette.white;
export const BANNER_ICON_COLOR = palette.white;

export const moreScreenStyles = StyleSheet.create({
  moreScreen__content: { padding: 16, gap: 16, paddingBottom: 96 },

  moreScreen__profileCard: {
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreScreen__profileName: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'center',
  },
  moreScreen__profileEmail: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
    textAlign: 'center',
  },

  moreScreen__banner: {
    backgroundColor: palette.secondaryGreen[600],
    borderRadius: 16,
    overflow: 'hidden',
  },
  moreScreen__bannerHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  moreScreen__bannerCloseBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreScreen__bannerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreScreen__bannerIconWrap: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreScreen__bannerTexts: {
    flex: 1,
    gap: 8,
    alignItems: 'flex-end',
  },
  moreScreen__bannerTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.white,
    textAlign: 'right',
  },
  moreScreen__bannerRowRtl: { flexDirection: 'row-reverse' },
  moreScreen__bannerHeaderRtl: { flexDirection: 'row-reverse' },
  moreScreen__bannerSub: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.white,
    textAlign: 'right',
  },
  moreScreen__bannerCta: {
    backgroundColor: palette.white,
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  moreScreen__bannerCtaText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 12,
    lineHeight: 18,
    color: palette.secondaryGreen[600],
    textAlign: 'center',
  },

  moreScreen__sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.text.primary,
    textAlign: 'right',
  },

  moreScreen__group: {
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    paddingHorizontal: 12,
  },

  moreScreen__separator: {
    height: 1,
    backgroundColor: palette.border.secondary,
  },

  moreScreen__footer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  moreScreen__appName: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.text.primary,
    textAlign: 'center',
  },
  moreScreen__versionText: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: fontFamily.alexandriaLight,
    color: palette.text.tertiary,
    textAlign: 'center',
  },

  moreScreen__modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  moreScreen__modalCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreScreen__modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.system.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  moreScreen__modalTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    color: palette.text.primary,
    textAlign: 'center',
  },
  moreScreen__modalBody: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  moreScreen__modalBtnDanger: {
    width: '100%',
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.system.error[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreScreen__modalBtnDisabled: { opacity: 0.6 },
  moreScreen__modalBtnDangerText: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.white,
  },
  moreScreen__modalBtnCancel: {
    width: '100%',
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreScreen__modalBtnCancelText: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
  },
});
