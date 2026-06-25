import React, { useCallback } from 'react';
import { FlatList, Pressable, Text, View, type ListRenderItem } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import type { HospitalResultKind, HospitalSearchResult } from '@/hooks/useHospitalSearch';
import { searchResultListStyles as s, ICON_COLOR } from './SearchResultList.styles';

const KIND_ICON: Record<HospitalResultKind, keyof typeof Ionicons.glyphMap> = {
  category: 'grid-outline',
  subcategory: 'folder-outline',
  disease: 'pulse-outline',
};

interface SearchResultListProps {
  results: HospitalSearchResult[];
  onItemPress: (route: string) => void;
  ListEmptyComponent?: React.ReactElement;
}

function ResultIcon({ item }: { item: HospitalSearchResult }) {
  const isUrl = !!item.icon && /^https?:\/\//.test(item.icon);
  const isSvg = isUrl && /\.svg($|\?)/i.test(item.icon as string);
  if (isSvg) {
    return <RemoteSvg uri={item.icon as string} width={28} height={28} color={ICON_COLOR} />;
  }
  if (isUrl) {
    return (
      <Image
        source={{ uri: item.icon as string, headers: { 'ngrok-skip-browser-warning': 'true' } }}
        style={s.iconImage}
        contentFit="contain"
        tintColor={ICON_COLOR}
      />
    );
  }
  return <Ionicons name={KIND_ICON[item.kind]} size={22} color={ICON_COLOR} />;
}

export function SearchResultList({ results, onItemPress, ListEmptyComponent }: SearchResultListProps) {
  const { isArabic, t } = useLanguage();

  const kindLabel = useCallback(
    (kind: HospitalResultKind) => t.hospital.resultKind[kind],
    [t],
  );

  const renderItem = useCallback<ListRenderItem<HospitalSearchResult>>(
    ({ item }) => (
      <Pressable
        onPress={() => onItemPress(item.route)}
        style={({ pressed }) => [s.row, isArabic && s['row--rtl'], pressed && s['row--pressed']]}
      >
        <View style={s.iconBubble}>
          <ResultIcon item={item} />
        </View>
        <View style={s.texts}>
          <Text style={[s.name, isArabic && s['name--rtl']]} numberOfLines={1}>
            {pickText(item.name, isArabic)}
          </Text>
          <Text style={[s.kind, isArabic && s['kind--rtl']]}>{kindLabel(item.kind)}</Text>
        </View>
      </Pressable>
    ),
    [isArabic, onItemPress, kindLabel],
  );

  const keyExtractor = useCallback((item: HospitalSearchResult) => item.key, []);

  return (
    <FlatList
      data={results}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={s.content}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={12}
    />
  );
}
