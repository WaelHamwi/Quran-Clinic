import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { DiseaseList } from '@/components/lists/DiseaseList';
import { SearchBar } from '@/components/forms/SearchBar';
import { useSubcategory } from '@/hooks/hospital/useSubcategory';
import { useCategory } from '@/hooks/hospital/useCategory';
import { useRefresh } from '@/hooks/common/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { pickText } from '@/utils/formatters';
import { createStyles } from '@/styles/diseasesScreen.styles';

export default function DiseasesScreen() {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const level = params.level === 'category' ? 'category' : 'subcategory';
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const router = useRouter();

  // Both hooks are always called; only one is enabled at a time via the slug guard.
  const subQ = useSubcategory(level === 'subcategory' ? slug : '');
  const catQ = useCategory(level === 'category' ? slug : '');

  const isLoading = level === 'category' ? catQ.isLoading : subQ.isLoading;
  const error = level === 'category' ? catQ.error : subQ.error;
  const refetch = level === 'category' ? catQ.refetch : subQ.refetch;
  const diseases = level === 'category' ? catQ.directDiseases : subQ.diseases;
  const title = level === 'category'
    ? (catQ.category ? pickText(catQ.category.name, isArabic) : t.hospital.diseases)
    : (subQ.subcategory ? pickText(subQ.subcategory.name, isArabic) : t.hospital.diseases);

  const { refreshing, onRefresh } = useRefresh(refetch);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return diseases;
    const q = query.toLowerCase();
    return diseases.filter(d => pickText(d.name, isArabic).toLowerCase().includes(q));
  }, [diseases, query, isArabic]);

  const openDisease = useCallback(
    (s: string) => router.push(`/hospital/disease/${s}`),
    [router],
  );
  const handleRetry = useCallback(() => refetch(), [refetch]);

  return (
    <Screen>
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
          <View style={s.searchBar}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t.hospital.searchPlaceholder}
            />
          </View>
          <DiseaseList
            diseases={filtered}
            onItemPress={openDisease}
            ListEmptyComponent={
              <EmptyState icon="leaf-outline" title={t.hospital.emptyCategory} />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            }
          />
        </>
      )}
    </Screen>
  );
}
