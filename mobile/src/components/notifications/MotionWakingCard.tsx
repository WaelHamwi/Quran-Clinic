import React from 'react';
import { Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';
import { MinuteStepper } from '@/components/notifications/MinuteStepper';
import { ModePill } from '@/components/notifications/ModePill';
import { SettingsButton } from '@/components/notifications/SettingsButton';
import { SwitchRow } from '@/components/notifications/SwitchRow';
import {
  WAKE_REPEAT_MIN_MINUTES,
  WAKE_REPEAT_MAX_MINUTES,
  WAKE_STILLNESS_MIN_MINUTES,
  WAKE_STILLNESS_MAX_MINUTES,
  WAKE_SAMPLE_INTERVALS_MS,
  type NotificationsState,
  type WakeSampleIntervalMs,
} from '@/store/slices/notificationsSlice';
import { WAKE_REPEAT_MAX } from '@/services/notifications/notificationScheduler';
import type { Translations } from '@/i18n/en';

const SAMPLE_RATE_LABEL: Record<WakeSampleIntervalMs, (t: Translations) => string> = {
  100: (t) => t.notifications.wakeSampleFast,
  200: (t) => t.notifications.wakeSampleBalanced,
  500: (t) => t.notifications.wakeSampleSaver,
};

interface MotionWakingCardProps {
  prefs: NotificationsState;
  permissionGranted: boolean;
  backgroundSupported: boolean;
  batteryExempt: boolean;
  onToggleMotion: (value: boolean) => void;
  onFixPermission: () => void;
  onShiftStillness: (delta: number) => void;
  onToggleBackground: (value: boolean) => void;
  onFixBattery: () => void;
  onPickSampleRate: (ms: WakeSampleIntervalMs) => void;
  onToggleRepeat: (value: boolean) => void;
  onShiftRepeat: (delta: number) => void;
}

/** Figma 18524:2887 */
export function MotionWakingCard({
  prefs,
  permissionGranted,
  backgroundSupported,
  batteryExempt,
  onToggleMotion,
  onFixPermission,
  onShiftStillness,
  onToggleBackground,
  onFixBattery,
  onPickSampleRate,
  onToggleRepeat,
  onShiftRepeat,
}: MotionWakingCardProps) {
  const { t } = useLanguage();
  const s = useStyles(createStyles);

  return (
    <View style={s.smartCard}>
      <SwitchRow
        title={t.notifications.smartWaking}
        subtitle={t.notifications.smartWakingDesc}
        value={prefs.wakeMotionEnabled}
        onValueChange={onToggleMotion}
      />

      <Text style={s.motionHint}>{t.notifications.smartWakingMotion}</Text>

      {prefs.wakeMotionEnabled ? (
        <>
          <View style={s.subDivider} />

          {/* The permission is the most common reason no reminder arrives,
              and it is invisible from inside the app unless surfaced. */}
          {permissionGranted ? null : (
            <>
              <Text style={s.autoHint}>{t.notifications.wakePermissionMissing}</Text>
              <SettingsButton
                icon="notifications-outline"
                label={t.notifications.wakePermissionFix}
                onPress={onFixPermission}
              />
            </>
          )}

          <MinuteStepper
            label={t.notifications.wakeStillness}
            valueText={t.notifications.wakeStillnessMinutes(prefs.wakeStillnessMinutes)}
            icon="moon-outline"
            value={prefs.wakeStillnessMinutes}
            min={WAKE_STILLNESS_MIN_MINUTES}
            max={WAKE_STILLNESS_MAX_MINUTES}
            onShift={onShiftStillness}
          />
          <Text style={s.autoHint}>{t.notifications.wakeStillnessHint}</Text>

          <View style={s.subDivider} />

          {/* Background detection — Android foreground service. iOS grants
              no equivalent, so the row is replaced by an explanation rather
              than a switch that could never be turned on. */}
          {backgroundSupported ? (
            <SwitchRow
              title={t.notifications.wakeBackground}
              subtitle={t.notifications.wakeBackgroundDesc}
              value={prefs.wakeBackgroundEnabled}
              onValueChange={onToggleBackground}
            />
          ) : (
            <Text style={s.autoHint}>{t.notifications.wakeBackgroundUnavailable}</Text>
          )}

          {prefs.wakeBackgroundEnabled && backgroundSupported ? (
            <>
              {batteryExempt ? null : (
                <>
                  <Text style={s.autoHint}>{t.notifications.wakeBatteryWarning}</Text>
                  <SettingsButton
                    icon="battery-charging-outline"
                    label={t.notifications.wakeBatteryFix}
                    onPress={onFixBattery}
                  />
                </>
              )}

              <Text style={s.timeLabel}>{t.notifications.wakeSampleRate}</Text>
              <View style={s.modeRow}>
                {WAKE_SAMPLE_INTERVALS_MS.map((ms) => (
                  <ModePill
                    key={ms}
                    label={SAMPLE_RATE_LABEL[ms](t)}
                    active={prefs.wakeSampleIntervalMs === ms}
                    value={ms}
                    onSelect={onPickSampleRate}
                  />
                ))}
              </View>
              <Text style={s.autoHint}>{t.notifications.wakeSampleHint}</Text>
            </>
          ) : null}

          <View style={s.subDivider} />

          <SwitchRow
            title={t.notifications.wakeRepeat}
            subtitle={t.notifications.wakeRepeatDesc}
            value={prefs.wakeRepeatEnabled}
            onValueChange={onToggleRepeat}
          />

          {prefs.wakeRepeatEnabled ? (
            <>
              <MinuteStepper
                label={t.notifications.wakeRepeatEvery}
                valueText={t.notifications.wakeRepeatMinutes(prefs.wakeRepeatIntervalMinutes)}
                icon="repeat-outline"
                value={prefs.wakeRepeatIntervalMinutes}
                min={WAKE_REPEAT_MIN_MINUTES}
                max={WAKE_REPEAT_MAX_MINUTES}
                onShift={onShiftRepeat}
              />
              <Text style={s.autoHint}>{t.notifications.wakeRepeatCap(WAKE_REPEAT_MAX)}</Text>
            </>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
