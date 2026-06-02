import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SponsorLogo from '@/assets/figma/onb-sponsor-logo.svg';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { FigmaTopBar } from '@/components/layout/FigmaTopBar';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

/** Sponsor interstitial — Figma node 18511:2993.
 *  Auto-advances to Login after 3 seconds. */
type Props = { onDone: () => void };

const DISPLAY_MS = 3000;

export function OnboardingSponsor({ onDone }: Props) {
  useEffect(() => {
    const id = setTimeout(onDone, DISPLAY_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <View style={s.root}>
      <PatternedBackground />
      <FigmaTopBar showBrandLogo />
      <SafeAreaView style={s.safe} edges={['bottom']}>
        <View style={s.body}>
          <Text style={s.label}>هذا التطبيق برعاية كريمة من</Text>
          <View style={s.logoWrap}>
            <SponsorLogo width="100%" height="100%" />
          </View>
          <View style={s.nameBlock}>
            <Text style={s.nameAr}>مؤسسة النور الخيرية</Text>
            <Text style={s.nameEn}>AL-NOOR PHILANTHROPY</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
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
