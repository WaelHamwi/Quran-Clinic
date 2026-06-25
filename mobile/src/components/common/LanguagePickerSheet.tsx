import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { palette, type Theme } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

interface LanguagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Language picker bottom sheet — Figma node 18272:3745.
 *  - Sheet: bg white, top-border #e9eaeb, radius-top 24, pb-70, gap-16
 *  - Header: 16 padding, 60×4 gray/200 handle pill
 *  - Title: "لغة التطبيق" Alexandria Medium 16/24 #181d27 centered
 *  - Each option: white bg, border #d5d7da, p-12, radius 12, justify-between
 *    - Radio (24×24) on left, text + flag (32×24) on right
 *    - Text: Alexandria Light 14/20 #181d27 */
export function LanguagePickerSheet({ visible, onClose }: LanguagePickerSheetProps) {
  const { theme } = useTheme();
  const { language, isArabic, toggleLanguage } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const choose = (lang: 'ar' | 'en') => {
    if (lang !== language) toggleLanguage();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.handle} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>
              {isArabic ? 'لغة التطبيق' : 'App Language'}
            </Text>
            <View style={styles.options}>
              <Pressable style={styles.option} onPress={() => choose('ar')}>
                <View
                  style={[styles.radio, isArabic && styles.radioActive]}
                >
                  {isArabic ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.optRight}>
                  <Text style={styles.optText}>العربية</Text>
                  <View style={styles.flag}>
                    <View style={styles.flagSa}>
                      <Text style={styles.flagSaText}>SA</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
              <Pressable style={styles.option} onPress={() => choose('en')}>
                <View
                  style={[styles.radio, !isArabic && styles.radioActive]}
                >
                  {!isArabic ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.optRight}>
                  <Text style={styles.optText}>English</Text>
                  <View style={styles.flag}>
                    <View style={styles.flagGb}>
                      <Text style={styles.flagGbText}>GB</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(_theme: Theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: palette.bg.primary,
      borderTopWidth: 1,
      borderTopColor: palette.border.secondary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 70,
      gap: 16,
    },
    header: { padding: 16, alignItems: 'center' },
    handle: { width: 60, height: 4, borderRadius: 24, backgroundColor: palette.gray[200] },
    body: { paddingHorizontal: 16, gap: 16, alignItems: 'stretch' },
    title: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: palette.text.primary,
      textAlign: 'center',
    },
    options: { gap: 16, alignItems: 'stretch' },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.bg.primary,
      borderWidth: 1,
      borderColor: palette.border.primary,
      borderRadius: 12,
      padding: 12,
    },
    // Radio: 24×24, brand[500] ring when selected
    radio: {
      width: 24,
      height: 24,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: palette.border.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: { borderColor: palette.brand[500] },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: radius.pill,
      backgroundColor: palette.brand[500],
    },

    optRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    optText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: palette.text.primary,
      textAlign: 'right',
    },
    // Flag pill — 32w × 24h (Figma uses real SVG flags)
    flag: { width: 32, height: 24, overflow: 'hidden', borderRadius: 4 },
    flagSa: {
      width: 32,
      height: 24,
      backgroundColor: '#559e1c',
      alignItems: 'center',
      justifyContent: 'center',
    },
    flagSaText: { color: '#ffffff', fontSize: 8, fontFamily: fontFamily.alexandriaBold },
    flagGb: {
      width: 32,
      height: 24,
      backgroundColor: '#012169',
      alignItems: 'center',
      justifyContent: 'center',
    },
    flagGbText: { color: '#ffffff', fontSize: 8, fontFamily: fontFamily.alexandriaBold },
  });
}
