import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const onboardingSponsorStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.white },
  safe: { flex: 1 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    gap: 30,
  },
  label: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'right',
  },
  logoWrap: { width: 228, height: 228 },
  nameBlock: { alignItems: 'center', gap: 6 },
  nameAr: {
    fontFamily: fontFamily.madani,
    fontSize: 20,
    lineHeight: 30,
    color: palette.text.primary,
    textAlign: 'center',
  },
  nameEn: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'center',
  },
});
