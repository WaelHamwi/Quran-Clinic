import React, { useCallback } from 'react';
import { FlatList, type ListRenderItem , RefreshControlProps } from 'react-native';
import { CategoryCard } from '@/components/lists/CategoryCard';
import { useStyles } from '@/hooks/common/useStyles';
import type { Category } from '@/types/category';
import { createStyles } from './CategoryGrid.styles';

interface CategoryGridProps {
  categories: Category[];
  onItemPress: (slug: string) => void;
  ListHeaderComponent?: React.ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function CategoryGrid({ categories, onItemPress, ListHeaderComponent, refreshControl }: CategoryGridProps) {
  const s = useStyles(createStyles);
  const renderItem = useCallback<ListRenderItem<Category>>(
    ({ item }) => <CategoryCard category={item} onPress={onItemPress} />,
    [onItemPress],
  );
  const keyExtractor = useCallback((item: Category) => String(item.id), []);

  return (
    <FlatList
      data={categories}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={s.categoryGrid__content}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
    />
  );
}
