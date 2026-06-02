import React, { useCallback } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { AdhkarCategoryCard } from '@/components/lists/AdhkarCategoryCard';
import { useAdhkarCategories } from '@/hooks/useAdhkar';
import { useLanguage } from '@/context/LanguageContext';
import type { AdhkarCategory } from '@/types/adhkar';
import { adhkarScreenStyles as s } from '@/styles/adhkarScreen.styles';

export default function AdhkarScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { categories, isLoading, error, refetch } = useAdhkarCategories();

  const openCategory = useCallback(
    (slug: string) => router.push(`/adhkar/${slug}` as any),
    [router],
  );

  const renderItem = useCallback<ListRenderItem<AdhkarCategory>>(
    ({ item }) => <AdhkarCategoryCard category={item} onPress={openCategory} />,
    [openCategory],
  );

  const keyExtractor = useCallback((item: AdhkarCategory) => String(item.id), []);
  const handleRetry = useCallback(() => refetch(), [refetch]);

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
      />
    );
  }

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.adhkar.title} showBack />
      {body}
    </Screen>
  );
}
