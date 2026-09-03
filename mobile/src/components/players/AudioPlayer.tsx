import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
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
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { useDownloadManager } from '@/hooks/common/useDownloadManager';
import { formatMillis } from '@/utils/formatters';
import { usePlayer } from '@/hooks/player/usePlayer';
import { useQueueTimeline } from '@/hooks/player/useQueueTimeline';
import { useReadingSurface } from '@/hooks/player/useReadingSurface';
import { useAppSelector } from '@/store/hooks';
import { selectPlayerDiseaseId } from '@/store/slices/playerSlice';
import { recordingTypeOf } from '@/utils/recordings';
import type { Recording } from '@/types/recording';
import {
  createStyles,
  SWITCH_ON_COLOR,
  SWITCH_OFF_COLOR,
} from './AudioPlayer.styles';

const SKIP_MS = 15000;

// Font size chips, ascending (small → large)
const FONT_STEPS = [14, 16, 18, 20, 22];

type ColorPreset = { color: string; label: { ar: string; en: string } };

// Reading-text palette for the LIGHT card — deep, saturated hues that read
// clearly on a white/parchment background. All values come from `palette`.
const LIGHT_TEXT_COLORS: ColorPreset[] = [
  { color: palette.text.primary,        label: { ar: 'أسود',          en: 'Black'      } },
  { color: palette.brand[700],          label: { ar: 'أخضر داكن جداً', en: 'Pine'       } },
  { color: palette.brand[600],          label: { ar: 'أخضر داكن',     en: 'Deep Green' } },
  { color: palette.brand[500],          label: { ar: 'أخضر',          en: 'Green'      } },
  { color: palette.secondaryGreen[600], label: { ar: 'عشبي',          en: 'Grass'      } },
  { color: palette.text.secondary,      label: { ar: 'رمادي',         en: 'Gray'       } },
  { color: palette.text.tertiary,       label: { ar: 'رمادي فاتح',    en: 'Slate'      } },
  { color: palette.system.warning[800], label: { ar: 'بني',           en: 'Brown'      } },
  { color: palette.system.error[900],   label: { ar: 'عنابي',         en: 'Maroon'     } },
];

// Reading-text palette for the DARK card — light, bright hues that read clearly
// on the dark green (`brand[700]`) reading surface. All values come from `palette`.
const DARK_TEXT_COLORS: ColorPreset[] = [
  { color: palette.white,               label: { ar: 'أبيض',     en: 'White'      } },
  { color: palette.brand[25],           label: { ar: 'ثلجي',     en: 'Ice'        } },
  { color: palette.lightGreen[25],      label: { ar: 'ليموني',   en: 'Lime'       } },
  { color: palette.secondaryGreen[50],  label: { ar: 'أخضر باهت', en: 'Pale Green' } },
  { color: palette.secondaryGreen[300], label: { ar: 'أخضر فاتح', en: 'Light Green'} },
  { color: palette.mint[100],           label: { ar: 'نعناعي',   en: 'Mint'       } },
  { color: palette.brand[200],          label: { ar: 'مريمي',    en: 'Sage'       } },
  { color: palette.system.warning[400], label: { ar: 'كهرماني',  en: 'Amber'      } },
];

