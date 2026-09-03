import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './MenuRow.styles';

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
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const tint = danger ? theme.error : theme.primary;

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
        <Text style={[styles.label, danger && { color: theme.error }, isArabic && styles.textRtl]}>{label}</Text>
        {description ? <Text style={[styles.description, isArabic && styles.textRtl]}>{description}</Text> : null}
      </View>
      {right}
      {showChevron ? (
        <Ionicons
          name={isArabic ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={theme.iconMuted}
        />
      ) : null}
    </Pressable>
  );
}

export const MenuRow = React.memo(MenuRowBase);
