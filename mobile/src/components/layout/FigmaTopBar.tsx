import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandLogoLeft from '@/assets/figma/brand-logo-left.svg';
import BrandLogoRight from '@/assets/figma/brand-logo-right.svg';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './FigmaTopBar.styles';

interface FigmaTopBarProps {
  /** When provided, renders a centred Alexandria 16/24 title (e.g. "تسجيل الدخول"). */
  title?: string;
  /** When true, renders the 93×13 "المشفى القرآني" bicoloured SVG logo. */
  showBrandLogo?: boolean;
}

/** Figma "Status & Nav bar" — node 18481-2823.
 *  Owns the status-bar area via useSafeAreaInsets so it must be placed
 *  OUTSIDE any SafeAreaView (the caller drops the 'top' edge). */
export function FigmaTopBar({ title, showBrandLogo }: FigmaTopBarProps) {
  const { top } = useSafeAreaInsets();
  const { isArabic } = useLanguage();
  const styles = useStyles(createStyles);

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
