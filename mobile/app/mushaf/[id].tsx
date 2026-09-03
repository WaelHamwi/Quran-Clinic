import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { useMadaniReader } from '@/hooks/mushaf/useMadaniReader';
import { MadaniHeader } from '@/components/mushaf/MadaniHeader';
import { MadaniPager } from '@/components/mushaf/MadaniPager';
import { MadaniVerticalPager } from '@/components/mushaf/MadaniVerticalPager';
import { ReaderPlayer } from '@/components/mushaf/ReaderPlayer';
import { BookmarkSheet } from '@/components/mushaf/BookmarkSheet';
import { VerseSearchModal } from '@/components/mushaf/VerseSearchModal';
import { ReciterPickerModal } from '@/components/mushaf/ReciterPickerModal';
import { PlayerSettingsModal } from '@/components/mushaf/PlayerSettingsModal';
import { READER_GRADIENT_COLORS, createReaderStyles } from '@/styles/reader.styles';
import { createMadaniReaderStyles } from '@/styles/madaniReader.styles';
import { palette } from '@/theme/colors';
import { toEastern } from '@/utils/mushafReader';
import type { MadaniPageBookmark } from '@/services/mushaf/bookmarks';

/** Madina Mushaf (QCF4) reader — print-identical 604-page layout. Thin shell:
 *  logic lives in `useMadaniReader` (page/pager, audio, bookmarks, search).
 *  Fonts stream in per page via `useQcfFonts` (each page fetches only its own
 *  family in the background), so the reader opens immediately — no full-pack
 *  gate. Audio, search, bookmark and settings UI reuse the shared reader
 *  components under `@/components/mushaf`. */
