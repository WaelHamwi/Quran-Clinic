import React, { useCallback } from 'react';
import { FlatList, Pressable, Text, View, type ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { TAWJIHAT_ITEMS, type TawjihatItem } from '@/data/tawjihat';
import { createStyles } from '@/styles/tawjihatScreen.styles';

export default function TawjihatScreen() {
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const router = useRouter();

  const openItem = useCallback(
    (slug: string) => router.push(`/tawjihat/${slug}` as any),
    [router],
  );

  const renderItem = useCallback<ListRenderItem<TawjihatItem>>(
    ({ item }) => (
      <Pressable
        onPress={() => openItem(item.slug)}
        style={({ pressed }) => [s.card, pressed && s['card--pressed']]}
      >
        <Ionicons
          name={isArabic ? 'chevron-back' : 'chevron-forward'}
          size={12}
          color={theme.iconMuted}
        />
        <View style={s.cardRight}>
          <Text style={s.cardTitle}>{item.title[isArabic ? 'ar' : 'en']}</Text>
          <View style={s.iconTile}>
            <Ionicons name={item.icon} size={20} color={theme.primary} />
          </View>
        </View>
      </Pressable>
    ),
    [openItem, isArabic, theme, s],
  );

  const keyExtractor = useCallback((item: TawjihatItem) => item.slug, []);

  return (
    <Screen>
      <PatternedBackground />
      <Header title={t.tawjihat.title} showBack />
      {TAWJIHAT_ITEMS.length === 0 ? (
        <EmptyState icon="information-circle-outline" title={t.tawjihat.empty} />
      ) : (
        <FlatList
          data={TAWJIHAT_ITEMS}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        />
      )}
    </Screen>
  );
}
