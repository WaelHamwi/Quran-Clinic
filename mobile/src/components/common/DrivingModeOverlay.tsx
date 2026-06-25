import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DriveCar from '@/assets/figma/drive-car.svg';
import DriveStop from '@/assets/figma/drive-stop.svg';
import DriveResume from '@/assets/figma/drive-resume.svg';
import DriveStopBtn from '@/assets/figma/drive-stop-btn.svg';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { useLanguage } from '@/context/LanguageContext';
import { palette, type Theme } from '@/theme/colors';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

interface DrivingModeOverlayProps {
  visible: boolean;
  onContinueAnyway: () => void;
  onStop: () => void;
}

/** Driving Mode overlay — Figma node 18171:2212.
 *  Spec from get_design_context:
 *   - Patterned bg (same as Login/Onboarding gradient + pattern)
 *   - White content card (rest of screen) px-16 py-20
 *   - Top: 80×80 car icon in white p-20 rounded-60 circle + "وضع القيادة" 20 SemiBold
 *   - Middle: 70×70 disabled-play icon in #fef3f2 p-20 rounded-160 circle + body + focus copy
 *   - Bottom: 2 stacked pill buttons (48h, radius 999):
 *     - "المتابعة على أي حال": white bg, #d5d7da border, #414651 text
 *     - "إيقاف التشغيل": brand-500 bg, white text */
export function DrivingModeOverlay({
  visible,
  onContinueAnyway,
  onStop,
}: DrivingModeOverlayProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinueAnyway}>
      <View style={styles.root}>
        <PatternedBackground />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.card}>
            <View style={styles.inner}>
              <View style={styles.topGroup}>
                {/* Title block */}
                <View style={styles.titleBlock}>
                  <View style={styles.carBubble}>
                    <View style={styles.carIcon}>
                      <DriveCar width="100%" height="100%" />
                    </View>
                  </View>
                  <Text style={styles.title}>{t.drivingMode.title}</Text>
                </View>

                {/* Status block */}
                <View style={styles.statusBlock}>
                  <View style={styles.stopBubble}>
                    <View style={styles.stopIcon}>
                      <DriveStop width="100%" height="100%" />
                    </View>
                  </View>
                  <Text style={styles.body}>{t.drivingMode.body}</Text>
                  <Text style={styles.focus}>{t.drivingMode.focus}</Text>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttons}>
                <Pressable
                  onPress={onContinueAnyway}
                  style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryText}>{t.drivingMode.continueAnyway}</Text>
                  <View style={styles.btnIcon}>
                    <DriveResume width="100%" height="100%" />
                  </View>
                </Pressable>
                <Pressable
                  onPress={onStop}
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.primaryText}>{t.drivingMode.stop}</Text>
                  <View style={styles.btnIcon}>
                    <DriveStopBtn width="100%" height="100%" />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function createStyles(_theme: Theme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: palette.bg.primary },
    safe: { flex: 1 },
    card: { flex: 1, backgroundColor: palette.bg.primary, paddingHorizontal: 16, paddingVertical: 20 },
    inner: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    topGroup: { gap: 115, alignItems: 'center' },

    titleBlock: { alignItems: 'center' },
    carBubble: { padding: 20, borderRadius: 60 },
    carIcon: { width: 80, height: 80 },
    title: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: 20,
      lineHeight: lineHeight.md,
      color: palette.text.primary,
      textAlign: 'center',
    },

    statusBlock: { alignItems: 'center', gap: 20, paddingHorizontal: 10 },
    stopBubble: {
      backgroundColor: palette.system.error[50],
      padding: 20,
      borderRadius: 160,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stopIcon: { width: 70, height: 70 },
    body: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: palette.text.primary,
      textAlign: 'center',
    },
    focus: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: palette.text.primary,
      textAlign: 'center',
    },

    buttons: { gap: 12 },
    secondaryBtn: {
      backgroundColor: palette.bg.primary,
      borderWidth: 1,
      borderColor: palette.border.primary,
      borderRadius: radius.pill,
      height: 48,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    primaryBtn: {
      backgroundColor: palette.brand[500],
      borderRadius: radius.pill,
      height: 48,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    pressed: { opacity: 0.85 },
    secondaryText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: palette.text.secondary,
      textAlign: 'center',
    },
    primaryText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: palette.fg.white,
      textAlign: 'center',
    },
    btnIcon: { width: 20, height: 20 },
  });
}
