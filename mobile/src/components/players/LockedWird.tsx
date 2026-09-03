import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './LockedWird.styles';

interface LockedWirdProps {
  /** Open the subscription plans screen. */
  onSubscribe: () => void;
  /** Jump back to the summarized (free) recording. */
  onReturn: () => void;
}

/**
 * Paywall shown inside the section card when the viewed wird requires a
 * subscription the user doesn't have (Figma node 18972:3492).
 */
function LockedWirdBase({ onSubscribe, onReturn }: LockedWirdProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  return (
    <View style={s.container}>
      <View style={s.top}>
        <View style={s.iconCircle}>
          <Ionicons name="lock-closed" size={48} color={theme.primary} />
        </View>
        <Text style={s.title}>{t.disease.lockedTitle}</Text>
        <Text style={s.body}>{t.disease.lockedBody}</Text>
      </View>

      <View style={s.actions}>
        <Pressable style={s.primaryBtn} onPress={onSubscribe}>
          <Text style={s.primaryLabel}>{t.disease.lockedSubscribe}</Text>
        </Pressable>
        <Pressable style={s.secondaryBtn} onPress={onReturn}>
          <Text style={s.secondaryLabel}>{t.disease.lockedReturn}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const LockedWird = React.memo(LockedWirdBase);
