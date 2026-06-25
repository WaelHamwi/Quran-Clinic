import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  PanResponder,
  Pressable,
  Switch,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme/colors';
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
  SWITCH_ON_COLOR,
  SWITCH_OFF_COLOR,
} from './AudioPlayer.styles';

const SKIP_MS = 15000;

// Font size chips, ascending (small → large)
const FONT_STEPS = [14, 16, 18, 20, 22];
// Speed chips, ascending — mirrors the Mushaf reader's set (useAudio PLAYBACK_SPEEDS).
const SPEED_STEPS = [0.5, 0.75, 1.0, 1.5, 2.0];

const TEXT_COLOR_PRESETS: Array<{ color: string; label: { ar: string; en: string } }> = [
  { color: palette.text.primary,   label: { ar: 'داكن',        en: 'Dark'       } },
  { color: palette.brand[600],     label: { ar: 'أخضر داكن',   en: 'Deep Green' } },
  { color: palette.brand[500],     label: { ar: 'أخضر',        en: 'Green'      } },
  { color: palette.text.secondary, label: { ar: 'رمادي',       en: 'Gray'       } },
  { color: palette.text.tertiary,  label: { ar: 'فاتح',        en: 'Light'      } },
];

const SETTINGS_STRINGS = {
  ar: {
    darkMode:   'الوضع الداكن',
    fontSize:   'حجم الخط',
    speed:      'سرعة القراءة',
    colorLabel: 'لون الخط',
    close:      'إغلاق',
    // Font-size labels, smallest → largest (must match FONT_STEPS order).
    fontSizes:  ['صغير جدًا', 'صغير', 'متوسط', 'كبير', 'كبير جدًا'],
  },
  en: {
    darkMode:   'Dark Mode',
    fontSize:   'Font Size',
    speed:      'Reading Speed',
    colorLabel: 'Text Color',
    close:      'Close',
    fontSizes:  ['XS', 'S', 'M', 'L', 'XL'],
  },
};

