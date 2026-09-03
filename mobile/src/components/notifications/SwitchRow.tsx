import React from 'react';
import { Switch, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';
import { palette } from '@/theme/colors';

interface SwitchRowProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SwitchRow({ title, subtitle, value, onValueChange }: SwitchRowProps) {
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  return (
    <View style={s.smartHeader}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        // The "on" track and the thumb stay the same brand colours in light and
        // dark; only the "off" track follows the theme.
        trackColor={{ false: theme.border, true: palette.accents.green }}
        thumbColor={palette.white}
      />
      <View style={s.smartTexts}>
        <Text style={s.smartTitle}>{title}</Text>
        <Text style={s.smartSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}
