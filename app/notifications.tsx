import React, { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Toggle } from '@/components/forms/Toggle';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useLanguage } from '@/context/LanguageContext';
import {
  notificationsScreenStyles as s,
  SWITCH_TRACK_OFF,
  SWITCH_TRACK_ON,
  ICON_BRAND,
} from '@/styles/notificationsScreen.styles';
import { palette } from '@/theme/colors';

function shiftTime(hhmm: string, deltaMin: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h * 60 + m + deltaMin) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export default function NotificationsScreen() {
  const { t } = useLanguage();
  const { prefs, updatePreference, updateWakingHours, setAutoWaking, refreshAutoWindow } =
    useNotificationPreferences();

  // Keep the auto window fresh (new day / new location) whenever the screen opens.
  useEffect(() => {
    void refreshAutoWindow();
  }, [refreshAutoWindow]);

  const onMorning = useCallback((v: boolean) => updatePreference('morning', v), [updatePreference]);
  const onEvening = useCallback((v: boolean) => updatePreference('evening', v), [updatePreference]);
  const onSleep = useCallback((v: boolean) => updatePreference('sleep', v), [updatePreference]);
  const onSmartWaking = useCallback((v: boolean) => updatePreference('waking', v), [updatePreference]);

  const onManual = useCallback(() => void setAutoWaking(false), [setAutoWaking]);
  const onAuto = useCallback(() => void setAutoWaking(true), [setAutoWaking]);

  const shiftStart = useCallback(
    (delta: number) => updateWakingHours(shiftTime(prefs.wakingStartTime, delta), prefs.wakingEndTime),
    [updateWakingHours, prefs.wakingStartTime, prefs.wakingEndTime],
  );
  const shiftEnd = useCallback(
    (delta: number) => updateWakingHours(prefs.wakingStartTime, shiftTime(prefs.wakingEndTime, delta)),
    [updateWakingHours, prefs.wakingStartTime, prefs.wakingEndTime],
  );

  const isAuto = prefs.wakingAuto;

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.notifications.title} showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* ── Adhkar reminders ─────────────────────────── */}
        <Text style={s.sectionTitle}>{t.notifications.remindersSection}</Text>
        <View style={s.group}>
          <Toggle
            icon="sunny-outline"
            label={t.notifications.morning}
            value={prefs.adhkarMorning}
            onValueChange={onMorning}
          />
          <View style={s.separator} />
          <Toggle
            icon="partly-sunny-outline"
            label={t.notifications.evening}
            value={prefs.adhkarEvening}
            onValueChange={onEvening}
          />
          <View style={s.separator} />
          <Toggle
            icon="moon-outline"
            label={t.notifications.sleep}
            value={prefs.adhkarSleep}
            onValueChange={onSleep}
          />
        </View>

        {/* ── Smart waking card (Figma 18524:2887) ─────── */}
        <View style={s.smartCard}>
          <View style={s.smartHeader}>
            <Switch
              value={prefs.adhkarWaking}
              onValueChange={onSmartWaking}
              trackColor={{ false: SWITCH_TRACK_OFF, true: SWITCH_TRACK_ON }}
              thumbColor={palette.white}
            />
            <View style={s.smartTexts}>
              <Text style={s.smartTitle}>{t.notifications.smartWaking}</Text>
              <Text style={s.smartSubtitle}>{t.notifications.smartWakingDesc}</Text>
            </View>
          </View>

          {prefs.adhkarWaking ? (
            <>
              {/* Manual / Automatic selector */}
              <View style={s.modeRow}>
                <Pressable
                  style={[s.modePill, !isAuto && s.modePillActive]}
                  onPress={onManual}
                >
                  <Text style={[s.modePillText, !isAuto && s.modePillTextActive]}>
                    {t.notifications.timeModeManual}
                  </Text>
                </Pressable>
                <Pressable
                  style={[s.modePill, isAuto && s.modePillActive]}
                  onPress={onAuto}
                >
                  <Text style={[s.modePillText, isAuto && s.modePillTextActive]}>
                    {t.notifications.timeModeAuto}
                  </Text>
                </Pressable>
              </View>

              {/* End time (left) + Start time (right) — Figma RTL order */}
              <View style={s.timesRow}>
                <TimeField
                  label={t.notifications.endTime}
                  value={prefs.wakingEndTime}
                  onShift={shiftEnd}
                  editable={!isAuto}
                />
                <TimeField
                  label={t.notifications.startTime}
                  value={prefs.wakingStartTime}
                  onShift={shiftStart}
                  editable={!isAuto}
                />
              </View>

              {isAuto ? <Text style={s.autoHint}>{t.notifications.timeModeAutoHint}</Text> : null}
            </>
          ) : null}
        </View>

        <Text style={s.permissionHint}>{t.notifications.permissionNeeded}</Text>
      </ScrollView>
    </Screen>
  );
}

interface TimeFieldProps {
  label: string;
  value: string;
  onShift: (delta: number) => void;
  editable: boolean;
}

function TimeField({ label, value, onShift, editable }: TimeFieldProps) {
  return (
    <View style={s.timeField}>
      <Text style={s.timeLabel}>{label}</Text>
      <View style={[s.timeInput, !editable && s.timeInputDisabled]}>
        {editable ? (
          <Pressable style={s.stepBtn} onPress={() => onShift(-30)} hitSlop={8}>
            <Ionicons name="remove" size={18} color={ICON_BRAND} />
          </Pressable>
        ) : (
          <View style={s.stepBtn} />
        )}
        <View style={s.timeInputContent}>
          <Text style={s.timeInputText}>{value}</Text>
          <Ionicons name="time-outline" size={18} color={ICON_BRAND} />
        </View>
        {editable ? (
          <Pressable style={s.stepBtn} onPress={() => onShift(30)} hitSlop={8}>
            <Ionicons name="add" size={18} color={ICON_BRAND} />
          </Pressable>
        ) : (
          <View style={s.stepBtn} />
        )}
      </View>
    </View>
  );
}
