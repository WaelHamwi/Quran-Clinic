import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

function ToggleBase({ label, description, value, onValueChange, icon, disabled }: ToggleProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      {icon ? (
        <Ionicons name={icon} size={20} color={theme.primary} style={styles.icon} />
      ) : null}
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.border, true: theme.primaryMid }}
        thumbColor={value ? theme.primary : theme.surface}
      />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    icon: { width: 24, textAlign: 'center' },
    texts: { flex: 1, gap: 2 },
    label: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: theme.text },
    description: { fontSize: fontSize.xs, color: theme.textMuted },
  });
}

export const Toggle = React.memo(ToggleBase);
