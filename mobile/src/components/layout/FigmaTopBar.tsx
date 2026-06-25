import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandLogoLeft from '@/assets/figma/brand-logo-left.svg';
import BrandLogoRight from '@/assets/figma/brand-logo-right.svg';
import { useLanguage } from '@/context/LanguageContext';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

interface FigmaTopBarProps {
  /** When provided, renders a centred Alexandria 16/24 title (e.g. "تسجيل الدخول"). */
  title?: string;
  /** When true, renders the 93×13 "المشفى القرآني" bicoloured SVG logo. */
  showBrandLogo?: boolean;
}

/** Figma "Status & Nav bar" — node 18481-2823.
 *  Owns the status-bar area via useSafeAreaInsets so it must be placed
 *  OUTSIDE any SafeAreaView (the caller drops the 'top' edge).
 *
 *  Spec: bg rgba(255,255,255,0.5) · border-b #f5f5f5 · shadow-xl
 *        nav row h-44 px-16, content centred. */
export function FigmaTopBar({ title, showBrandLogo }: FigmaTopBarProps) {
  const { top } = useSafeAreaInsets();
  const { isArabic } = useLanguage();

  return (
    <View style={[styles.bar, { paddingTop: top }]}>
      <View style={styles.row}>
        <View style={styles.slot} />

        <View style={styles.center}>
          {showBrandLogo ? (
            isArabic ? (
              <View style={styles.brandLogo}>
                <View style={styles.brandLeft}>
                  <BrandLogoLeft width="100%" height="100%" />
                </View>
                <View style={styles.brandRight}>
                  <BrandLogoRight width="100%" height="100%" />
                </View>
              </View>
            ) : (
              <View style={styles.brandLogoEn}>
                <Text style={styles.brandLogoEnLeft}>Quranic </Text>
                <Text style={styles.brandLogoEnRight}>Clinic</Text>
              </View>
            )
          ) : title ? (
            <Text style={styles.title}>{title}</Text>
          ) : null}
        </View>

        <View style={styles.slot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma "Shadows/xl" as a real CSS box-shadow — renders a soft blurred drop
  // shadow on BOTH iOS and Android (New Architecture). The header blends into the
  // patterned body as one piece; this shadow is the only thing distinguishing it.
  // (Android `elevation` is intentionally NOT used — it won't cast a shadow under a
  // translucent background.)
  bar: {
    backgroundColor: palette.bg.overlay,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.tertiary,
    boxShadow: '0px 12px 16px -4px rgba(49,57,64,0.12)',
  },
  // Fixed 44 px — the standard iOS nav bar height, adapts to any device's
  // status-bar height because paddingTop is injected inline from insets.top.
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  slot: { width: 20, height: 20 },
  center: { flex: 1, alignItems: 'center' },
  title: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: palette.text.secondary,
    textAlign: 'center',
  },
  // Figma "Layer_1" — 93.412 × 12.929 bicoloured brand mark.
  brandLogo: { width: 93.412, height: 12.929, position: 'relative' },
  // Left half (green): inset 0 / 52.27% / 0 / 0
  brandLeft: {
    position: 'absolute',
    top: 0,
    right: '52.27%',
    bottom: 0,
    left: 0,
  },
  // Right half (teal): inset 6.6% / 0 / 22.07% / 52.01%
  brandRight: {
    position: 'absolute',
    top: '6.6%',
    right: 0,
    bottom: '22.07%',
    left: '52.01%',
  },
  // English fallback — two-tone text matching the SVG brand mark
  brandLogoEn: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandLogoEnLeft: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 13,
    lineHeight: 16,
    color: palette.secondaryGreen[600],
    letterSpacing: 0.2,
  },
  brandLogoEnRight: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 13,
    lineHeight: 16,
    color: palette.brand[500],
    letterSpacing: 0.2,
  },
});
