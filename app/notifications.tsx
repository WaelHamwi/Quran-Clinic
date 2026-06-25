import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Toggle } from '@/components/forms/Toggle';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { notificationScheduler } from '@/services/notificationScheduler';
import { useLanguage } from '@/context/LanguageContext';
import {
  notificationsScreenStyles as s,
  SWITCH_TRACK_OFF,
  SWITCH_TRACK_ON,
  ICON_BRAND,
  INPUT_PLACEHOLDER,
} from '@/styles/notificationsScreen.styles';
import { palette } from '@/theme/colors';

function shiftTime(hhmm: string, deltaMin: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h * 60 + m + deltaMin) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Live-format raw keypad input into an `HH:MM` mask while typing. */
function formatTimeDraft(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** Normalise a typed value to a valid `HH:MM`; null if it can't be a real time. */
function normalizeTime(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 0) return null;
  let h: number;
  let m: number;
  if (digits.length <= 2) {
    h = parseInt(digits, 10);
    m = 0;
  } else {
    h = parseInt(digits.slice(0, digits.length - 2), 10);
    m = parseInt(digits.slice(digits.length - 2), 10);
  }
  if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

  // Diagnostics: fire a notification in ~3s and report permission + scheduled count.
  const onTest = useCallback(async () => {
    if (!notificationScheduler.isSupported) {
      Alert.alert(t.notifications.testTitle, t.notifications.testExpoGo);
      return;
    }
    const ok = await notificationScheduler.sendTest({
      title: t.notifications.testTitle,
      body: t.notifications.testBody,
    });
    if (!ok) {
      Alert.alert(t.notifications.testTitle, t.notifications.testDenied);
      return;
    }
    const { granted, scheduled } = await notificationScheduler.getStatus();
    Alert.alert(t.notifications.testTitle, t.notifications.testInfo(granted, scheduled));
  }, [t]);

  const shiftStart = useCallback(
    (delta: number) => updateWakingHours(shiftTime(prefs.wakingStartTime, delta), prefs.wakingEndTime),
    [updateWakingHours, prefs.wakingStartTime, prefs.wakingEndTime],
  );
  const shiftEnd = useCallback(
    (delta: number) => updateWakingHours(prefs.wakingStartTime, shiftTime(prefs.wakingEndTime, delta)),
    [updateWakingHours, prefs.wakingStartTime, prefs.wakingEndTime],
  );
  const setStart = useCallback(
    (value: string) => updateWakingHours(value, prefs.wakingEndTime),
    [updateWakingHours, prefs.wakingEndTime],
  );
  const setEnd = useCallback(
    (value: string) => updateWakingHours(prefs.wakingStartTime, value),
    [updateWakingHours, prefs.wakingStartTime],
  );

  const isAuto = prefs.wakingAuto;

  // Android edge-to-edge (SDK 53 default) ignores `adjustResize`, so the window
  // never shrinks for the keyboard and the time fields stay hidden behind it.
  // We track the keyboard height ourselves, pad the scroll content by it, and
  // scroll to the end so the focused field is lifted clear of the keyboard.
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const onShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const onHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  // Re-scroll when switching directly between the two fields (no new show event).
  const scrollToInput = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.notifications.title} showBack />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[s.content, { paddingBottom: 40 + keyboardHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
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
                  onSet={setEnd}
                  onFocusScroll={scrollToInput}
                  editable={!isAuto}
                />
                <TimeField
                  label={t.notifications.startTime}
                  value={prefs.wakingStartTime}
                  onShift={shiftStart}
                  onSet={setStart}
                  onFocusScroll={scrollToInput}
                  editable={!isAuto}
                />
              </View>

              {isAuto ? <Text style={s.autoHint}>{t.notifications.timeModeAutoHint}</Text> : null}
            </>
          ) : null}
        </View>

        <Text style={s.permissionHint}>{t.notifications.permissionNeeded}</Text>

        <Pressable style={s.testButton} onPress={onTest}>
          <Ionicons name="notifications-outline" size={18} color={palette.text.onBrand} />
          <Text style={s.testButtonText}>{t.notifications.testButton}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

interface TimeFieldProps {
  label: string;
  value: string;
  onShift: (delta: number) => void;
  onSet: (value: string) => void;
  onFocusScroll: () => void;
  editable: boolean;
}

function TimeField({ label, value, onShift, onSet, onFocusScroll, editable }: TimeFieldProps) {
  // `draft` lets the user type freely; the committed value only changes on
  // blur/submit (or via the steppers). Keep it in sync while not editing.
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const onChange = useCallback((text: string) => setDraft(formatTimeDraft(text)), []);
  const onFocus = useCallback(() => {
    setEditing(true);
    onFocusScroll();
  }, [onFocusScroll]);
  const commit = useCallback(() => {
    setEditing(false);
    const normalized = normalizeTime(draft);
    if (normalized) {
      onSet(normalized);
      setDraft(normalized);
    } else {
      setDraft(value); // revert invalid input
    }
  }, [draft, onSet, value]);

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
          {editable ? (
            <TextInput
              style={[s.timeInputText, s.timeInputEditable]}
              value={draft}
              onChangeText={onChange}
              onFocus={onFocus}
              onBlur={commit}
              onSubmitEditing={commit}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={5}
              placeholder="--:--"
              placeholderTextColor={INPUT_PLACEHOLDER}
              selectTextOnFocus
            />
          ) : (
            <Text style={s.timeInputText}>{value}</Text>
          )}
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
