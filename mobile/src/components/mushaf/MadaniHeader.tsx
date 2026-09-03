import React, { useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createReaderStyles } from '@/styles/reader.styles';
import { palette } from '@/theme/colors';
import {
  FONT_SCALES,
  FONT_SCALE_LABELS,
  TOTAL_SURAHS,
  fmtTime,
  toEastern,
  type FontScale,
  type ReaderDisplayMode,
} from '@/utils/mushafReader';
import { SeekBar } from '@/components/mushaf/SeekBar';
import { AutoScrollSpeedRow } from '@/components/mushaf/AutoScrollSpeedRow';
import type { AutoScrollSpeed } from '@/hooks/mushaf/useAutoScroll';
import { createStyles } from './MadaniHeader.styles';

type Props = {
  surahName: string | null;
  surahNameArabic: string | null;
  page: number;
  juz: number;
  currentSurahId: number;
  onBack: () => void;
  goToPrevSurah: () => void;
  goToNextSurah: () => void;
  onOpenSearch: () => void;
  flipped: boolean;
  setFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  fontScale: FontScale;
  setFontScale: (s: FontScale) => void;
  fontScaleOpen: boolean;
  setFontScaleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  displayMode: ReaderDisplayMode;
  setDisplayMode: (m: ReaderDisplayMode) => void;
  autoScrollEnabled: boolean;
  /** True while the recitation owns the page, which locks the control out. */
  autoScrollLocked: boolean;
  toggleAutoScroll: () => void;
  autoScrollSpeed: AutoScrollSpeed;
  setAutoScrollSpeed: (s: AutoScrollSpeed) => void;
  hasAudio: boolean;
  positionMillis: number;
  durationMillis: number;
  onSeek: (ms: number) => void;
  onOpenPlayerSettings: () => void;
};

/** Toolbar row: [prev/next surah] [reading-mode segment] [font size?] [flip]
 *  [auto-scroll?] [search] [settings?]. The size control belongs to the
 *  vertical mode alone — 'pages' fits a whole print page to the screen, so its
 *  size is dictated by the page box. */
