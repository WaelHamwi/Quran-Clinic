import React, { useCallback } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { SponsorCard } from '@/components/lists/SponsorCard';
import { useSponsors } from '@/hooks/useSponsors';
import { useLanguage } from '@/context/LanguageContext';
import { sponsorsScreenStyles as s } from '@/styles/sponsorsScreen.styles';
import type { Sponsor } from '@/types/sponsor';

export default function SponsorsScreen() {
  const { t } = useLanguage();
  const { sponsors, isLoading } = useSponsors();

  const renderItem = useCallback<ListRenderItem<Sponsor>>(
    ({ item }) => <SponsorCard sponsor={item} />,
    [],
  );

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.sponsors.title} />
      {isLoading ? (
        <Loader fullScreen message={t.common.loading} />
      ) : (
        <FlatList
          data={sponsors}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          ListEmptyComponent={<EmptyState icon="business-outline" title={t.sponsors.empty} />}
        />
      )}
    </Screen>
  );
}
