import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const hospitalScreenStyles = StyleSheet.create({
  hospitalScreen__gridHeader: { gap: 16, paddingTop: 8 },
  hospitalScreen__sectionTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 18,
    lineHeight: 28,
    color: palette.secondaryGreen[600],
    textAlign: 'center',
    width: '100%',
  },
  'hospitalScreen__sectionTitle--rtl': {
    textAlign: 'right',
  },
});
