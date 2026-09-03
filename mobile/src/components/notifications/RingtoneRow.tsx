import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';
import type { RINGTONES, RingtoneId } from '@/services/notifications/ringtones';

interface RingtoneRowProps {
  tone: (typeof RINGTONES)[number];
  active: boolean;
  previewing: boolean;
  onSelect: (id: RingtoneId) => void;
  onPreview: (id: RingtoneId) => void;
}

export function RingtoneRow({ tone, active, previewing, onSelect, onPreview }: RingtoneRowProps) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  const handleSelect = useCallback(() => onSelect(tone.id), [onSelect, tone.id]);
  const handlePreview = useCallback(() => onPreview(tone.id), [onPreview, tone.id]);

  return (
    <Pressable style={[s.ringtoneRow, active && s.ringtoneRowActive]} onPress={handleSelect}>
      {tone.preview != null ? (
        <Pressable
          style={s.previewBtn}
          onPress={handlePreview}
          hitSlop={8}
          accessibilityLabel={t.notifications.wakeSoundPreview}
        >
          <Ionicons
            name={previewing ? 'stop-circle' : 'play-circle'}
            size={24}
            color={theme.primary}
          />
        </Pressable>
      ) : (
        <View style={s.previewBtn} />
      )}
      <Text style={[s.ringtoneLabel, active && s.ringtoneLabelActive]}>
        {tone.label[language]}
      </Text>
      <Ionicons
        name={active ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={active ? theme.primary : theme.iconMuted}
      />
    </Pressable>
  );
}
