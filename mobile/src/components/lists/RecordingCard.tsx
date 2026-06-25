import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { formatSeconds } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { DownloadButton } from '@/components/players/DownloadButton';
import type { AccessibleRecording } from '@/hooks/useRecordings';
import {
  recordingCardStyles as s,
  PLAY_ICON_COLOR,
  LOCKED_ICON_COLOR,
} from './RecordingCard.styles';

interface RecordingCardProps {
  recording: AccessibleRecording;
  diseaseId: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (recording: AccessibleRecording) => void;
}

function RecordingCardBase({
  recording,
  diseaseId,
  isCurrent,
  isPlaying,
  onPlay,
}: RecordingCardProps) {
  const { t } = useLanguage();
  const handlePlay = useCallback(() => onPlay(recording), [onPlay, recording]);

  const playing = isCurrent && isPlaying;
  const title = t.disease.session(recording.session_number);
  const locked = !recording.accessible;

  return (
    <View style={[s.recordingCard, isCurrent && s['recordingCard--active']]}>
      <Pressable
        onPress={handlePlay}
        style={[s.recordingCard__playBtn, isCurrent && s['recordingCard__playBtn--active']]}
      >
        <Ionicons
          name={locked ? 'lock-closed' : playing ? 'pause' : 'play'}
          size={20}
          color={locked ? LOCKED_ICON_COLOR : PLAY_ICON_COLOR}
        />
      </Pressable>
      <View style={s.recordingCard__texts}>
        <Text style={[s.recordingCard__title, isCurrent && s['recordingCard__title--active']]}>
          {title}
        </Text>
        <View style={s.recordingCard__metaRow}>
          <Text style={s.recordingCard__meta}>{t.disease.session(recording.session_number)}</Text>
          {recording.duration_seconds ? (
            <Text style={s.recordingCard__meta}>· {formatSeconds(recording.duration_seconds)}</Text>
          ) : null}
        </View>
      </View>
      {locked ? (
        <Badge label={t.common.locked} tone="locked" icon="lock-closed" />
      ) : (
        <DownloadButton recording={recording} diseaseId={diseaseId} />
      )}
    </View>
  );
}

function areEqual(prev: RecordingCardProps, next: RecordingCardProps): boolean {
  return (
    prev.recording.id === next.recording.id &&
    prev.recording.accessible === next.recording.accessible &&
    prev.isCurrent === next.isCurrent &&
    prev.isPlaying === next.isPlaying &&
    prev.onPlay === next.onPlay
  );
}

export const RecordingCard = React.memo(RecordingCardBase, areEqual);
