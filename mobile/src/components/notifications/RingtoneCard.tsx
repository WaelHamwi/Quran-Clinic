import React from 'react';
import { Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';
import { ModePill } from '@/components/notifications/ModePill';
import { RingtoneRow } from '@/components/notifications/RingtoneRow';
import { SettingsButton } from '@/components/notifications/SettingsButton';
import { RINGTONES, type RingtoneId } from '@/services/notifications/ringtones';
import type { NotificationsState } from '@/store/slices/notificationsSlice';

type SoundStream = NotificationsState['wakeSoundStream'];

interface RingtoneCardProps {
  prefs: NotificationsState;
  playingId: RingtoneId | null;
  channelSilent: boolean;
  onPickRingtone: (id: RingtoneId) => void;
  onPreview: (id: RingtoneId) => void;
  onPickStream: (stream: SoundStream) => void;
  onTestSound: () => void;
  onOpenSoundSettings: () => void;
}

/** The tone is shared by both waking reminders. */
export function RingtoneCard({
  prefs,
  playingId,
  channelSilent,
  onPickRingtone,
  onPreview,
  onPickStream,
  onTestSound,
  onOpenSoundSettings,
}: RingtoneCardProps) {
  const { t } = useLanguage();
  const s = useStyles(createStyles);

  return (
    <View style={s.smartCard}>
      <View style={s.smartTexts}>
        <Text style={s.smartTitle}>{t.notifications.wakeSound}</Text>
        <Text style={s.smartSubtitle}>{t.notifications.wakeSoundHint}</Text>
      </View>

      <View style={s.ringtoneList}>
        {RINGTONES.map((tone) => (
          <RingtoneRow
            key={tone.id}
            tone={tone}
            active={tone.id === prefs.wakeRingtone}
            previewing={playingId === tone.id}
            onSelect={onPickRingtone}
            onPreview={onPreview}
          />
        ))}
      </View>

      {prefs.wakeRingtone === 'device' ? null : (
        <>
          <Text style={s.smartSubtitle}>{t.notifications.wakeStreamTitle}</Text>
          <View style={s.modeRow}>
            <ModePill
              label={t.notifications.wakeStreamNotification}
              active={prefs.wakeSoundStream === 'notification'}
              value="notification"
              onSelect={onPickStream}
            />
            <ModePill
              label={t.notifications.wakeStreamAlarm}
              active={prefs.wakeSoundStream === 'alarm'}
              value="alarm"
              onSelect={onPickStream}
            />
          </View>
          <Text style={s.autoHint}>
            {prefs.wakeSoundStream === 'alarm'
              ? t.notifications.wakeStreamAlarmHint
              : t.notifications.wakeStreamNotificationHint}
          </Text>
        </>
      )}

      <SettingsButton
        icon="volume-high-outline"
        label={t.notifications.wakeSoundTest}
        onPress={onTestSound}
      />

      {channelSilent ? (
        <Text style={s.autoHint}>{t.notifications.wakeSoundChannelSilent}</Text>
      ) : null}

      {prefs.wakeRingtone === 'device' ? (
        <Text style={s.autoHint}>{t.notifications.wakeSoundDeviceHint}</Text>
      ) : null}

      <SettingsButton
        icon="options-outline"
        label={t.notifications.wakeSoundOpenSettings}
        onPress={onOpenSoundSettings}
      />
    </View>
  );
}
