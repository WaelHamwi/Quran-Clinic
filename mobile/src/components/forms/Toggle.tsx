import React from 'react';
import { Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './Toggle.styles';

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
  const styles = useStyles(createStyles);

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

export const Toggle = React.memo(ToggleBase);
