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
});
