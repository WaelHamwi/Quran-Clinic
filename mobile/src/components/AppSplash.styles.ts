import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const appSplashStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },

  // ── Language picker button ────────────────────────────────────────────────
  langPicker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border.primary,
    borderRadius: 70,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 5,
  },
  langPickerPressed: { opacity: 0.75 },
  langText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
  },

  // ── Dropdown backdrop — full-screen, closes menu on tap ──────────────────
  langMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },

  // ── Dropdown card ─────────────────────────────────────────────────────────
  langMenu: {
    position: 'absolute',
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    minWidth: 148,
    zIndex: 20,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  langOptionActive: {
    backgroundColor: palette.brand[25],
  },
  langOptionText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
  },
  langOptionTextActive: {
    color: palette.brand[500],
  },
  langOptionDivider: {
    height: 1,
    backgroundColor: palette.border.tertiary,
    marginHorizontal: 12,
  },

  // ── Center content — logo block + subtitle ────────────────────────────────
  content: {
    alignItems: 'center',
  },

  // 240×320 logo container with 3 absolutely-positioned SVGs inside
  logoBlock: {
    width: 240,
    height: 320,
    marginBottom: -10,
  },
  logoTopWrap: {
    position: 'absolute',
    top: 51,
    left: 61,
    right: 60,
    bottom: 142,
  },
  logoMidWrap: {
    position: 'absolute',
    top: 197,
    left: 56,
    right: 57,
    bottom: 98,
  },
  logoBottomWrap: {
    position: 'absolute',
    top: 233,
    left: 57,
    right: 57,
    bottom: 51,
  },

  title: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 18,
    lineHeight: 28,
    color: palette.brand[500],
    textAlign: 'center',
  },

  // ── CTA button — absolute bottom ─────────────────────────────────────────
  cta: {
    position: 'absolute',
    bottom: 40,
    width: 330,
    height: 40,
    borderRadius: 999,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.white,
    textAlign: 'center',
  },
});
