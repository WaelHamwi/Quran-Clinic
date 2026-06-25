import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const PLAY_ICON_COLOR = palette.text.onBrand;
export const LOCKED_ICON_COLOR = palette.gray[400];

export const recordingCardStyles = StyleSheet.create({
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  },
  'recordingCard--active': {
    backgroundColor: palette.brand[25],
    borderColor: palette.brand[100],
  },
  recordingCard__playBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  'recordingCard__playBtn--active': {
    backgroundColor: palette.brand[600],
  },
  recordingCard__texts: { flex: 1, gap: 3, alignItems: 'flex-end' },
  recordingCard__title: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
    textAlign: 'right',
  },
  'recordingCard__title--active': {
    color: palette.brand[700],
  },
  recordingCard__metaRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
  },
  recordingCard__meta: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
  },
});
