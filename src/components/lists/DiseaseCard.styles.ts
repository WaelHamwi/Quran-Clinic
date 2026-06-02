import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ICON_COLOR = palette.brand[500];

export const diseaseCardStyles = StyleSheet.create({
  diseaseCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    paddingTop: 16,
    paddingHorizontal: 8,
    paddingBottom: 12,
    gap: 6,
    overflow: 'hidden',
    minHeight: 120,
  },
  'diseaseCard--pressed': { opacity: 0.85 },
  diseaseCard__iconBubble: {
    backgroundColor: palette.brand[25],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diseaseCard__name: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 13,
    lineHeight: 18,
    minHeight: 36,
    color: palette.brand[500],
    textAlign: 'center',
  },
  diseaseCard__count: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 11,
    lineHeight: 16,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
});
