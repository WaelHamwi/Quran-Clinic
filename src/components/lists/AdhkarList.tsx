import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { spacing } from '@/theme/spacing';
import { AdhkarItemRow } from '@/components/lists/AdhkarItemRow';
import type { AdhkarItem } from '@/types/adhkar';

interface AdhkarListProps {
  items: AdhkarItem[];
  counters: Record<number, number>;
  onCount: (id: number, repetitions: number) => void;
  ListEmptyComponent?: React.ReactElement;
}

export function AdhkarList({ items, counters, onCount, ListEmptyComponent }: AdhkarListProps) {
  const renderItem = useCallback<ListRenderItem<AdhkarItem>>(
    ({ item, index }) => (
      <AdhkarItemRow
        item={item}
        index={index}
        count={counters[item.id] ?? 0}
        onCount={onCount}
      />
    ),
    [counters, onCount],
  );
  const keyExtractor = useCallback((item: AdhkarItem) => String(item.id), []);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      extraData={counters}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={8}
      windowSize={5}
      initialNumToRender={6}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, flexGrow: 1 },
  separator: { height: spacing.md },
});
