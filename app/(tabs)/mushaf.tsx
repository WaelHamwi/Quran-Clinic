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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme/colors';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { SurahItem } from '@/components/lists/SurahItem';
import { ReciterPickerModal } from '@/components/mushaf/ReciterPickerModal';
import { OptionPickerSheet } from '@/components/mushaf/OptionPickerSheet';
import type { PickerOption } from '@/components/mushaf/OptionPickerSheet';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMushafScreen } from '@/hooks/useMushafScreen';
import type { SurahTypeFilter, DisplayMode } from '@/hooks/useMushafScreen';
import { useReadings } from '@/hooks/useReadings';
import { createMushafStyles } from '@/styles/mushaf.styles';
import type { Surah } from '@/types/surah';

export default function MushafScreen() {
  const { theme } = useTheme();
  const { t, language, isArabic } = useLanguage();
  const [activeTab, setActiveTab] = useState<'mushaf' | 'myReadings'>('mushaf');
  const { top } = useSafeAreaInsets();
  const styles = useMemo(() => createMushafStyles(theme), [theme]);

  const {
    showReciterPicker, setShowReciterPicker,
    showSurahFilter, setShowSurahFilter,
    showDisplayMode, setShowDisplayMode,
    searchQuery, setSearchQuery,
    reciterSearch, setReciterSearch,
    surahTypeFilter, setSurahTypeFilter,
    displayMode, setDisplayMode,
    surahs, filteredSurahs, filteredReciters,
    selectedReciterId, selectedReciter,
    surahsLoading, surahsError,
    isFetchingNextPage, isSurahsRefetching,
    isSearching,
    handleRefresh, closeReciterPicker, handleReciterSelect,
    handleEndReached, handleSurahPress, fetchNextPage,
  } = useMushafScreen();

  const { readSurahs, isRead, toggleRead } = useReadings();

  const renderSurah = useCallback(
    ({ item }: { item: Surah }) => (
      <SurahItem
        item={item}
        onPress={handleSurahPress}
        isRead={isRead(item.id)}
        onToggleRead={toggleRead}
      />
    ),
    [handleSurahPress, isRead, toggleRead]
  );

  // Surah filter options
  const surahFilterOptions: PickerOption<SurahTypeFilter>[] = useMemo(() => [
    { value: 'all',     label: t.mushaf.filterAll },
    { value: 'meccan',  label: t.mushaf.filterMeccan },
    { value: 'medinan', label: t.mushaf.filterMedinan },
  ], [t]);

  // Display / sort options
  const displayOptions: PickerOption<DisplayMode>[] = useMemo(() => [
    { value: 'order', label: t.mushaf.displayByOrder },
    { value: 'alpha', label: t.mushaf.displayAlpha },
  ], [t]);

  // Dynamic label for filter button (shows active selection)
  const surahFilterLabel =
    surahTypeFilter === 'meccan' ? t.mushaf.meccan :
    surahTypeFilter === 'medinan' ? t.mushaf.medinan :
    t.mushaf.surahs;

  // Dynamic label for display button
  const displayLabel =
    displayMode === 'alpha' ? t.mushaf.displayAlpha : t.mushaf.displayMode;

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
          /* ── My Readings ──────────────────────────────────────────────── */
          readSurahs.length === 0 ? (
            <View style={styles.myReadingsWrap}>
              <Ionicons name="bookmark-outline" size={48} color={palette.border.primary} />
              <Text style={styles.myReadingsEmptyText}>{t.mushaf.myReadingsEmpty}</Text>
              <Text style={styles.myReadingsHint}>{t.mushaf.myReadingsEmptyHint}</Text>
            </View>
          ) : (
            <FlatList
              data={readSurahs}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderSurah}
              contentContainerStyle={styles.list}
            />
          )
        ) : (
          <>
            {/* ── Filter row: "السور" | "طريقة العرض" ──────────────────── */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={styles.filterLeft}
                onPress={() => setShowSurahFilter(true)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={surahTypeFilter !== 'all' ? palette.brand[500] : palette.text.tertiary}
                />
                <Text style={[
                  styles.filterLabel,
                  surahTypeFilter !== 'all' && styles.filterLabelActive,
                ]}>
                  {surahFilterLabel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterRight}
                onPress={() => setShowDisplayMode(true)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="swap-vertical-outline"
                  size={14}
                  color={displayMode !== 'order' ? palette.brand[500] : palette.text.tertiary}
                />
                <Text style={[
                  styles.filterLabel,
                  displayMode !== 'order' && styles.filterLabelActive,
                ]}>
                  {displayLabel}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Reciter chip ───────────────────────────────────────────── */}
            <TouchableOpacity
              style={[styles.reciterChip, selectedReciter ? styles.reciterChipActive : null]}
              onPress={() => setShowReciterPicker(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="mic-outline" size={16} color={selectedReciter ? palette.brand[500] : palette.text.tertiary} />
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
              <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={16} color={palette.text.tertiary} />
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

            {/* ── Surah type filter sheet ─────────────────────────────────── */}
            <OptionPickerSheet<SurahTypeFilter>
              visible={showSurahFilter}
              onClose={() => setShowSurahFilter(false)}
              title={t.mushaf.surahFilterTitle}
              options={surahFilterOptions}
              selected={surahTypeFilter}
              onSelect={setSurahTypeFilter}
            />

            {/* ── Display / sort sheet ────────────────────────────────────── */}
            <OptionPickerSheet<DisplayMode>
              visible={showDisplayMode}
              onClose={() => setShowDisplayMode(false)}
              title={t.mushaf.displayTitle}
              options={displayOptions}
              selected={displayMode}
              onSelect={setDisplayMode}
            />

            {/* ── Surah search ───────────────────────────────────────────── */}
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={16} color={palette.text.placeholder} />
              <TextInput
                style={styles.searchInput}
                placeholder={t.mushaf.searchPlaceholder}
                placeholderTextColor={palette.text.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlign={isArabic ? 'right' : 'left'}
                returnKeyType="search"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={palette.text.placeholder} />
                </TouchableOpacity>
              )}
            </View>

            {/* ── Surah list ─────────────────────────────────────────────── */}
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
          </>
        )}

      </SafeAreaView>
    </View>
  );
}
