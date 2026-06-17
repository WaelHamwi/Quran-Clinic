import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

export const ICON_COLOR = palette.text.primary;
export const ICON_MUTED_COLOR = palette.border.primary;
export const PLAY_ICON_COLOR = palette.text.onBrand;
export const ACTION_ICON_COLOR = palette.brand[500];

// Figma slider track fill — matches iOS UISlider minimumTrackTintColor default, not a global token
const TRACK_BG = 'rgba(120,120,120,0.2)';
// Modal scrim — not a design-system token, component-local only
const MODAL_SCRIM = 'rgba(0,0,0,0.4)';
// iOS UISwitch system colors — not design-system tokens, match iOS HIG defaults
// palette.accents.green = #34c759 (Apple system green)
export const SWITCH_ON_COLOR = palette.accents.green;
// iOS labels/tertiary at 30% — platform default for off-state track
export const SWITCH_OFF_COLOR = 'rgba(60,60,67,0.3)';

export const audioPlayerStyles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderTopColor: palette.border.secondary,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  dragHandle: {
    width: 60,
    height: 4,
    borderRadius: radius.lg,
    backgroundColor: palette.gray[200],
  },
  sliderSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sliderTouch: {
    paddingVertical: 8,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: TRACK_BG,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.brand[500],
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    fontFamily: fontFamily.alexandria,
    fontSize: 12,
    lineHeight: 16,
    color: palette.text.tertiary,
  },
  controlsSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 24,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playBtn: {
    width: 104,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    height: 44,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.brand[25],
    borderRadius: radius.md,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionLabel: {
    fontFamily: fontFamily.alexandria,
    fontSize: 12,
    lineHeight: 18,
    color: palette.brand[500],
  },

  // ── Playback settings sheet ──────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: MODAL_SCRIM,
    justifyContent: 'flex-end',
  },
  settingsSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 16,
    alignItems: 'stretch',
  },
  sheetHandle: {
    width: 60,
    height: 4,
    borderRadius: radius.lg,
    backgroundColor: palette.gray[200],
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'center',
  },
  sheetSectionLabel: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 13,
    lineHeight: 20,
    color: palette.text.tertiary,
    alignSelf: 'flex-start',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  colorSwatch: {
    alignItems: 'center',
    gap: 6,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: palette.brand[500],
    shadowColor: palette.brand[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  colorLabel: {
    fontFamily: fontFamily.alexandria,
    fontSize: 10,
    lineHeight: 14,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  colorLabelActive: {
    color: palette.brand[500],
    fontFamily: fontFamily.alexandriaMedium,
  },
  closeBtn: {
    alignSelf: 'center',
    backgroundColor: palette.brand[25],
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
  },

  // ── Settings sections ────────────────────────────────────────────────────
  settingsDivider: {
    height: 1,
    backgroundColor: palette.gray[200],
  },
  settingsToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsToggleLabel: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
  },
  settingsSectionWrap: {
    gap: 4,
  },
  settingsSectionTitle: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
    textAlign: 'right',
  },

  // ── Speed chips (Mushaf-style, light sheet) ──────────────────────────────
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  speedChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[25],
  },
  speedChipActive: {
    backgroundColor: palette.brand[500],
  },
  speedChipText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 13,
    lineHeight: 18,
    color: palette.brand[500],
  },
  speedChipTextActive: {
    color: palette.text.onBrand,
  },

  // ── Step slider ──────────────────────────────────────────────────────────
  stepSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 0,
  },
  stepSliderLabel: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.placeholder,
    textAlign: 'center',
    minWidth: 36,
  },
  stepSliderTrackWrap: {
    flex: 1,
    height: 40,
  },
  stepSliderBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 17,
    height: 6,
    borderRadius: 3,
    backgroundColor: TRACK_BG,
  },
  stepSliderFill: {
    position: 'absolute',
    left: 0,
    top: 17,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.brand[500],
  },
  stepSliderThumb: {
    position: 'absolute',
    width: 38,
    height: 24,
    borderRadius: 100,
    backgroundColor: palette.white,
    top: 8,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 4,
  },
  stepSliderTicks: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 27,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepSliderTick: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.gray[200],
  },
});
