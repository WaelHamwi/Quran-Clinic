import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { SubcategoryList } from '@/components/lists/SubcategoryList';
import { SearchBar } from '@/components/forms/SearchBar';
import { useCategory } from '@/hooks/hospital/useCategory';
import { useRefresh } from '@/hooks/common/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { pickText } from '@/utils/formatters';
import { categoryIsDirect, categoryIsDiseaseDirect, subcategoryRoute } from '@/utils/hospital';
import { createStyles } from '@/styles/subcategoriesScreen.styles';

export default function SubcategoriesScreen() {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const router = useRouter();
  const { category, subcategories, isLoading, error, refetch } = useCategory(slug);
  const { refreshing, onRefresh } = useRefresh(refetch);
  const [query, setQuery] = useState('');

  // Guard: redirect to the appropriate screen based on the category type.
  useEffect(() => {
    if (!category) return;
    if (categoryIsDirect(category)) {
      router.replace(`/hospital/recordings/${slug}` as never);
    } else if (categoryIsDiseaseDirect(category)) {
      router.replace(`/hospital/diseases/${slug}?level=category` as never);
    }
  }, [category, slug, router]);

  const filtered = useMemo(() => {
    if (!query.trim()) return subcategories;
    const q = query.toLowerCase();
    return subcategories.filter(s => pickText(s.name, isArabic).toLowerCase().includes(q));
  }, [subcategories, query, isArabic]);

  // A subcategory with recordings directly (no diseases) opens recordings;
  // otherwise it opens its disease list.
  const openSubcategory = useCallback(
    (sub: string) => {
      const target = subcategories.find((x) => x.slug === sub);
      router.push((target ? subcategoryRoute(target) : `/hospital/diseases/${sub}`) as never);
    },
    [router, subcategories],
  );
  const handleRetry = useCallback(() => refetch(), [refetch]);

  const title = category ? pickText(category.name, isArabic) : t.hospital.subcategories;

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
