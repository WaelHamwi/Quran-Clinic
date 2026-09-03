import React, { useCallback, useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Toggle } from '@/components/forms/Toggle';
import { MotionWakingCard } from '@/components/notifications/MotionWakingCard';
import { RingtoneCard } from '@/components/notifications/RingtoneCard';
import { SwitchRow } from '@/components/notifications/SwitchRow';
import { WakingWindowCard } from '@/components/notifications/WakingWindowCard';
import { useNotificationPreferences } from '@/hooks/common/useNotificationPreferences';
import { useKeyboardAwareScroll } from '@/hooks/notifications/useKeyboardAwareScroll';
import { useNotificationChannelStatus } from '@/hooks/notifications/useNotificationChannelStatus';
import { useRingtonePreviewControl } from '@/hooks/notifications/useRingtonePreviewControl';
import { useWakeBackground } from '@/hooks/notifications/useWakeBackground';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';
import { shiftTime } from '@/utils/timeInput';
import type { NotificationsState } from '@/store/slices/notificationsSlice';
import type { RingtoneId } from '@/services/notifications/ringtones';

const SCROLL_BOTTOM_PADDING = 40;

export default function NotificationsScreen() {
  const { t } = useLanguage();
  const s = useStyles(createStyles);
  const {
    prefs,
    wakingWindow,
    updatePreference,
    updateWakingHours,
    updateWakeMotion,
    updateWakeRepeat,
    updateWakeRepeatInterval,
    updateWakeStillness,
    updateWakeBackground,
    updateWakeSampleInterval,
    requestBatteryExemption,
    updateWakeRingtone,
    updateWakeSoundStream,
    testReminderSound,
    readChannelState,
    previewRingtone,
    openDeviceSoundSettings,
    setAutoWaking,
    refreshAutoWindow,
  } = useNotificationPreferences();

  const { permissionGranted, onFixPermission, channelSilent, refreshChannel } =
    useNotificationChannelStatus(readChannelState, prefs.wakeRingtone);
  const { backgroundSupported, batteryExempt, onBackgroundToggle, onFixBattery } =
    useWakeBackground(updateWakeBackground, requestBatteryExemption);
  const { playingId, onPreview, stopPreview } = useRingtonePreviewControl(previewRingtone);
  const { scrollRef, keyboardHeight, scrollToInput } = useKeyboardAwareScroll();

  // Keep the auto window fresh (new day / new location) whenever the screen opens.
  useEffect(() => {
    void refreshAutoWindow();
  }, [refreshAutoWindow]);

  const onMorning = useCallback((v: boolean) => updatePreference('morning', v), [updatePreference]);
  const onEvening = useCallback((v: boolean) => updatePreference('evening', v), [updatePreference]);
  const onSleep = useCallback((v: boolean) => updatePreference('sleep', v), [updatePreference]);
  const onTimedWaking = useCallback((v: boolean) => updatePreference('waking', v), [updatePreference]);
  const onMotionWaking = useCallback((v: boolean) => updateWakeMotion(v), [updateWakeMotion]);

  const onPickMode = useCallback((auto: boolean) => void setAutoWaking(auto), [setAutoWaking]);

  // The steppers/fields only ever edit the manual window — they are disabled in
  // automatic mode, where the times come from the prayer-time calculation.
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

  const shiftStillness = useCallback(
    (delta: number) => updateWakeStillness(prefs.wakeStillnessMinutes + delta),
    [updateWakeStillness, prefs.wakeStillnessMinutes],
  );
  const shiftRepeat = useCallback(
    (delta: number) => updateWakeRepeatInterval(prefs.wakeRepeatIntervalMinutes + delta),
    [updateWakeRepeatInterval, prefs.wakeRepeatIntervalMinutes],
  );

  const onPickRingtone = useCallback(
    (id: RingtoneId) => {
      stopPreview();
      void updateWakeRingtone(id).then(refreshChannel);
    },
    [updateWakeRingtone, refreshChannel, stopPreview],
  );

  const onPickStream = useCallback(
    (stream: NotificationsState['wakeSoundStream']) => {
      void updateWakeSoundStream(stream).then(refreshChannel);
    },
    [updateWakeSoundStream, refreshChannel],
  );

  const onTestSound = useCallback(() => {
    void testReminderSound({
      title: t.notifications.waking,
      body: t.notifications.reminderBody,
    });
  }, [testReminderSound, t]);

  const onOpenSoundSettings = useCallback(
    () => void openDeviceSoundSettings(),
    [openDeviceSoundSettings],
  );

  // The ringtone belongs to the waking reminders, so it is only meaningful once
  // one of them is armed.
  const showRingtone = prefs.adhkarWaking || prefs.wakeMotionEnabled;
  // The start/end fields schedule the timed reminder, so they belong to it
  // alone. The motion reminder has no time to set — it waits for the sensor.
  const showWakingWindow = prefs.adhkarWaking;

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.notifications.title} showBack />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[s.content, { paddingBottom: SCROLL_BOTTOM_PADDING + keyboardHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
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

        <View style={s.smartCard}>
          <SwitchRow
            title={t.notifications.timedWaking}
            subtitle={t.notifications.timedWakingDesc}
            value={prefs.adhkarWaking}
            onValueChange={onTimedWaking}
          />
        </View>

        <MotionWakingCard
          prefs={prefs}
          permissionGranted={permissionGranted}
          backgroundSupported={backgroundSupported}
          batteryExempt={batteryExempt}
          onToggleMotion={onMotionWaking}
          onFixPermission={onFixPermission}
          onShiftStillness={shiftStillness}
          onToggleBackground={onBackgroundToggle}
          onFixBattery={onFixBattery}
          onPickSampleRate={updateWakeSampleInterval}
          onToggleRepeat={updateWakeRepeat}
          onShiftRepeat={shiftRepeat}
        />

        <Text style={s.motionHint}>{t.notifications.wakingExclusive}</Text>

        {showRingtone ? (
          <RingtoneCard
            prefs={prefs}
            playingId={playingId}
            channelSilent={channelSilent}
            onPickRingtone={onPickRingtone}
            onPreview={onPreview}
            onPickStream={onPickStream}
            onTestSound={onTestSound}
            onOpenSoundSettings={onOpenSoundSettings}
          />
        ) : null}

        {showWakingWindow ? (
          <WakingWindowCard
            isAuto={prefs.wakingAuto}
            start={wakingWindow.start}
            end={wakingWindow.end}
            onPickMode={onPickMode}
            onShiftStart={shiftStart}
            onShiftEnd={shiftEnd}
            onSetStart={setStart}
            onSetEnd={setEnd}
            onFocusScroll={scrollToInput}
          />
        ) : null}

        <Text style={s.permissionHint}>{t.notifications.permissionNeeded}</Text>
        <Text style={s.permissionHint}>{t.notifications.autoSaveHint}</Text>
      </ScrollView>
    </Screen>
  );
}
