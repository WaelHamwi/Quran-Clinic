import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme/spacing';
import { RecordingCard } from '@/components/lists/RecordingCard';
import type { AccessibleRecording } from '@/hooks/useRecordings';

interface RecordingListProps {
  recordings: AccessibleRecording[];
  diseaseId: number;
  currentRecordingId: number | null;
  isPlaying: boolean;
  onPlay: (recording: AccessibleRecording) => void;
}

/** Renders a disease's recordings (≤3 items — a plain map, safe inside a ScrollView). */
export function RecordingList({
  recordings,
  diseaseId,
  currentRecordingId,
  isPlaying,
  onPlay,
}: RecordingListProps) {
  return (
    <View style={styles.list}>
      {recordings.map((r) => (
        <RecordingCard
          key={r.id}
          recording={r}
          diseaseId={diseaseId}
          isCurrent={currentRecordingId === r.id}
          isPlaying={isPlaying}
          onPlay={onPlay}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
});
