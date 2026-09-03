import React, { useCallback } from 'react';
import { RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { FavoriteList } from '@/components/lists/FavoriteList';
import { PlayAllFavoritesButton } from '@/components/players/PlayAllFavoritesButton';
import { useFavorites } from '@/hooks/content/useFavorites';
import { useRefresh } from '@/hooks/common/useRefresh';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/favorites.styles';

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, reorderFavorites, refreshFavorites } = useFavorites();
  const { refreshing, onRefresh } = useRefresh(refreshFavorites);
  const firstName = user?.name?.split(' ')[0] ?? null;

  // Favoriting is itself the explicit choice the intro sheet asks for, so opening
  // a wird from here goes straight in — the sheet still gates every other entry.
  const openFavorite = useCallback(
    (route: string) => router.push(`${route}${route.includes('?') ? '&' : '?'}skipIntro=1` as never),
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />
    </Screen>
  );
}
