import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { SubcategoryList } from '@/components/lists/SubcategoryList';
import { SearchBar } from '@/components/forms/SearchBar';
import { useCategory } from '@/hooks/useCategory';
import { useRefresh } from '@/hooks/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { palette } from '@/theme/colors';
import { pickText } from '@/utils/formatters';
import { spacing } from '@/theme/spacing';

export default function SubcategoriesScreen() {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { t, isArabic } = useLanguage();
  const router = useRouter();
  const { category, subcategories, isLoading, error, refetch } = useCategory(slug);
  const { refreshing, onRefresh } = useRefresh(refetch);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return subcategories;
    const q = query.toLowerCase();
    return subcategories.filter(s => pickText(s.name, isArabic).toLowerCase().includes(q));
  }, [subcategories, query, isArabic]);

  const openSubcategory = useCallback(
    (s: string) => router.push(`/hospital/diseases/${s}`),
    [router],
  );
  const handleRetry = useCallback(() => refetch(), [refetch]);

  const title = category ? pickText(category.name, isArabic) : t.hospital.subcategories;

  return (
    <Screen edges={['top']}>
      <Header title={title} />
      {isLoading ? (
        <Loader fullScreen message={t.common.loading} />
      ) : error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t.common.error}
          actionLabel={t.common.retry}
          onAction={handleRetry}
        />
      ) : (
        <>
          <View style={styles.searchBar}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t.hospital.searchPlaceholder}
            />
          </View>
          <SubcategoryList
            subcategories={filtered}
            onItemPress={openSubcategory}
            ListEmptyComponent={
              <EmptyState icon="folder-open-outline" title={t.hospital.emptyCategory} />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.brand[500]}
                colors={[palette.brand[500]]}
              />
            }
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
