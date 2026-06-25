import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** Figma-shared background — vertical gradient #f9fdf8(50%) → #eff9d5(50%) + tiled
 *  pattern PNG at 3% opacity. Used by Login, Onboarding, and any other "branded"
 *  surface that needs the Quranic-Clinic patterned canvas. */
export function PatternedBackground() {
  return (
    <>
      <LinearGradient
        colors={['rgba(249,253,248,0.5)', 'rgba(239,249,213,0.5)']}
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

const styles = StyleSheet.create({
  pattern: { width: '100%', height: '100%', opacity: 0.03 },
});
