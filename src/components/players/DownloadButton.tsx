import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/theme/colors';
import { hitSlop } from '@/theme/spacing';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useDownloadManager } from '@/hooks/useDownloadManager';
import type { Recording } from '@/types/recording';

interface DownloadButtonProps {
  recording: Recording;
  diseaseId: number;
}

/** Per-recording download control: idle ↓ / progress + cancel / retry / done ✓. */
function DownloadButtonBase({ recording, diseaseId }: DownloadButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { download, cancel, getTask, isDownloaded } = useDownloadManager();

  const task = getTask(recording.id);
  const downloaded = isDownloaded(recording.id);

  const handleDownload = useCallback(
    () => download(recording, diseaseId),
    [download, recording, diseaseId],
  );
  const handleCancel = useCallback(() => cancel(recording.id), [cancel, recording.id]);

  if (downloaded) {
    return (
      <View style={styles.btn}>
        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
      </View>
    );
  }

  if (task && task.status === 'downloading') {
    return (
      <Pressable onPress={handleCancel} style={styles.progressWrap} hitSlop={hitSlop}>
        <ActivityIndicator size="small" color={theme.primary} />
        <View style={styles.bar}>
          <ProgressBar progress={task.progress} height={3} />
        </View>
      </Pressable>
    );
  }

  const failed = task?.status === 'failed';
  return (
    <Pressable onPress={handleDownload} style={styles.btn} hitSlop={hitSlop}>
      <Ionicons
        name={failed ? 'refresh' : 'download-outline'}
        size={24}
        color={failed ? theme.error : theme.primary}
      />
    </Pressable>
  );
}

function createStyles(_theme: Theme) {
  return StyleSheet.create({
    btn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    progressWrap: { width: 56, alignItems: 'center', gap: 4 },
    bar: { width: 48 },
  });
}

export const DownloadButton = React.memo(DownloadButtonBase);
