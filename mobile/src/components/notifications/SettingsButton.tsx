import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';

interface SettingsButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export function SettingsButton({ icon, label, onPress }: SettingsButtonProps) {
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  return (
    <Pressable style={s.settingsBtn} onPress={onPress}>
      <Ionicons name={icon} size={16} color={theme.primary} />
      <Text style={s.settingsBtnText}>{label}</Text>
    </Pressable>
  );
}
