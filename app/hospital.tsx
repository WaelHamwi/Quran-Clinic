import React, { useCallback, useMemo } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/forms/SearchBar';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CategoryGrid } from '@/components/lists/CategoryGrid';
import { DiseaseList } from '@/components/lists/DiseaseList';
import { GeneralRuqyahButton } from '@/components/players/GeneralRuqyahButton';
import { AudioPlayer } from '@/components/players/AudioPlayer';
import { useCategories } from '@/hooks/useCategories';
import { useDiseaseSearch } from '@/hooks/useDiseaseSearch';
import { useGeneralRuqyah } from '@/hooks/useGeneralRuqyah';
import { usePlayer } from '@/hooks/usePlayer';
import { useRefresh } from '@/hooks/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { categoryRoute } from '@/utils/hospital';
import { palette } from '@/theme/colors';
import { hospitalScreenStyles as s } from '@/styles/hospitalScreen.styles';

export default function HospitalScreen() {
  const { t, isArabic } = useLanguage();
  const router = useRouter();
  const { categories, isLoading, error, refetch } = useCategories();
  const { query, setQuery, results, isSearching, hasQuery } = useDiseaseSearch();
  const { currentRecording } = usePlayer();
  const { playNext, playPrevious, hasPrevious, hasNext, isGeneralMode } = useGeneralRuqyah();
  const { refreshing, onRefresh } = useRefresh(refetch);

  const openCategory = useCallback(
    (slug: string) => {
      const cat = categories.find((c) => c.slug === slug);
      router.push((cat ? categoryRoute(cat) : `/hospital/subcategories/${slug}`) as never);
    },
    [router, categories],
  );
  const openDisease = useCallback(
    (slug: string) => router.push(`/hospital/disease/${slug}`),
    [router],
  );
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const gridHeader = useMemo(
    () => (
      <View style={s.hospitalScreen__gridHeader}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t.hospital.searchPlaceholder}
        />
        <GeneralRuqyahButton />
        <Text style={[s.hospitalScreen__sectionTitle, isArabic && s['hospitalScreen__sectionTitle--rtl']]}>{t.hospital.categories}</Text>
      </View>
    ),
    [query, setQuery, t, isArabic],
  );

  let body: React.ReactNode;
  if (hasQuery) {
    body = isSearching ? (
      <Loader fullScreen message={t.common.loading} />
    ) : (
      <DiseaseList
        diseases={results}
        onItemPress={openDisease}
        ListEmptyComponent={
          <EmptyState icon="search-outline" title={t.hospital.noResults(query)} />
        }
      />
    );
  } else if (isLoading) {
    body = <Loader fullScreen message={t.common.loading} />;
  } else if (error) {
    body = (
      <EmptyState
        icon="cloud-offline-outline"
        title={t.common.error}
        actionLabel={t.common.retry}
        onAction={handleRetry}
      />
    );
  } else {
    body = (
      <CategoryGrid
        categories={categories}
        onItemPress={openCategory}
        ListHeaderComponent={gridHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.brand[500]}
            colors={[palette.brand[500]]}
          />
        }
      />
    );
  }

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.hospital.title} showBack />
      {/* flex: 1 constrains the FlatList so the player panel can sit below it */}
      <View style={{ flex: 1 }}>{body}</View>
      {currentRecording && isGeneralMode && (
        <AudioPlayer
          onPrevious={playPrevious}
          onNext={playNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      )}
    </Screen>
  );
}
