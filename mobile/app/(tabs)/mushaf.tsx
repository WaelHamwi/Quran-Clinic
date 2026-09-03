import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { SurahItem } from '@/components/lists/SurahItem';
import { ReciterPickerModal } from '@/components/mushaf/ReciterPickerModal';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMushafScreen } from '@/hooks/mushaf/useMushafScreen';
import { useMushafListSearch } from '@/hooks/mushaf/useMushafListSearch';
import {
  getAllMadaniPageBookmarks,
  removeMadaniPageBookmark,
  type MadaniPageBookmark,
} from '@/services/mushaf/bookmarks';
import { getMadaniLastPage } from '@/services/mushaf/lastRead';
import {
  getAllReadSurahs,
  markSurahRead,
  unmarkSurahRead,
  type ReadSurah,
} from '@/services/mushaf/readSurahs';
import { createMushafStyles } from '@/styles/mushaf.styles';
import { splitByMatch } from '@/utils/verseHighlight';
import { surahForPage, surahPageRange } from '@/utils/qcf4Verse';
import type { Surah } from '@/types/surah';
import type { Verse } from '@/types/verse';

type ReadingRow =
  | { kind: 'page'; bookmark: MadaniPageBookmark }
  | { kind: 'read'; read: ReadSurah };

export default function MushafScreen() {
  const { theme } = useTheme();
  const { t, language, isArabic } = useLanguage();
  const [activeTab, setActiveTab] = useState<'mushaf' | 'myReadings'>('mushaf');
  const { top } = useSafeAreaInsets();
  const styles = useMemo(() => createMushafStyles(theme), [theme]);

  const {
    showReciterPicker, setShowReciterPicker,
    searchQuery, setSearchQuery,
    reciterSearch, setReciterSearch,
    surahs, filteredSurahs, filteredReciters,
    selectedReciterId, selectedReciter,
    surahsLoading, surahsError,
    isFetchingNextPage, isSurahsRefetching,
    isSearching,
    handleRefresh, closeReciterPicker, handleReciterSelect,
    handleEndReached, handleSurahPress, warmReaderForPage, fetchNextPage,
  } = useMushafScreen();

  const verseSearch = useMushafListSearch();

  const router = useRouter();

  // "My Readings" merges two independent concepts: real per-page bookmarks (added
  // from the in-reader bookmark FAB, one store) and whole-surah "read" marks (added
  // from the surah-list icon, a separate store) — they used to share one store via
  // a fake page-0 bookmark, which meant un-marking a surah as read deleted every
  // real page bookmark in it. Reload both each time the tab regains focus so marks
  // added inside the reader appear here immediately.
  const [pageBookmarks, setPageBookmarks] = useState<MadaniPageBookmark[]>([]);
  const [readSurahs, setReadSurahs] = useState<ReadSurah[]>([]);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  useFocusEffect(
    useCallback(() => {
      getAllMadaniPageBookmarks().then(setPageBookmarks).catch(() => {});
      getAllReadSurahs().then(setReadSurahs).catch(() => {});
      getMadaniLastPage().then(setLastReadPage).catch(() => {});
    }, [])
  );

  // The surah-list icon only toggles the "read" mark — it never touches real page
  // bookmarks, so it can't delete them.
  const isSurahRead = useCallback(
    (surahId: number) => readSurahs.some((r) => r.surahId === surahId),
    [readSurahs]
  );
  const toggleSurahRead = useCallback(
    async (surah: Surah) => {
      const next = readSurahs.some((r) => r.surahId === surah.id)
        ? await unmarkSurahRead(surah.id)
        : await markSurahRead(surah.id);
      setReadSurahs(next);
    },
    [readSurahs]
  );

  const surahMap = useMemo(() => new Map(surahs.map((s) => [s.id, s])), [surahs]);
  const surahLabel = useCallback(
    (id: number) => {
      const s = surahMap.get(id);
      if (!s) return `${t.reader.surah} ${id}`;
      return language === 'ar' ? s.name.ar : (s.name.en ?? s.name.ar);
    },
    [surahMap, language, t]
  );

  const renderSurah = useCallback(
    ({ item }: { item: Surah }) => (
      <SurahItem
        item={item}
        onPress={handleSurahPress}
        isRead={isSurahRead(item.id)}
        onToggleRead={toggleSurahRead}
      />
    ),
    [handleSurahPress, isSurahRead, toggleSurahRead]
  );

  const handleRemoveBookmark = useCallback(async (item: MadaniPageBookmark) => {
    const next = await removeMadaniPageBookmark(item.page);
    setPageBookmarks(next);
  }, []);

  const handleUnmarkRead = useCallback(async (surahId: number) => {
    const next = await unmarkSurahRead(surahId);
    setReadSurahs(next);
  }, []);

  // Unifies the two stores into one newest-first list for display, without
  // conflating them — each row still knows (and acts on) its own concept.
  const readingRows = useMemo<ReadingRow[]>(() => {
    const rows: ReadingRow[] = [
      ...pageBookmarks.map((bookmark) => ({ kind: 'page' as const, bookmark })),
      ...readSurahs.map((read) => ({ kind: 'read' as const, read })),
    ];
    rows.sort((a, b) => {
      const at = a.kind === 'page' ? a.bookmark.createdAt : a.read.markedAt;
      const bt = b.kind === 'page' ? b.bookmark.createdAt : b.read.markedAt;
      return bt.localeCompare(at);
    });
    return rows;
  }, [pageBookmarks, readSurahs]);

  // The Madani reader saves its position as an absolute 1-604 print page; the
  // surah owning it is resolved for the label and the surah-scoped route param.
  const lastReadSurahId = useMemo(
    () => (lastReadPage != null ? surahForPage(lastReadPage) : null),
    [lastReadPage]
  );

  const renderReadingRow = useCallback(
    ({ item }: { item: ReadingRow }) => {
      const surahId = item.kind === 'page' ? item.bookmark.surahId : item.read.surahId;
      const metaText = item.kind === 'page'
        ? `${t.madani.page} ${item.bookmark.page}`
        : t.mushaf.markedAsRead;
      const onRemove = () =>
        item.kind === 'page' ? handleRemoveBookmark(item.bookmark) : handleUnmarkRead(surahId);
      const warmPage = item.kind === 'page' ? item.bookmark.page : surahPageRange(surahId).firstPage;
      const href = item.kind === 'page'
        ? `/mushaf/${surahId}?page=${item.bookmark.page}`
        : `/mushaf/${surahId}`;

      return (
        <TouchableOpacity
          style={[styles.readRow, isArabic && { flexDirection: 'row-reverse' }]}
          onPress={() => { warmReaderForPage(warmPage); router.push(href as never); }}
          activeOpacity={0.7}
        >
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onRemove(); }}
            hitSlop={8}
          >
            <Ionicons name="bookmark" size={18} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.readRowTexts}>
            <Text style={styles.readRowTitle} numberOfLines={1}>{surahLabel(surahId)}</Text>
            <Text style={styles.readRowMeta}>{metaText}</Text>
          </View>
          <Ionicons
            name={isArabic ? 'chevron-back' : 'chevron-forward'}
            size={16}
            color={theme.textMuted}
          />
        </TouchableOpacity>
      );
    },
    [styles, isArabic, router, surahLabel, t, theme, handleRemoveBookmark, handleUnmarkRead, warmReaderForPage]
  );

  const renderVerseResult = useCallback(
    ({ item }: { item: Verse }) => (
      <TouchableOpacity
        style={[styles.readRow, isArabic && { flexDirection: 'row-reverse' }]}
        onPress={() => verseSearch.handleResultPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.readRowTexts}>
          <Text style={styles.readRowTitle} numberOfLines={2}>
            {splitByMatch(item.text.ar, verseSearch.verseQuery).map((seg, i) =>
              seg.match ? (
                <Text key={i} style={styles.readRowTitleMatch}>{seg.text}</Text>
              ) : (
                seg.text
              )
            )}
          </Text>
          <Text style={styles.readRowMeta}>{t.reader.verseRef(item.surah_id, item.verse_number)}</Text>
        </View>
        <Ionicons
          name={isArabic ? 'chevron-back' : 'chevron-forward'}
          size={16}
          color={theme.textMuted}
        />
      </TouchableOpacity>
    ),
    [styles, isArabic, verseSearch, t, theme]
  );

  if (surahsLoading) {
    return (
      <View style={styles.root}>
        <PatternedBackground />
        <View style={[styles.body, styles.centered]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>{t.mushaf.loading}</Text>
        </View>
      </View>
    );
  }

  if (surahsError && surahs.length === 0) {
    return (
      <View style={styles.root}>
        <PatternedBackground />
        <View style={[styles.body, styles.centered]}>
          <Text style={styles.errorText}>{t.mushaf.error}</Text>
          <TouchableOpacity style={styles.retryRow} onPress={handleRefresh}>
            <Text style={styles.retryText}>{t.common.retry}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PatternedBackground />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: top }]}>
        {/* Greeting row */}
        <View style={styles.headerRow}>
          <View style={styles.headerRight}>
            <Text style={styles.greetingText}>{t.mushaf.greeting}</Text>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>✦</Text>
            </View>
          </View>
        </View>

        {/* Tab switcher: قراءاتي | المصحف */}
        <View style={styles.tabRow}>
          <View style={styles.tabOuter}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'myReadings' && styles.tabActive]}
              onPress={() => setActiveTab('myReadings')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'myReadings' && styles.tabTextActive]}>
                {t.mushaf.myReadings}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'mushaf' && styles.tabActive]}
              onPress={() => setActiveTab('mushaf')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'mushaf' && styles.tabTextActive]}>
                {t.tabs.mushaf}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <SafeAreaView style={styles.body} edges={['bottom']}>

        {activeTab === 'myReadings' ? (
          /* ── My Readings — real page bookmarks + whole-surah read marks ── */
          readingRows.length === 0 ? (
            <View style={styles.myReadingsWrap}>
              <Ionicons name="bookmark-outline" size={48} color={theme.border} />
              <Text style={styles.myReadingsEmptyText}>{t.mushaf.myReadingsEmpty}</Text>
              <Text style={styles.myReadingsHint}>{t.mushaf.myReadingsEmptyHint}</Text>
            </View>
          ) : (
            <FlatList
              data={readingRows}
              keyExtractor={(item) =>
                item.kind === 'page'
                  ? `page-${item.bookmark.page}`
                  : `read-${item.read.surahId}`
              }
              renderItem={renderReadingRow}
              contentContainerStyle={styles.list}
            />
          )
        ) : (
          <>
            {/* ── Continue reading — jump back to the last saved position ── */}
            {lastReadPage != null && lastReadSurahId != null && (
              <TouchableOpacity
                style={[styles.continueCard, isArabic && { flexDirection: 'row-reverse' }]}
                onPress={() => {
                  warmReaderForPage(lastReadPage);
                  router.push(`/mushaf/${lastReadSurahId}?page=${lastReadPage}` as never);
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="book" size={18} color={theme.primary} />
                <View style={styles.continueCardTexts}>
                  <Text style={styles.continueCardHint}>{t.mushaf.continueReading}</Text>
                  <Text style={styles.continueCardTitle} numberOfLines={1}>
                    {surahLabel(lastReadSurahId)} — {t.madani.page} {lastReadPage}
                  </Text>
                </View>
                <Ionicons
                  name={isArabic ? 'chevron-back' : 'chevron-forward'}
                  size={16}
                  color={theme.primary}
                />
              </TouchableOpacity>
            )}

            {/* ── Reciter chip ───────────────────────────────────────────── */}
            <TouchableOpacity
              style={[styles.reciterChip, selectedReciter ? styles.reciterChipActive : null]}
              onPress={() => setShowReciterPicker(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="mic-outline" size={16} color={selectedReciter ? theme.primary : theme.textMuted} />
              <View style={styles.reciterLabelWrap}>
                <Text style={styles.reciterHint}>{t.mushaf.reciter}</Text>
                <Text
                  style={selectedReciter ? styles.reciterLabel : styles.reciterLabelPlaceholder}
                  numberOfLines={1}
                >
                  {selectedReciter
                    ? (language === 'ar' ? selectedReciter.name.ar : (selectedReciter.name.en ?? selectedReciter.name.ar))
                    : t.mushaf.selectReciter}
                </Text>
              </View>
              <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <ReciterPickerModal
              visible={showReciterPicker}
              onClose={closeReciterPicker}
              filteredReciters={filteredReciters}
              selectedReciterId={selectedReciterId}
              onSelect={handleReciterSelect}
              reciterSearch={reciterSearch}
              onSearchChange={setReciterSearch}
            />

            {/* ── Surah-name search — filters the surah list only ──────────── */}
            <View style={styles.searchRow}>
              <Ionicons name="book-outline" size={16} color={theme.textPlaceholder} />
              <TextInput
                style={styles.searchInput}
                placeholder={t.mushaf.searchPlaceholder}
                placeholderTextColor={theme.textPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlign={isArabic ? 'right' : 'left'}
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel={t.mushaf.searchSurahLabel}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={theme.textPlaceholder} />
                </TouchableOpacity>
              )}
            </View>

            {/* ── Word/verse search — independent full-text search ─────────── */}
            <View style={styles.searchRow}>
              <Ionicons
                name="text-outline"
                size={16}
                color={verseSearch.isVerseSearchActive ? theme.primary : theme.textPlaceholder}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={t.reader.searchPlaceholder}
                placeholderTextColor={theme.textPlaceholder}
                value={verseSearch.verseQuery}
                onChangeText={verseSearch.handleVerseQueryChange}
                onSubmitEditing={verseSearch.handleVerseSubmit}
                textAlign={isArabic ? 'right' : 'left'}
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel={t.mushaf.searchWordLabel}
              />
              {verseSearch.verseQuery.length > 0 && (
                <TouchableOpacity onPress={() => verseSearch.handleVerseQueryChange('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={theme.textPlaceholder} />
                </TouchableOpacity>
              )}
            </View>

            {verseSearch.isVerseSearchActive ? (
              /* ── Verse/word search results ─────────────────────────────── */
              verseSearch.isSearchingVerses ? (
                <ActivityIndicator size="small" color={theme.primary} style={styles.footer} />
              ) : verseSearch.verseResults !== null && verseSearch.verseResults.length === 0 ? (
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>{t.reader.searchEmpty}</Text>
                </View>
              ) : verseSearch.isVerseQueryTooShort ? (
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>{t.reader.searchTooShort}</Text>
                </View>
              ) : (
                <FlatList
                  data={verseSearch.verseResults ?? []}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={renderVerseResult}
                  contentContainerStyle={styles.list}
                  keyboardShouldPersistTaps="handled"
                  onEndReached={verseSearch.loadMoreVerses}
                  onEndReachedThreshold={0.4}
                  ListFooterComponent={
                    verseSearch.isLoadingMoreVerses ? (
                      <ActivityIndicator size="small" color={theme.primary} style={styles.footer} />
                    ) : null
                  }
                />
              )
            ) : (
              /* ── Surah list ───────────────────────────────────────────── */
              <FlatList
                data={filteredSurahs}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderSurah}
                contentContainerStyle={styles.list}
                onEndReached={isSearching ? undefined : handleEndReached}
                onEndReachedThreshold={0.3}
                refreshControl={
                  <RefreshControl
                    refreshing={isSurahsRefetching}
                    onRefresh={handleRefresh}
                    tintColor={theme.primary}
                    colors={[theme.primary]}
                    progressBackgroundColor={theme.surface}
                  />
                }
                ListEmptyComponent={
                  isSearching ? (
                    <View style={styles.centered}>
                      <Text style={styles.emptyText}>{t.mushaf.noResults(searchQuery)}</Text>
                    </View>
                  ) : null
                }
                ListFooterComponent={
                  isFetchingNextPage && !isSearching ? (
                    <ActivityIndicator size="small" color={theme.primary} style={styles.footer} />
                  ) : surahsError && surahs.length > 0 && !isSearching ? (
                    <TouchableOpacity style={styles.retryRow} onPress={() => fetchNextPage()}>
                      <Text style={styles.retryText}>{t.mushaf.retryLoad}</Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
            )}
          </>
        )}

      </SafeAreaView>
    </View>
  );
}
