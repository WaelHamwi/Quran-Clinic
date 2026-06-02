import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { DiseaseList } from '@/components/lists/DiseaseList';
import { useFavorites } from '@/hooks/useFavorites';
import { useLanguage } from '@/context/LanguageContext';

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { favorites } = useFavorites();

  const openDisease = useCallback(
    (slug: string) => router.push(`/hospital/disease/${slug}`),
    [router],
  );

  return (
    <Screen edges={['top']}>
      <Header title={t.favorites.title} />
      <DiseaseList
        diseases={favorites}
        onItemPress={openDisease}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title={t.favorites.empty}
            message={t.favorites.emptyDesc}
          />
        }
      />
    </Screen>
  );
}
