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
import { SearchResultList } from '@/components/lists/SearchResultList';
import { GeneralRuqyahButton } from '@/components/players/GeneralRuqyahButton';
import { useCategories } from '@/hooks/hospital/useCategories';
import { useHospitalSearch } from '@/hooks/hospital/useHospitalSearch';
import { useRefresh } from '@/hooks/common/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { categoryRoute } from '@/utils/hospital';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/hospitalScreen.styles';

export default function HospitalScreen() {
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const router = useRouter();
  const { categories, isLoading, error, refetch } = useCategories();
  const { query, setQuery, results, isSearching, hasQuery } = useHospitalSearch(categories);
  const { refreshing, onRefresh } = useRefresh(refetch);

  const openCategory = useCallback(
    (slug: string) => {
      const cat = categories.find((c) => c.slug === slug);
      router.push((cat ? categoryRoute(cat) : `/hospital/subcategories/${slug}`) as never);
    },
    [router, categories],
  );
  const openResult = useCallback(
    (route: string) => router.push(route as never),
    [router],
  );
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Header shown above the category grid only in browse mode — the search bar
  // itself is rendered persistently outside the swappable body (see below).
  const gridHeader = useMemo(
    () => (
      <View style={s.hospitalScreen__gridHeader}>
        <GeneralRuqyahButton />
        <Text style={[s.hospitalScreen__sectionTitle, isArabic && s['hospitalScreen__sectionTitle--rtl']]}>{t.hospital.categories}</Text>
      </View>
    ),
    [t, isArabic, s],
  );

  // Only the content area swaps; the search bar above it stays mounted so typing
  // never dismisses the keyboard or feels like an unexpected navigation.
  let body: React.ReactNode;
  if (hasQuery) {
    body = isSearching ? (
      <Loader message={t.common.loading} />
    ) : (
      <SearchResultList
        results={results}
        onItemPress={openResult}
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
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />
    );
  }

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.hospital.title} showBack />
      <View style={s.hospitalScreen__searchBar}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t.hospital.searchPlaceholder}
        />
      </View>
      <View style={{ flex: 1 }}>{body}</View>
    </Screen>
  );
}