const SETTINGS_STRINGS = {
  ar: {
    darkMode:   'الوضع الداكن',
    fontSize:   'حجم الخط',
    colorLabel: 'لون الخط',
    close:      'إغلاق',
    // Font-size labels, smallest → largest (must match FONT_STEPS order).
    fontSizes:  ['صغير جدًا', 'صغير', 'متوسط', 'كبير', 'كبير جدًا'],
  },
  en: {
    darkMode:   'Dark Mode',
    fontSize:   'Font Size',
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
  /**
   * Preview mode. When set, the panel represents THIS recording in a paused /
   * ready state (position 0, seek + skip disabled) instead of the live engine
   * track — used on a wird screen while a queue (general ruqyah / favorites)
   * owns the engine. Tapping play calls `onPreviewPlay`, which takes over the
   * engine and starts this wird.
   */
  previewRecording?: Recording;
  previewDiseaseId?: number;
  onPreviewPlay?: () => void;
  /** Name of the wird this player belongs to. A `Recording` carries no name of
   *  its own, so this is what a download is filed under in the Downloads list. */
  wirdTitle?: string;
}

function AudioPlayerBase({
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  previewRecording,
  previewDiseaseId,
  onPreviewPlay,
  wirdTitle,
}: AudioPlayerProps) {
  const { isArabic, t } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const {
    currentRecording,
    isPlaying,
    isLoading,
    textColor,
    fontSize,
    isDarkMode,
    togglePlay,
    setTextColor,
    setFontSize,
    setDarkMode,
  } = usePlayer();
  // The sessions behind one tab are a single ruqyah, so the transport runs on
  // the whole wird's clock rather than restarting at 0:00 on each session.
  const { position, duration, seekTimeline } = useQueueTimeline();
  const diseaseId = useAppSelector(selectPlayerDiseaseId) ?? 0;
  const { download, cancel, getTask, isDownloaded } = useDownloadManager();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);

  // ── Seek bar drag ─────────────────────────────────────────────────────────
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const barWidthRef = useRef(0);
  const durationRef = useRef(duration);
  const seekToRef = useRef(seekTimeline);
  /* eslint-disable react-hooks/refs -- always-fresh refs read by the PanResponder handlers below, created once via useRef so they see the latest values without recreating the responder every render */
  durationRef.current = duration;
  seekToRef.current = seekTimeline;

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
  /* eslint-enable react-hooks/refs */
  // ─────────────────────────────────────────────────────────────────────────

  // Reading-text palette follows the surface the card is actually drawn on — the
  // dark-mode toggle OR a dark app theme — so the chosen colour always contrasts
  // with the background. When the user flips the card mode, snap the text colour
  // to a readable default if their current pick isn't in the new set.
  const { darkSurface, textColor: effectiveTextColor } = useReadingSurface();
  const textColorOptions = darkSurface ? DARK_TEXT_COLORS : LIGHT_TEXT_COLORS;
  const handleToggleDarkMode = useCallback(
    (dark: boolean) => {
      setDarkMode(dark);
      const next = dark || theme.isDark ? DARK_TEXT_COLORS : LIGHT_TEXT_COLORS;
      if (!next.some((p) => p.color === textColor)) setTextColor(next[0].color);
    },
    [setDarkMode, setTextColor, textColor, theme.isDark],
  );

  const handleBack = useCallback(
    () => seekTimeline(Math.max(0, position - SKIP_MS)),
    [seekTimeline, position],
  );
  const handleForward = useCallback(
    () => seekTimeline(duration > 0 ? Math.min(duration, position + SKIP_MS) : position + SKIP_MS),
    [seekTimeline, position, duration],
  );

  const isPreview = !!previewRecording;
  const target = previewRecording ?? currentRecording;
  if (!target) return null;

  // In preview mode the engine is busy with another track (a queue), so show a
  // paused/ready state for THIS wird rather than the live engine position.
  const pos = isPreview ? 0 : position;
  const dur = isPreview
    ? (target.duration_seconds ? target.duration_seconds * 1000 : 0)
    : duration;
  const playing = isPreview ? false : isPlaying;
  const loading = isPreview ? false : isLoading;
  const progress = dur > 0 ? pos / dur : 0;

  const task = getTask(target.id);
  const downloaded = isDownloaded(target.id);
  const downloading = task?.status === 'downloading';
  const downloadPercent = Math.min(100, Math.max(0, Math.round((task?.progress ?? 0) * 100)));

  // Both of a wird's ruqyahs share its name, so the type is what tells the two
  // apart once they sit side by side in the Downloads list.
  const handleDownload = () =>
    download(target, isPreview ? (previewDiseaseId ?? 0) : diseaseId, {
      title: wirdTitle ?? '',
      subtitle:
        recordingTypeOf(target) === 'detailed' ? t.disease.typeDetailed : t.disease.typeSummarized,
    });
  const handleCancelDownload = () => cancel(target.id);
  const handlePlayPause = isPreview ? (onPreviewPlay ?? (() => {})) : togglePlay;

  const strings = isArabic ? SETTINGS_STRINGS.ar : SETTINGS_STRINGS.en;

  return (
    <View style={s.container}>
      {/* Drag handle */}
      <View style={s.header}>
        <View style={s.dragHandle} />
      </View>

      {/* Progress slider */}
      <View style={s.sliderSection}>
        <View
          onLayout={onBarLayout}
          style={s.sliderTouch}
          // eslint-disable-next-line react-hooks/refs -- reading the stable, once-created PanResponder's handlers during render is the standard idiom
          {...(isPreview ? {} : panResponder.panHandlers)}
        >
          <View style={s.track}>
            <View style={[s.fill, { width: `${(dragProgress ?? progress) * 100}%` }]} />
          </View>
        </View>
        <View style={s.timeRow}>
          <Text style={s.time}>{formatMillis(pos)}</Text>
          <Text style={s.time}>{formatMillis(dur)}</Text>
        </View>
      </View>

      {/* Controls + action buttons */}
      <View style={[s.controlsSection, { paddingBottom: bottomInset + 12 }]}>
        {/* Playback controls row */}
        <View style={s.controls}>
          <Pressable onPress={isPreview ? undefined : handleBack} hitSlop={8} disabled={isPreview}>
            <Ionicons name="play-back" size={24} color={isPreview ? theme.border : theme.text} />
          </Pressable>
          <Pressable onPress={onPrevious} hitSlop={8} disabled={!hasPrevious}>
            <Ionicons
              name="play-skip-back"
              size={24}
              color={hasPrevious ? theme.text : theme.border}
            />
          </Pressable>
          <Pressable onPress={handlePlayPause} style={s.playBtn}>
            {loading ? (
              <ActivityIndicator color={theme.textOnBrand} />
            ) : (
              <Ionicons name={playing ? 'pause' : 'play'} size={30} color={theme.textOnBrand} />
            )}
          </Pressable>
          <Pressable onPress={onNext} hitSlop={8} disabled={!hasNext}>
            <Ionicons
              name="play-skip-forward"
              size={24}
              color={hasNext ? theme.text : theme.border}
            />
          </Pressable>
          <Pressable onPress={isPreview ? undefined : handleForward} hitSlop={8} disabled={isPreview}>
            <Ionicons name="play-forward" size={24} color={isPreview ? theme.border : theme.text} />
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
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Ionicons
                name={downloaded ? 'checkmark-circle' : 'download-outline'}
                size={20}
                color={theme.primary}
              />
            )}
            <Text style={s.actionLabel} numberOfLines={1}>
              {downloaded ? t.disease.downloaded
                : downloading ? t.disease.downloadingPercent(downloadPercent)
                : t.disease.downloadToListen}
            </Text>
            {downloading && (
              <View style={[s.downloadProgressTrack, isArabic && s.downloadProgressTrackRtl]}>
                <View style={[s.downloadProgressFill, { width: `${downloadPercent}%` }]} />
              </View>
            )}
          </Pressable>

          {/* Playback settings */}
          <Pressable style={s.actionBtn} onPress={() => setShowSettings(true)}>
            <Ionicons name="settings-outline" size={20} color={theme.primary} />
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
                onValueChange={handleToggleDarkMode}
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

            {/* Text colour — horizontal slider of swatches (set follows card mode) */}
            <View style={s.settingsSectionWrap}>
              <Text style={s.settingsSectionTitle}>{strings.colorLabel}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.colorRow}
              >
                {textColorOptions.map((preset) => {
                  const active = effectiveTextColor === preset.color;
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
                      <Text
                        style={[s.colorLabel, active && s.colorLabelActive]}
                        numberOfLines={1}
                      >
                        {isArabic ? preset.label.ar : preset.label.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
    prev.onNext === next.onNext &&
    prev.previewRecording?.id === next.previewRecording?.id &&
    prev.previewDiseaseId === next.previewDiseaseId &&
    prev.wirdTitle === next.wirdTitle
  );
}

export const AudioPlayer = React.memo(AudioPlayerBase, areEqual);
