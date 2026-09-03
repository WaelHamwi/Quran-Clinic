import React, { useCallback } from 'react';
import { FlatList, RefreshControl, type ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { TahsinatCategoryCard } from '@/components/lists/TahsinatCategoryCard';
import { useTahsinatCategories } from '@/hooks/content/useTahsinat';
import { useRefresh } from '@/hooks/common/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import type { TahsinatCategory } from '@/types/tahsinat';
import { createStyles } from '@/styles/tahsinatScreen.styles';

export default function TahsinatScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const router = useRouter();
  const { categories, isLoading, error, refetch } = useTahsinatCategories();

  const openCategory = useCallback(
    (slug: string) => router.push(`/tahsinat/${slug}` as any),
    [router],
  );

  const renderItem = useCallback<ListRenderItem<TahsinatCategory>>(
    ({ item }) => <TahsinatCategoryCard category={item} onPress={openCategory} />,
    [openCategory],
  );

  const keyExtractor = useCallback((item: TahsinatCategory) => String(item.id), []);
  const handleRetry = useCallback(() => refetch(), [refetch]);
  const { refreshing, onRefresh } = useRefresh(refetch);

  let body: React.ReactNode;
  if (isLoading) {
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
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={5}
        initialNumToRender={6}
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
    <Screen>
      <PatternedBackground />
      <Header title={t.tahsinat.title} showBack />
      {body}
    </Screen>
  );
}
