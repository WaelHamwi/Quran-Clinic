import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { palette, type Theme } from '@/theme/colors';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  /** 0..4 (5 ticks). */
  fontSizeIndex?: number;
  onFontSizeChange?: (idx: number) => void;
  /** 0..4. */
  readingSpeedIndex?: number;
  onReadingSpeedChange?: (idx: number) => void;
}

/** Settings bottom sheet — Figma node 18030:2555.
 *  Dark-mode toggle + font-size slider + reading-speed slider.
 *  - Sheet: bg white, top-border #e9eaeb, radius-top 24, pb-70, gap-20
 *  - Header handle 60×4 gray-200
 *  - Each section: gap-4 col, right-aligned label Alexandria Medium 14/20 #181d27
 *  - Switch ON: #34c759, OFF: rgba(60,60,67,0.3)
 *  - Slider track: 6h, bg rgba(120,120,120,0.2), radius 3
 *  - Slider fill: brand-500, knob white 24h × 38w shadow */
export function SettingsSheet({
  visible,
  onClose,
  fontSizeIndex = 2,
  onFontSizeChange,
  readingSpeedIndex = 2,
  onReadingSpeedChange,
}: SettingsSheetProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.handle} />
          </View>

          <View style={styles.body}>
            {/* Dark mode row */}
            <View style={styles.row}>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: 'rgba(60,60,67,0.3)', true: palette.accents.green }}
                thumbColor={palette.bg.primary}
              />
              <Text style={styles.label}>{t.settingsSheet.darkMode}</Text>
            </View>

            <View style={styles.divider} />

            {/* Font size slider */}
            <View style={styles.section}>
              <Text style={styles.label}>{t.settingsSheet.fontSize}</Text>
              <Slider
                leftLabel={t.settingsSheet.fontSizeLarge}
                rightLabel={t.settingsSheet.fontSizeSmall}
                value={fontSizeIndex}
                onChange={onFontSizeChange}
              />
            </View>

            <View style={styles.divider} />

            {/* Reading speed slider */}
            <View style={styles.section}>
              <Text style={styles.label}>{t.settingsSheet.readingSpeed}</Text>
              <Slider
                leftLabel={t.settingsSheet.readingSpeedFast}
                rightLabel={t.settingsSheet.readingSpeedSlow}
                value={readingSpeedIndex}
                onChange={onReadingSpeedChange}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Inline slider — Figma 18085:1862. 5 discrete ticks, brand-500 fill, white knob. */
function Slider({
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange?: (v: number) => void;
}) {
  const fillPct = ((value + 0.001) / 4) * 100;
  return (
    <View style={sliderStyles.wrap}>
      <View style={sliderStyles.separator} />
      <View style={sliderStyles.row}>
        <Text style={sliderStyles.endLabel}>{leftLabel}</Text>
        <View style={sliderStyles.trackWrap}>
          <View style={sliderStyles.track} />
          <View style={[sliderStyles.fill, { width: `${fillPct}%` }]} />
          <View style={sliderStyles.ticksRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Pressable
                key={i}
                style={sliderStyles.tick}
                hitSlop={12}
                onPress={() => onChange?.(i)}
              />
            ))}
          </View>
          <View
            style={[
              sliderStyles.knob,
              {
                // Knob is positioned at value-th tick, accounting for the 16px
                // horizontal inset that Figma uses (px-16 around the slider).
                left: `${fillPct}%`,
                marginLeft: -19,
              },
            ]}
          />
        </View>
        <Text style={sliderStyles.endLabel}>{rightLabel}</Text>
      </View>
    </View>
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
      gap: 20,
    },
    header: { padding: 16, alignItems: 'center' },
    handle: { width: 60, height: 4, borderRadius: 24, backgroundColor: palette.gray[200] },
    body: { paddingHorizontal: 20, gap: 16, alignItems: 'stretch' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    section: { gap: 4, alignItems: 'flex-end' },
    label: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: palette.text.primary,
      textAlign: 'right',
    },
    divider: { height: 1, backgroundColor: palette.gray[200] },
  });
}

const sliderStyles = StyleSheet.create({
  wrap: { height: 52, paddingHorizontal: 16 },
  separator: { height: 1, backgroundColor: '#e6e6e6' /* Separators/Vibrant */ },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  endLabel: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.quaternary,
    textAlign: 'center',
  },
  trackWrap: { flex: 1, height: 24, justifyContent: 'center' },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(120,120,120,0.2)' /* Fills/Primary */,
    borderRadius: 3,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 6,
    backgroundColor: palette.brand[500],
    borderRadius: 3,
  },
  ticksRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tick: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(120,120,120,0.4)',
  },
  knob: {
    position: 'absolute',
    width: 38,
    height: 24,
    borderRadius: 100,
    backgroundColor: palette.bg.primary,
    top: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 13,
    elevation: 4,
  },
});
