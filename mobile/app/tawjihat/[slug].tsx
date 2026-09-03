import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { TAWJIHAT_ITEMS } from '@/data/tawjihat';
import { createStyles } from '@/styles/tawjihatDetailScreen.styles';

export default function TawjihatDetailScreen() {
  const { slug } = useLocalSearchParams() as { slug: string };
  const { isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  const item = TAWJIHAT_ITEMS.find((i) => i.slug === slug);
  const locale = isArabic ? 'ar' : 'en';

  if (!item) {
    return (
      <Screen>
        <PatternedBackground />
        <Header title="" showBack />
        <EmptyState icon="information-circle-outline" title="Not found" />
      </Screen>
    );
  }

  return (
    <Screen>
      <PatternedBackground />
      <Header title={item.title[locale]} showBack />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>
          <View style={s.illustration}>
            <View style={s.illustrationCircle} />
            <Ionicons name={item.illustrationIcon} size={64} color={theme.primary} />
          </View>
          {item.items.map((listItem, idx) => (
            <View key={idx} style={[s.listRow, isArabic && s['listRow--rtl']]}>
              <Text style={s.bullet}>
                {item.listType === 'numbered' ? `${idx + 1}.` : '•'}
              </Text>
              <Text style={[s.listText, isArabic ? s['listText--rtl'] : s['listText--ltr']]}>
                {listItem[locale]}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