export function MadaniHeader({
  surahName,
  surahNameArabic,
  page,
  juz,
  currentSurahId,
  onBack,
  goToPrevSurah,
  goToNextSurah,
  onOpenSearch,
  flipped,
  setFlipped,
  fontScale,
  setFontScale,
  fontScaleOpen,
  setFontScaleOpen,
  displayMode,
  setDisplayMode,
  autoScrollEnabled,
  autoScrollLocked,
  toggleAutoScroll,
  autoScrollSpeed,
  setAutoScrollSpeed,
  hasAudio,
  positionMillis,
  durationMillis,
  onSeek,
  onOpenPlayerSettings,
}: Props) {
  const { t, isArabic } = useLanguage();
  const styles = useStyles(createStyles);
  // Toolbar chrome (nav arrows, mode/font/flip/search icons, seek row) reuses
  // the shared reader style tokens instead of redefining them here.
  const toolbar = useStyles(createReaderStyles);
  const { top, left, right } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const toolbarScrollRef = useRef<ScrollView>(null);

  const title = isArabic ? surahNameArabic : (surahName ?? surahNameArabic);
  const pageLabel = isArabic ? toEastern(page) : String(page);
  const juzLabel = isArabic ? toEastern(juz) : String(juz);
  const pageJuzLabel = `${t.madani.page} ${pageLabel} · ${t.madani.juz} ${juzLabel}`;

  return (
    <View
      style={[
        styles.header,
        isLandscape && styles.headerCompact,
        {
          paddingTop: top + (isLandscape ? 4 : 10),
          paddingLeft: 16 + left,
          paddingRight: 16 + right,
        },
      ]}
    >
      <View style={[styles.row, isArabic && styles.rowRtl]}>
        <TouchableOpacity style={styles.navBtn} onPress={onBack} hitSlop={8}>
          <Ionicons
            name={isArabic ? 'chevron-forward' : 'chevron-back'}
            size={22}
            color={palette.mushaf.titleBorderGold}
          />
        </TouchableOpacity>

        {/* Landscape collapses the title+subtitle two-line block onto one
            line — the 15-line page grid is fighting a much shorter viewport
            there, so every text row the header can give back matters. */}
        <View style={styles.center}>
          {isLandscape ? (
            <Text style={styles.title} numberOfLines={1}>
              {title ? `${title} · ` : ''}
              {pageJuzLabel}
            </Text>
          ) : (
            <>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              <Text style={styles.sub}>{pageJuzLabel}</Text>
            </>
          )}
        </View>
      </View>

      {/* Horizontally scrollable — the segment control, autoScroll toggle and
          the rest of the icon set no longer fit a narrow screen's width in
          one static row (that's why the auto-scroll button was unreachable:
          it, and everything after it, rendered off-screen with no way to
          scroll to it). */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={toolbarScrollRef}
        onContentSizeChange={() => {
          if (isArabic) toolbarScrollRef.current?.scrollToEnd({ animated: false });
        }}
        contentContainerStyle={[
          toolbar.navRow,
          toolbar.navRowGrow,
          isArabic && toolbar.rowRtl,
          styles.toolbarCenter,
        ]}
      >
        <TouchableOpacity
          style={[toolbar.navBtn, currentSurahId <= 1 && toolbar.navBtnDisabled]}
          onPress={goToPrevSurah}
          disabled={currentSurahId <= 1}
        >
          <Ionicons
            name={isArabic ? 'chevron-forward' : 'chevron-back'}
            size={20}
            color={palette.mushaf.titleBorderGold}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[toolbar.navBtn, currentSurahId >= TOTAL_SURAHS && toolbar.navBtnDisabled]}
          onPress={goToNextSurah}
          disabled={currentSurahId >= TOTAL_SURAHS}
        >
          <Ionicons
            name={isArabic ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color={palette.mushaf.titleBorderGold}
          />
        </TouchableOpacity>

        {/* Reading mode — 'continuous' scrolls straight down through
            full-width pages (see MadaniVerticalPager); 'pages' flips between
            print pages horizontally, same as a physical Mushaf. */}
        <View style={toolbar.modeSegment}>
          <TouchableOpacity
            style={[toolbar.modeSegmentBtn, displayMode === 'continuous' && toolbar.modeSegmentBtnActive]}
            onPress={() => setDisplayMode('continuous')}
            accessibilityRole="button"
            accessibilityLabel={t.reader.readVertical}
          >
            <Ionicons
              name="swap-vertical"
              size={17}
              color={displayMode === 'continuous' ? palette.text.onBrand : palette.mushaf.titleBorderGold}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[toolbar.modeSegmentBtn, displayMode === 'pages' && toolbar.modeSegmentBtnActive]}
            onPress={() => { setDisplayMode('pages'); setFontScaleOpen(false); }}
            accessibilityRole="button"
            accessibilityLabel={t.reader.readHorizontal}
          >
            <Ionicons
              name="swap-horizontal"
              size={17}
              color={displayMode === 'pages' ? palette.text.onBrand : palette.mushaf.titleBorderGold}
            />
          </TouchableOpacity>
        </View>

        {/* 'pages' fits a whole print page to the screen, so its text size is
            fixed by the page box — there is nothing to resize, and enlarging
            it would push the page past the fold. Vertical mode scrolls, so it
            keeps the control. */}
        {displayMode !== 'pages' && (
          <TouchableOpacity
            style={[toolbar.fontSizeToggle, fontScaleOpen && toolbar.fontSizeToggleActive]}
            onPress={() => setFontScaleOpen((v) => !v)}
          >
            <Ionicons
              name="text-outline"
              size={17}
              color={fontScaleOpen ? palette.text.onBrand : palette.mushaf.titleBorderGold}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[toolbar.flipToggle, flipped && toolbar.flipToggleActive]}
          onPress={() => setFlipped((v) => !v)}
        >
          <Ionicons
            name="sync-outline"
            size={18}
            color={flipped ? palette.text.onBrand : palette.mushaf.titleBorderGold}
          />
        </TouchableOpacity>

        {/* Auto-scroll only makes sense in vertical 'continuous' mode; in
            'pages' the reader flips horizontally between fixed print pages,
            where there is nothing to scroll — so hide the control entirely.
            While the recitation plays it turns the page itself, so the control
            is dimmed out rather than hidden — it comes back on pause. */}
        {displayMode !== 'pages' && (
          <TouchableOpacity
            style={[
              toolbar.autoScrollToggle,
              autoScrollEnabled && toolbar.autoScrollToggleActive,
              autoScrollLocked && toolbar.navBtnDisabled,
            ]}
            onPress={toggleAutoScroll}
            disabled={autoScrollLocked}
            accessibilityRole="button"
            accessibilityState={{ selected: autoScrollEnabled, disabled: autoScrollLocked }}
            accessibilityLabel={t.reader.autoScroll}
          >
            <Ionicons
              name={autoScrollEnabled ? 'pause' : 'play-forward-outline'}
              size={18}
              color={autoScrollEnabled ? palette.text.onBrand : palette.mushaf.titleBorderGold}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={toolbar.modeToggle} onPress={onOpenSearch}>
          <Ionicons name="search-outline" size={18} color={palette.mushaf.titleBorderGold} />
        </TouchableOpacity>

        {!hasAudio && (
          <TouchableOpacity style={toolbar.modeToggle} onPress={onOpenPlayerSettings}>
            <Ionicons name="options-outline" size={18} color={palette.mushaf.titleBorderGold} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {hasAudio && (
        <View style={toolbar.headerSeekRow}>
          <TouchableOpacity style={toolbar.seekSettingsBtn} onPress={onOpenPlayerSettings}>
            <Ionicons name="options-outline" size={16} color={palette.mushaf.titleBorderGold} />
          </TouchableOpacity>
          <Text style={toolbar.headerSeekTime}>{fmtTime(positionMillis)}</Text>
          <View style={{ flex: 1 }}>
            <SeekBar positionMillis={positionMillis} durationMillis={durationMillis} onSeek={onSeek} />
          </View>
          <Text style={toolbar.headerSeekTime}>{fmtTime(durationMillis)}</Text>
        </View>
      )}

      {autoScrollEnabled && displayMode !== 'pages' && (
        <AutoScrollSpeedRow speed={autoScrollSpeed} setSpeed={setAutoScrollSpeed} />
      )}

      {fontScaleOpen && displayMode !== 'pages' && (
        <View style={toolbar.fontSizeRow}>
          {FONT_SCALES.map((scale) => {
            const active = fontScale === scale;
            return (
              <TouchableOpacity
                key={scale}
                style={[toolbar.fontSizeChip, active && toolbar.fontSizeChipActive]}
                onPress={() => { setFontScale(scale); setFontScaleOpen(false); }}
              >
                <Text style={[toolbar.fontSizeChipText, active && toolbar.fontSizeChipTextActive]}>
                  {FONT_SCALE_LABELS[scale]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
