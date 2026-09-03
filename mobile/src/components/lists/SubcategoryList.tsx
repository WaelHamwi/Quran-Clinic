import React, { useCallback } from 'react';
import { FlatList, type ListRenderItem, type RefreshControlProps } from 'react-native';
import { useStyles } from '@/hooks/common/useStyles';
import { SubcategoryCard } from '@/components/lists/SubcategoryCard';
import type { Subcategory } from '@/types/category';
import { createStyles } from './SubcategoryList.styles';

interface SubcategoryListProps {
  subcategories: Subcategory[];
  onItemPress: (slug: string) => void;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function SubcategoryList({
  subcategories,
  onItemPress,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshControl,
}: SubcategoryListProps) {
  const styles = useStyles(createStyles);
  const renderItem = useCallback<ListRenderItem<Subcategory>>(
    ({ item }) => <SubcategoryCard subcategory={item} onPress={onItemPress} />,
    [onItemPress],
  );
  const keyExtractor = useCallback((item: Subcategory) => String(item.id), []);

  return (
    <FlatList
      data={subcategories}
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
