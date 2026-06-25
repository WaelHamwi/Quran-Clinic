import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { AdhkarCounter } from '@/components/lists/AdhkarCounter';
import { useTahsinatItems } from '@/hooks/useTahsinat';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import { flattenSectioned } from '@/utils/sections';
import { palette } from '@/theme/colors';
import { tahsinatItemsScreenStyles as s } from '@/styles/tahsinatItemsScreen.styles';

export default function TahsinatItemsScreen() {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { t, isArabic } = useLanguage();
  const { category, isLoading, error, refetch } = useTahsinatItems(slug ?? '');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);

  const items = useMemo(() => flattenSectioned(category), [category]);
  const title = category ? pickText(category.name, isArabic) : t.tahsinat.title;

  const item = items[currentIndex] ?? null;
  const isLast = currentIndex >= items.length - 1;
  const isFirst = currentIndex <= 0;
  const label = item ? pickText(item.label, isArabic) : null;
  const arabic = item ? pickText(item.text, true) : '';
  const hint = item ? pickText(item.hint, isArabic) : null;

  const handleCount = useCallback(() => {
    if (!item) return;
    setCount((c) => (c >= item.repetitions ? 0 : c + 1));
  }, [item]);

  const handleNext = useCallback(() => {
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setCount(0);
  }, [isLast]);

  const handlePrevious = useCallback(() => {
    if (isFirst) return;
    setCurrentIndex((i) => i - 1);
    setCount(0);
  }, [isFirst]);

  const handleRetry = useCallback(() => refetch(), [refetch]);

  if (isLoading) {
    return (
      <Screen>
        <PatternedBackground />
        <Header title={title} showBack />
        <Loader fullScreen message={t.common.loading} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <PatternedBackground />
        <Header title={title} showBack />
        <EmptyState
          icon="cloud-offline-outline"
          title={t.common.error}
          actionLabel={t.common.retry}
          onAction={handleRetry}
        />
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <PatternedBackground />
        <Header title={title} showBack />
        <EmptyState icon="shield-checkmark-outline" title={t.tahsinat.empty} />
      </Screen>
    );
  }

  return (
    <Screen>
      <PatternedBackground />
      <Header title={title} showBack />

      <View style={s.body}>
        {/* ── Item card ─────────────────────────────── */}
        <View style={s.cardWrapper}>
          <View style={s.card}>
            <View style={s.cardContent}>
              {label ? <Text style={s.labelText}>{label}</Text> : null}
              {arabic ? <Text style={s.arabicText}>{arabic}</Text> : null}
              {hint ? <Text style={s.hintText}>{hint}</Text> : null}
              <AdhkarCounter
                count={count}
                total={item.repetitions}
                onPress={handleCount}
              />
            </View>
          </View>
        </View>

        {/* ── Bottom panel ────────────────────────────── */}
        <View style={s.bottomPanel}>
          <View style={s.progressRow}>
            <Text style={s.progressText}>
              {t.tahsinat.progress(currentIndex + 1, items.length)}
            </Text>
          </View>

          {/* Next (left) + Previous (right) — RTL order, mirrors Adhkar */}
          <View style={s.navRow}>
            <Pressable
              onPress={handleNext}
              style={[s.navBtn, isLast && s.navBtnDisabled]}
              disabled={isLast}
            >
              <Ionicons
                name={isArabic ? 'arrow-back' : 'arrow-forward'}
                size={20}
                color={palette.brand[500]}
              />
              <Text style={s.navBtnText}>
                {isLast ? t.tahsinat.done : t.tahsinat.next}
              </Text>
            </Pressable>

            <Pressable
              onPress={handlePrevious}
              style={[s.navBtn, isFirst && s.navBtnDisabled]}
              disabled={isFirst}
            >
              <Text style={s.navBtnText}>{t.tahsinat.previous}</Text>
              <Ionicons
                name={isArabic ? 'arrow-forward' : 'arrow-back'}
                size={20}
                color={palette.brand[500]}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}
