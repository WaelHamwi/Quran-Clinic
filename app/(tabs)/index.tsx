import React, { useCallback, useMemo, useState } from 'react';
import { DevSettings, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CategoryGrid } from '@/components/lists/CategoryGrid';
import { DiseaseList } from '@/components/lists/DiseaseList';
import { HomeSectionPills } from '@/components/lists/HomeSectionPills';
import { GeneralRuqyahButton } from '@/components/players/GeneralRuqyahButton';
import { useCategories } from '@/hooks/useCategories';
import { useDiseaseSearch } from '@/hooks/useDiseaseSearch';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { offlineStorage } from '@/services/offlineStorage';
import { homeScreenStyles as s } from '@/styles/homeScreen.styles';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const firstName = user?.name?.split(' ')[0] ?? null;

  const { categories, isLoading, error, refetch } = useCategories();
  const { query, results, isSearching, hasQuery } = useDiseaseSearch();

  const openCategory = useCallback(
    (slug: string) => router.push(`/hospital/subcategories/${slug}`),
    [router],
  );
  const openDisease = useCallback(
    (slug: string) => router.push(`/hospital/disease/${slug}`),
    [router],
  );
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);
  const handleSearchPress = useCallback(() => router.push('/hospital'), [router]);

  const [isClearing, setIsClearing] = useState(false);
  const handleClearCache = useCallback(async () => {
    setIsClearing(true);
    try {
      queryClient.clear();
      await offlineStorage.clearAll();
      await AsyncStorage.removeItem('mushaf_reciter_id');
      DevSettings.reload();
    } catch {
      setIsClearing(false);
    }
  }, [queryClient]);

  const gridHeader = useMemo(
    () => (
      <View style={s.homeScreen__gridHeader}>
        <View style={s.homeScreen__pillsBleed}>
          <HomeSectionPills />
        </View>
        <GeneralRuqyahButton />
      </View>
    ),
    [],
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
        ListHeaderComponent={
          <View style={s.homeScreen__headerWrap}>
            {gridHeader}
            {__DEV__ ? (
              <View style={s.homeScreen__devSection}>
                <Text style={s.homeScreen__devLabel}>DEV</Text>
                <Pressable
                  style={[s.homeScreen__devClearBtn, isClearing && s['homeScreen__devClearBtn--disabled']]}
                  onPress={handleClearCache}
                  disabled={isClearing}
                >
                  <Text style={s.homeScreen__devClearBtnText}>
                    {isClearing ? 'Clearing...' : 'Clear Cache & Reload'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
      />
    );
  }

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header variant="homepage" userName={firstName} onSearchPress={handleSearchPress} />
      {body}
    </Screen>
  );
}
