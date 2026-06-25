import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

export const SWITCH_TRACK_OFF = palette.border.primary;
export const SWITCH_TRACK_ON = palette.accents.green;
export const ICON_BRAND = palette.brand[500];
export const INPUT_PLACEHOLDER = palette.text.placeholder;

export const notificationsScreenStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    // paddingBottom is set inline = 40 + keyboard height, so the time fields can
    // scroll clear of the on-screen keyboard (Android edge-to-edge ignores resize).
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'right',
  },
  // Generic white card group (matches More page groups + Figma section cards).
  group: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    paddingHorizontal: 12,
  },
  separator: {
    height: 1,
    backgroundColor: palette.border.secondary,
  },

  // ── Smart waking card (Figma 18524:2887) ───────────────────────
  smartCard: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    padding: 12,
    gap: 14,
  },
  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  smartTexts: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-end',
  },
  smartTitle: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'right',
  },
  smartSubtitle: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 10,
    lineHeight: 16,
    color: palette.text.tertiary,
    textAlign: 'right',
  },

  // ── Manual / Automatic mode selector ───────────────────────────
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border.primary,
    backgroundColor: palette.white,
  },
  modePillActive: {
    backgroundColor: palette.brand[500],
    borderColor: palette.brand[500],
  },
  modePillText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
  },
  modePillTextActive: {
    color: palette.text.onBrand,
    fontFamily: fontFamily.alexandriaSemiBold,
  },

  // ── Time fields (Figma RTL Input Field/Text) ───────────────────
  timesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timeField: {
    flex: 1,
    gap: 6,
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'right',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    width: '100%',
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    backgroundColor: palette.white,
  },
  timeInputDisabled: {
    backgroundColor: palette.bg.disabled,
  },
  timeInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeInputText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
  },
  // Editable variant: strip the TextInput's native padding and give the digits
  // a stable width so the field doesn't jump while typing.
  timeInputEditable: {
    minWidth: 48,
    padding: 0,
    textAlign: 'center',
  },
  stepBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  autoHint: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 10,
    lineHeight: 16,
    color: palette.text.tertiary,
    textAlign: 'right',
  },
  permissionHint: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
    textAlign: 'center',
  },

  // ── Diagnostics test button ────────────────────────────────────
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
  },
  testButtonText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.onBrand,
  },
});
