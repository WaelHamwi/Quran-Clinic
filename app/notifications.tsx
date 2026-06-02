import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Toggle } from '@/components/forms/Toggle';
import { IconButton } from '@/components/common/IconButton';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

function shiftTime(hhmm: string, deltaMin: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h * 60 + m + deltaMin) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export default function NotificationsScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { prefs, updatePreference, updateWakingHours } = useNotificationPreferences();

  const onMorning = useCallback((v: boolean) => updatePreference('morning', v), [updatePreference]);
  const onEvening = useCallback((v: boolean) => updatePreference('evening', v), [updatePreference]);
  const onSleep = useCallback((v: boolean) => updatePreference('sleep', v), [updatePreference]);
  const onWaking = useCallback((v: boolean) => updatePreference('waking', v), [updatePreference]);

  const shiftStart = useCallback(
    (delta: number) => updateWakingHours(shiftTime(prefs.wakingStartTime, delta), prefs.wakingEndTime),
    [updateWakingHours, prefs.wakingStartTime, prefs.wakingEndTime],
  );
  const shiftEnd = useCallback(
    (delta: number) => updateWakingHours(prefs.wakingStartTime, shiftTime(prefs.wakingEndTime, delta)),
    [updateWakingHours, prefs.wakingStartTime, prefs.wakingEndTime],
  );

  return (
    <Screen edges={['top']}>
      <Header title={t.notifications.title} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.group}>
          <Toggle
            icon="sunny-outline"
            label={t.notifications.morning}
            value={prefs.adhkarMorning}
            onValueChange={onMorning}
          />
          <Toggle
            icon="partly-sunny-outline"
            label={t.notifications.evening}
            value={prefs.adhkarEvening}
            onValueChange={onEvening}
          />
          <Toggle
            icon="moon-outline"
            label={t.notifications.sleep}
            value={prefs.adhkarSleep}
            onValueChange={onSleep}
          />
          <Toggle
            icon="alarm-outline"
            label={t.notifications.waking}
            value={prefs.adhkarWaking}
            onValueChange={onWaking}
          />
        </View>

        <Text style={styles.sectionTitle}>{t.notifications.wakingHours}</Text>
        <View style={styles.group}>
          <TimeRow
            label={t.notifications.startTime}
            value={prefs.wakingStartTime}
            onShift={shiftStart}
            styles={styles}
            theme={theme}
          />
          <TimeRow
            label={t.notifications.endTime}
            value={prefs.wakingEndTime}
            onShift={shiftEnd}
            styles={styles}
            theme={theme}
          />
        </View>
        <Text style={styles.hint}>{t.notifications.permissionNeeded}</Text>
      </ScrollView>
    </Screen>
  );
}

interface TimeRowProps {
  label: string;
  value: string;
  onShift: (delta: number) => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}

function TimeRow({ label, value, onShift, styles, theme }: TimeRowProps) {
  return (
    <View style={styles.timeRow}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.stepper}>
        <IconButton icon="remove-circle-outline" color={theme.primary} onPress={() => onShift(-30)} />
        <Text style={styles.timeValue}>{value}</Text>
        <IconButton icon="add-circle-outline" color={theme.primary} onPress={() => onShift(30)} />
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: { padding: spacing.lg, gap: spacing.lg },
    group: {
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: theme.text },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    timeLabel: { fontSize: fontSize.md, color: theme.text },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    timeValue: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.text,
      minWidth: 56,
      textAlign: 'center',
    },
    hint: { fontSize: fontSize.xs, color: theme.textMuted, textAlign: 'center' },
  });
}
