import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './PatternedBackground.styles';

/** Figma-shared background — a vertical brand gradient + a tiled pattern PNG at 3%
 *  opacity. Used by Login, Onboarding, and any "branded" surface that needs the
 *  Quranic-Clinic patterned canvas. The gradient stops are theme-driven
 *  (`theme.backgroundGradient`): a soft mint→cream wash in light mode, a deep
 *  teal→ink gradient in dark mode so screens have depth instead of a flat wash. */
export function PatternedBackground() {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <>
      <LinearGradient
        colors={theme.backgroundGradient}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={require('../../../assets/figma/login-pattern.png')}
          style={styles.pattern}
          resizeMode="repeat"
        />
      </View>
    </>
  );
}
