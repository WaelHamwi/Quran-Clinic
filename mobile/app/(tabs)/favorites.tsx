import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { FavoriteList } from '@/components/lists/FavoriteList';
import { PlayAllFavoritesButton } from '@/components/players/PlayAllFavoritesButton';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { favoritesStyles as s } from '@/styles/favorites.styles';

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, reorderFavorites } = useFavorites();
  const firstName = user?.name?.split(' ')[0] ?? null;

  const openFavorite = useCallback(
    (route: string) => router.push(route as never),
    [router],
  );
  const handleSearchPress = useCallback(() => router.push('/hospital'), [router]);

  return (
    <Screen edges={[]}>
      <PatternedBackground />
      <Header variant="homepage" userName={firstName} onSearchPress={handleSearchPress} />
      <FavoriteList
        favorites={favorites}
        onItemPress={openFavorite}
        onReorder={reorderFavorites}
        ListHeaderComponent={
          favorites.length > 0 ? (
            <View style={s.playAllWrap}>
              <PlayAllFavoritesButton />
            </View>
          ) : undefined
        }
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
