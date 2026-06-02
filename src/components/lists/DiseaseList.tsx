import React, { useCallback } from 'react';
import { FlatList, StyleSheet, type ListRenderItem, type RefreshControlProps } from 'react-native';
import { spacing } from '@/theme/spacing';
import { DiseaseCard } from '@/components/lists/DiseaseCard';
import type { Disease } from '@/types/disease';

interface DiseaseListProps {
  diseases: Disease[];
  onItemPress: (slug: string) => void;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function DiseaseList({
  diseases,
  onItemPress,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshControl,
}: DiseaseListProps) {
  const renderItem = useCallback<ListRenderItem<Disease>>(
    ({ item }) => (
      <DiseaseCard
        disease={item}
        onPress={onItemPress}
      />
    ),
    [onItemPress],
  );
  const keyExtractor = useCallback((item: Disease) => String(item.id), []);

  return (
    <FlatList
      data={diseases}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  row: { gap: spacing.md },
});