// ── Main player component ─────────────────────────────────────────────────────
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
  const { isArabic } = useLanguage();
  const {
    currentRecording,
    isPlaying,
    isLoading,
    position,
    duration,
    playbackRate,
    textColor,
    fontSize,
    isDarkMode,
    togglePlay,
    seekTo,
    setRate,
    setTextColor,
    setFontSize,
    setDarkMode,
  } = usePlayer();
  const diseaseId = useAppSelector(selectPlayerDiseaseId) ?? 0;
  const { download, cancel, getTask, isDownloaded } = useDownloadManager();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);

  // ── Seek bar drag ─────────────────────────────────────────────────────────
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const barWidthRef = useRef(0);
  const durationRef = useRef(duration);
  const seekToRef = useRef(seekTo);
  durationRef.current = duration;
  seekToRef.current = seekTo;

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    barWidthRef.current = e.nativeEvent.layout.width;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const w = barWidthRef.current;
        if (w > 0) setDragProgress(Math.max(0, Math.min(1, e.nativeEvent.locationX / w)));
      },
      onPanResponderMove: (e) => {
        const w = barWidthRef.current;
        if (w > 0) setDragProgress(Math.max(0, Math.min(1, e.nativeEvent.locationX / w)));
      },
      onPanResponderRelease: (e) => {
        const w = barWidthRef.current;
        const dur = durationRef.current;
        if (w > 0 && dur > 0) {
          seekToRef.current(Math.max(0, Math.min(1, e.nativeEvent.locationX / w)) * dur);
        }
        setDragProgress(null);
      },
      onPanResponderTerminate: () => setDragProgress(null),
    }),
  ).current;
  // ─────────────────────────────────────────────────────────────────────────

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

  const strings = isArabic ? SETTINGS_STRINGS.ar : SETTINGS_STRINGS.en;

  return (
    <View style={s.container}>
      {/* Drag handle */}
      <View style={s.header}>
        <View style={s.dragHandle} />
      </View>

      {/* Progress slider */}
      <View style={s.sliderSection}>
        <View onLayout={onBarLayout} style={s.sliderTouch} {...panResponder.panHandlers}>
          <View style={s.track}>
            <View style={[s.fill, { width: `${(dragProgress ?? progress) * 100}%` }]} />
          </View>
        </View>
        <View style={s.timeRow}>
          <Text style={s.time}>{formatMillis(position)}</Text>
          <Text style={s.time}>{formatMillis(duration)}</Text>
        </View>
      </View>

      {/* Controls + action buttons */}
      <View style={[s.controlsSection, { paddingBottom: bottomInset + 12 }]}>
        {/* Playback controls row */}
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

        {/* Action buttons row */}
        <View style={s.actionRow}>
          {/* Download */}
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
              {downloaded ? (isArabic ? 'تم التحميل' : 'Downloaded')
                : downloading ? (isArabic ? 'جاري التحميل' : 'Downloading…')
                : (isArabic ? 'تحميل للاستماع' : 'Download')}
            </Text>
          </Pressable>

          {/* Playback settings */}
          <Pressable style={s.actionBtn} onPress={() => setShowSettings(true)}>
            <Ionicons name="settings-outline" size={20} color={ACTION_ICON_COLOR} />
            <Text style={s.actionLabel}>
              {isArabic ? 'إعدادات التشغيل' : 'Playback Settings'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Settings bottom sheet */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setShowSettings(false)}>
          <Pressable style={[s.settingsSheet, { paddingBottom: Math.max(bottomInset + 12, 32) }]} onPress={() => {}}>
            {/* drag handle */}
            <View style={[s.sheetHandle, { alignSelf: 'center' }]} />

            {/* Dark mode */}
            <View style={s.settingsToggleRow}>
              <Switch
                value={isDarkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: SWITCH_OFF_COLOR, true: SWITCH_ON_COLOR }}
                thumbColor={palette.white}
              />
              <Text style={s.settingsToggleLabel}>{strings.darkMode}</Text>
            </View>

            <View style={s.settingsDivider} />

            {/* Font size — chips showing each size visually */}
            <View style={s.settingsSectionWrap}>
              <Text style={s.settingsSectionTitle}>{strings.fontSize}</Text>
              <View style={s.fontRow}>
                {FONT_STEPS.map((size, idx) => {
                  const active = fontSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[s.fontChip, active && s.fontChipActive]}
                      onPress={() => setFontSize(size)}
                    >
                      <Text
                        style={[s.fontChipText, active && s.fontChipTextActive]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {strings.fontSizes[idx]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={s.settingsDivider} />

            {/* Reading speed — Mushaf-style chips (0.5×–2×) */}
            <View style={s.settingsSectionWrap}>
              <Text style={s.settingsSectionTitle}>{strings.speed}</Text>
              <View style={s.speedRow}>
                {SPEED_STEPS.map((spd) => {
                  const active = playbackRate === spd;
                  return (
                    <TouchableOpacity
                      key={spd}
                      style={[s.speedChip, active && s.speedChipActive]}
                      onPress={() => setRate(spd)}
                    >
                      <Text style={[s.speedChipText, active && s.speedChipTextActive]}>
                        {`${spd}×`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={s.settingsDivider} />

            {/* Text colour */}
            <View style={s.settingsSectionWrap}>
              <Text style={s.settingsSectionTitle}>{strings.colorLabel}</Text>
              <View style={s.colorRow}>
                {TEXT_COLOR_PRESETS.map((preset) => {
                  const active = textColor === preset.color;
                  return (
                    <TouchableOpacity
                      key={preset.color}
                      onPress={() => setTextColor(preset.color)}
                      style={s.colorSwatch}
                      accessibilityLabel={isArabic ? preset.label.ar : preset.label.en}
                    >
                      <View
                        style={[
                          s.colorCircle,
                          { backgroundColor: preset.color },
                          active && s.colorCircleActive,
                        ]}
                      />
                      <Text style={[s.colorLabel, active && s.colorLabelActive]}>
                        {isArabic ? preset.label.ar : preset.label.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity style={s.closeBtn} onPress={() => setShowSettings(false)}>
              <Text style={s.closeBtnText}>{strings.close}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