export default function MadaniReaderScreen() {
  const { t } = useLanguage();
  const styles = useStyles(createMadaniReaderStyles);
  const readerStyles = useStyles(createReaderStyles);
  const { left: leftInset, right: rightInset, bottom: bottomInset } = useSafeAreaInsets();
  const r = useMadaniReader();

  return (
    <LinearGradient
      colors={READER_GRADIENT_COLORS}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <View style={styles.contentWrapper}>
        <MadaniHeader
          surahName={r.currentSurahName}
          surahNameArabic={r.currentSurahNameArabic}
          page={r.currentPage}
          juz={r.currentJuz}
          currentSurahId={r.currentSurahId}
          onBack={r.goBack}
          goToPrevSurah={r.goToPrevSurah}
          goToNextSurah={r.goToNextSurah}
          onOpenSearch={() => r.setSearchOpen(true)}
          flipped={r.flipped}
          setFlipped={r.setFlipped}
          fontScale={r.fontScale}
          setFontScale={r.setFontScale}
          fontScaleOpen={r.fontScaleOpen}
          setFontScaleOpen={r.setFontScaleOpen}
          displayMode={r.displayMode}
          setDisplayMode={r.setDisplayMode}
          autoScrollEnabled={r.autoScrollEnabled}
          autoScrollLocked={r.autoScrollLocked}
          toggleAutoScroll={r.toggleAutoScroll}
          autoScrollSpeed={r.autoScrollSpeed}
          setAutoScrollSpeed={r.setAutoScrollSpeed}
          hasAudio={r.hasAudio}
          positionMillis={r.audio.positionMillis}
          durationMillis={r.audio.durationMillis}
          onSeek={r.handleSeek}
          onOpenPlayerSettings={() => r.setPlayerSettingsOpen(true)}
        />

        {/* The app draws edge to edge (android gradle `edgeToEdgeEnabled`), so
            the system navigation bar sits ON TOP of this frame — and the page
            box is measured from the frame, so a page's last line and its page
            number were laid out underneath it. Every system-bar edge is
            reserved here instead: left/right for the 3-button bar, which moves
            to the side in landscape, and bottom for the gesture pill (and for
            the devices that keep the bar at the bottom when rotated). Landscape
            is where it shows worst — the 15-line grid gets a fraction of the
            height there, so a ~48dp strip swallows most of the closing line. */}
        <View
          style={[
            styles.readerFrame,
            {
              marginLeft: 2 + leftInset,
              marginRight: 2 + rightInset,
              marginBottom: 2 + bottomInset,
            },
          ]}
        >
          <View style={readerStyles.readerFrameContent}>
            {/* initialPage stays null until the last-read restore resolves;
                FlatList only honours initialScrollIndex on first mount —
                each pager is remounted (not just re-rendered) whenever
                displayMode flips, so it's passed r.currentPage (kept live
                by onViewableItemsChanged as the user reads) rather than
                r.initialPage, or switching modes mid-surah would jump back
                to wherever the surah was first opened. */}
            {r.initialPage != null &&
              (r.displayMode === 'continuous' ? (
                <MadaniVerticalPager
                  initialPage={r.currentPage}
                  viewabilityConfig={r.viewabilityConfig}
                  onViewableItemsChanged={r.onViewableItemsChanged}
                  highlightVerseKey={r.highlightVerseKey}
                  fontScale={r.fontScale}
                  listRef={r.pagerRef}
                  onScroll={r.onAutoScrollSync}
                  onPagePress={r.handlePagePress}
                />
              ) : (
                <MadaniPager
                  initialPage={r.currentPage}
                  viewabilityConfig={r.viewabilityConfig}
                  onViewableItemsChanged={r.onViewableItemsChanged}
                  highlightVerseKey={r.highlightVerseKey}
                  listRef={r.pagerRef}
                  onPagePress={r.handlePagePress}
                />
              ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            readerStyles.bookmarkFab,
            r.isCurrentBookmarked && readerStyles.bookmarkFabActive,
            { bottom: r.playerHeight + 20, right: 16 + rightInset },
          ]}
          onPress={() => r.setBookmarkModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={r.isCurrentBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={r.isCurrentBookmarked ? palette.text.onBrand : palette.mushaf.titleBorderGold}
          />
        </TouchableOpacity>
      </View>

      <ReaderPlayer
        currentRecitation={r.currentRecitation}
        isLoadingRecitations={r.isLoadingRecitations}
        isContextReady={r.isContextReady}
        audio={r.audio}
        showAudioError={r.showAudioError}
        showAudioLoadTimeout={r.showAudioLoadTimeout}
        onPlay={r.handlePlay}
        onRetryLoad={r.handleRetryAudio}
        onOpenReciterPicker={() => r.setShowReciterPicker(true)}
        onHeightChange={r.setPlayerHeight}
      />

      <PlayerSettingsModal
        visible={r.playerSettingsOpen}
        onClose={() => r.setPlayerSettingsOpen(false)}
        currentRecitation={r.currentRecitation}
        onOpenReciterPicker={() => r.setShowReciterPicker(true)}
        isCached={r.isCached}
        isDownloading={r.isDownloading}
        downloadProgress={r.downloadProgress}
        onDownload={r.handleDownload}
        endMode={r.audio.endMode}
        onSetEndMode={r.audio.setEndMode}
      />

      <BookmarkSheet<MadaniPageBookmark>
        visible={r.bookmarkModalOpen}
        onClose={() => r.setBookmarkModalOpen(false)}
        currentLabel={`${t.madani.page} ${toEastern(r.currentPage)}`}
        isCurrentBookmarked={r.isCurrentBookmarked}
        onToggleBookmark={r.handleToggleBookmark}
        bookmarks={r.surahBookmarks}
        bookmarkKey={(b) => String(b.page)}
        bookmarkLabel={(b) => `${t.madani.page} ${toEastern(b.page)}`}
        onGoToBookmark={r.handleGoToBookmark}
      />

      <ReciterPickerModal
        visible={r.showReciterPicker}
        onClose={() => { r.setShowReciterPicker(false); r.setReciterSearch(''); }}
        filteredReciters={r.filteredReciters}
        selectedReciterId={r.selectedReciterId}
        onSelect={r.handleReciterSelect}
        reciterSearch={r.reciterSearch}
        onSearchChange={r.setReciterSearch}
      />

      <VerseSearchModal
        visible={r.searchOpen}
        onClose={() => { r.setSearchOpen(false); r.setSearchQuery(''); r.setSearchResults(null); }}
        searchQuery={r.searchQuery}
        setSearchQuery={r.setSearchQuery}
        searchResults={r.searchResults}
        setSearchResults={r.setSearchResults}
        isSearching={r.isSearching}
        isQueryTooShort={r.isQueryTooShort}
        isLoadingMore={r.isLoadingMore}
        onLoadMore={r.loadMore}
        onSearch={r.handleSearch}
        onResultPress={r.handleSearchResultPress}
      />
    </LinearGradient>
  );
}
