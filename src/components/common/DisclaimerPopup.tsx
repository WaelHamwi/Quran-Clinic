import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import WarningEllipse from '@/assets/figma/warning-ellipse.svg';
import WarningIcon from '@/assets/figma/warning-icon.svg';
import TickButtonIcon from '@/assets/figma/tick-button.svg';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { palette, type Theme } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

interface DisclaimerPopupProps {
  visible: boolean;
  onAccept: () => void;
}

/** Disclaimer popup — Figma node 17941:728.
 *  Spec from get_design_context (pixel-perfect):
 *   - Card: white bg, radius-top 24, shadow-lg, pt-12 pb-36 px-24, gap-24
 *   - Handle: 100×4 gray/200 pill (radius sm)
 *   - 160×160 illustration: warning ellipse + filled-warning glyph
 *   - Title: Alexandria Madani 20/30 #469b34 (secondaryGreen[600])
 *   - Body: Alexandria Light 14/20 #181d27 right-aligned
 *   - CTA: RTL Button — brand[500] pill, 40h full-width, "قرأت وأوافق" + tick. */
export function DisclaimerPopup({ visible, onAccept }: DisclaimerPopupProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onAccept}>
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <View style={styles.card}>
          <View style={styles.handle} />
          <View style={styles.content}>
            <View style={styles.illustration}>
              <View style={StyleSheet.absoluteFill}>
                <WarningEllipse width="100%" height="100%" />
              </View>
              <View style={styles.illoIcon}>
                <WarningIcon width="100%" height="100%" />
              </View>
            </View>
            <Text style={styles.title}>{t.disclaimer.title}</Text>
            <Text style={styles.body}>{t.disclaimer.body}</Text>
          </View>
          <Pressable
            onPress={onAccept}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText}>{t.disclaimer.accept}</Text>
            <View style={styles.ctaIcon}>
              <TickButtonIcon width={14} height={10} />
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(_theme: Theme) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    // Card: bg white, radius-top 24, shadow lg, pt-12 pb-36 px-24, gap-24
    card: {
      backgroundColor: palette.bg.primary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: 36,
      paddingHorizontal: 24,
      gap: 24,
      alignItems: 'center',
      shadowColor: '#313940',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 8,
    },
    // Handle: 100×4 gray/200 pill
    handle: {
      width: 100,
      height: 4,
      borderRadius: radius.sm,
      backgroundColor: palette.gray[200],
    },
    content: { width: '100%', gap: 16, alignItems: 'center' },
    // 160×160 illustration
    illustration: { width: 160, height: 160, position: 'relative' },
    illoIcon: {
      position: 'absolute',
      top: '20%',
      left: '20%',
      right: '20%',
      bottom: '20%',
    },
    title: {
      fontFamily: fontFamily.madani,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      color: palette.secondaryGreen[600],
      textAlign: 'center',
    },
    body: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: palette.text.primary,
      textAlign: 'right',
      width: '100%',
    },
    // RTL Button — brand[500], pill, 40h, w-full, gap-4, px-12 py-8
    cta: {
      width: '100%',
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: palette.brand[500],
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    pressed: { opacity: 0.85 },
    ctaText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: palette.fg.white,
      textAlign: 'center',
    },
    ctaIcon: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  });
}
