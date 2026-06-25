import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { fontFamily } from '@/theme/typography';

/** Generic settings / navigation row — Figma More page section row
 *  (variant lifted from 18097:1644's MenuRow occurrences).
 *  Variable defs:
 *   - Row text:     Alexandria Medium 14/20 #181d27 (Text/text-primary 900)
 *   - Description:  Alexandria Light 12/18 #535862 (Text/text-tertiary 600)
 *   - Icon bubble:  Brand/Primary/25 #ebfafa, radius 10
 *   - Icon tint:    Brand/Primary/500 #135452 (danger uses System/Error/500)
 *   - Chevron tint: Foreground/fg-quaternary #a4a7ae */
const FIGMA = {
  brand500: '#135452',
  brand25: '#ebfafa',
  error500: '#f04438',
  bgPrimary: '#ffffff',
  textPrimary: '#181d27',
  textTertiary: '#535862',
  chevron: '#a4a7ae',
} as const;

interface MenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
  danger?: boolean;
}

function MenuRowBase({
  icon,
  label,
  description,
  onPress,
  right,
  showChevron = false,
  danger = false,
}: MenuRowProps) {
  const { isArabic } = useLanguage();
  const tint = danger ? FIGMA.error500 : FIGMA.brand500;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, isArabic && styles.rowRtl, pressed && onPress ? styles.pressed : null]}
    >
      <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.label, danger && { color: FIGMA.error500 }, isArabic && styles.textRtl]}>{label}</Text>
        {description ? <Text style={[styles.description, isArabic && styles.textRtl]}>{description}</Text> : null}
      </View>
      {right}
      {showChevron ? (
        <Ionicons
          name={isArabic ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={FIGMA.chevron}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.6 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: FIGMA.brand25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: FIGMA.bgPrimary },
  texts: { flex: 1, gap: 2 },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.alexandriaMedium,
    color: FIGMA.textPrimary,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.alexandriaLight,
    color: FIGMA.textTertiary,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  textRtl: { textAlign: 'right' },
});

export const MenuRow = React.memo(MenuRowBase);
