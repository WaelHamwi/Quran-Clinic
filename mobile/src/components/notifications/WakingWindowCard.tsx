import React from 'react';
import { Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';
import { ModePill } from '@/components/notifications/ModePill';
import { TimeField } from '@/components/notifications/TimeField';

interface WakingWindowCardProps {
  isAuto: boolean;
  start: string;
  end: string;
  onPickMode: (auto: boolean) => void;
  onShiftStart: (delta: number) => void;
  onShiftEnd: (delta: number) => void;
  onSetStart: (value: string) => void;
  onSetEnd: (value: string) => void;
  onFocusScroll: () => void;
}

/** The period both waking reminders work within. */
export function WakingWindowCard({
  isAuto,
  start,
  end,
  onPickMode,
  onShiftStart,
  onShiftEnd,
  onSetStart,
  onSetEnd,
  onFocusScroll,
}: WakingWindowCardProps) {
  const { t } = useLanguage();
  const s = useStyles(createStyles);

  return (
    <View style={s.smartCard}>
      <View style={s.smartTexts}>
        <Text style={s.smartTitle}>{t.notifications.wakingWindowTitle}</Text>
        <Text style={s.smartSubtitle}>{t.notifications.wakingWindowDesc}</Text>
      </View>

      <View style={s.modeRow}>
        <ModePill
          label={t.notifications.timeModeManual}
          active={!isAuto}
          value={false}
          onSelect={onPickMode}
        />
        <ModePill
          label={t.notifications.timeModeAuto}
          active={isAuto}
          value
          onSelect={onPickMode}
        />
      </View>

      {/* End time (left) + Start time (right) — Figma RTL order */}
      <View style={s.timesRow}>
        <TimeField
          label={t.notifications.endTime}
          value={end}
          onShift={onShiftEnd}
          onSet={onSetEnd}
          onFocusScroll={onFocusScroll}
          editable={!isAuto}
        />
        <TimeField
          label={t.notifications.startTime}
          value={start}
          onShift={onShiftStart}
          onSet={onSetStart}
          onFocusScroll={onFocusScroll}
          editable={!isAuto}
        />
      </View>

      <Text style={s.autoHint}>
        {isAuto ? t.notifications.timeModeAutoHint : t.notifications.timeModeManualHint}
      </Text>
    </View>
  );
}
