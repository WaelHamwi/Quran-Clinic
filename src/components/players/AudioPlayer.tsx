import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useDownloadManager } from '@/hooks/useDownloadManager';
import { formatMillis } from '@/utils/formatters';
import { usePlayer } from '@/hooks/usePlayer';
import { useAppSelector } from '@/store/hooks';
import { selectPlayerDiseaseId } from '@/store/slices/playerSlice';
import {
  audioPlayerStyles as s,
  ICON_COLOR,
  ICON_MUTED_COLOR,
  PLAY_ICON_COLOR,
  ACTION_ICON_COLOR,
} from './AudioPlayer.styles';

const SKIP_MS = 15000;

export interface AudioPlayerProps {
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

function AudioPlayerBase({
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: AudioPlayerProps) {
  const { t } = useLanguage();
  const { currentRecording, isPlaying, isLoading, position, duration, togglePlay, seekTo } =
    usePlayer();
  const diseaseId = useAppSelector(selectPlayerDiseaseId) ?? 0;
  const { download, cancel, getTask, isDownloaded } = useDownloadManager();
  const [barWidth, setBarWidth] = useState(0);

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  const handleSeek = useCallback(
    (e: GestureResponderEvent) => {
      if (barWidth <= 0 || duration <= 0) return;
      const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
      seekTo(ratio * duration);
    },
    [barWidth, duration, seekTo],
  );

  const handleBack = useCallback(
    () => seekTo(Math.max(0, position - SKIP_MS)),
    [seekTo, position],
  );
  const handleForward = useCallback(
    () => seekTo(duration > 0 ? Math.min(duration, position + SKIP_MS) : position + SKIP_MS),
    [seekTo, position, duration],
  );

  if (!currentRecording) return null;

  const progress = duration > 0 ? position / duration : 0;
  const task = getTask(currentRecording.id);
  const downloaded = isDownloaded(currentRecording.id);
  const downloading = task?.status === 'downloading';

  const handleDownload = () => download(currentRecording, diseaseId);
  const handleCancelDownload = () => cancel(currentRecording.id);

  return (
    <View style={s.container}>
      {/* Drag handle — decorative, Figma node 18032:3121 */}
      <View style={s.header}>
        <View style={s.dragHandle} />
      </View>

      {/* Progress slider — Figma node 18085:2129 */}
      <View style={s.sliderSection}>
        <Pressable onPress={handleSeek} onLayout={onBarLayout} style={s.sliderTouch}>
          <View style={s.track}>
            <View style={[s.fill, { width: `${progress * 100}%` }]} />
          </View>
        </Pressable>
        <View style={s.timeRow}>
          <Text style={s.time}>{formatMillis(position)}</Text>
          <Text style={s.time}>{formatMillis(duration)}</Text>
        </View>
      </View>

      {/* Controls + action buttons — Figma node 18085:2136 */}
      <View style={s.controlsSection}>
        {/* Playback controls row — Figma node 18085:2137 */}
        <View style={s.controls}>
          <Pressable onPress={handleBack} hitSlop={8}>
            <Ionicons name="play-back" size={24} color={ICON_COLOR} />
          </Pressable>
          <Pressable onPress={onPrevious} hitSlop={8} disabled={!hasPrevious}>
            <Ionicons
              name="play-skip-back"
              size={24}
              color={hasPrevious ? ICON_COLOR : ICON_MUTED_COLOR}
            />
          </Pressable>
          <Pressable onPress={togglePlay} style={s.playBtn}>
            {isLoading ? (
              <ActivityIndicator color={PLAY_ICON_COLOR} />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color={PLAY_ICON_COLOR} />
            )}
          </Pressable>
          <Pressable onPress={onNext} hitSlop={8} disabled={!hasNext}>
            <Ionicons
              name="play-skip-forward"
              size={24}
              color={hasNext ? ICON_COLOR : ICON_MUTED_COLOR}
            />
          </Pressable>
          <Pressable onPress={handleForward} hitSlop={8}>
            <Ionicons name="play-forward" size={24} color={ICON_COLOR} />
          </Pressable>
        </View>

        {/* Action buttons — Figma node 18085:2153 */}
        <View style={s.actionRow}>
          {/* Download button */}
          <Pressable
            style={s.actionBtn}
            onPress={downloading ? handleCancelDownload : downloaded ? undefined : handleDownload}
            disabled={downloaded}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={ACTION_ICON_COLOR} />
            ) : (
              <Ionicons
                name={downloaded ? 'checkmark-circle' : 'download-outline'}
                size={20}
                color={ACTION_ICON_COLOR}
              />
            )}
            <Text style={s.actionLabel}>
              {downloaded
                ? t.disease.downloaded
                : downloading
                  ? t.disease.downloading
                  : t.disease.downloadToListen}
            </Text>
          </Pressable>

          {/* Playback settings button — no-op for now */}
          <Pressable style={s.actionBtn}>
            <Ionicons name="settings-outline" size={20} color={ACTION_ICON_COLOR} />
            <Text style={s.actionLabel}>{t.disease.playbackSettings}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function areEqual(prev: AudioPlayerProps, next: AudioPlayerProps): boolean {
  return (
    prev.hasPrevious === next.hasPrevious &&
    prev.hasNext === next.hasNext &&
    prev.onPrevious === next.onPrevious &&
    prev.onNext === next.onNext
  );
}

export const AudioPlayer = React.memo(AudioPlayerBase, areEqual);
