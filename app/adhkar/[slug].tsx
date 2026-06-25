import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { AdhkarCounter } from '@/components/lists/AdhkarCounter';
import { useAdhkarItems } from '@/hooks/useAdhkar';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import { flattenAdhkar } from '@/utils/adhkar';
import { palette } from '@/theme/colors';
import { adhkarItemsScreenStyles as s } from '@/styles/adhkarItemsScreen.styles';

export default function AdhkarItemsScreen() {
  const { slug } = useLocalSearchParams() as { slug: string };
  const { t, isArabic } = useLanguage();
  const { category, isLoading, error, refetch } = useAdhkarItems(slug ?? '');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [showDaleel, setShowDaleel] = useState(false);

  // Flatten sections → items once per fetch. Sections flagged `order_randomly`
  // are reshuffled here, so they land in a fresh order each time the screen opens.
  const items = useMemo(() => flattenAdhkar(category), [category]);
  const title = category ? pickText(category.name, isArabic) : t.adhkar.title;

  const item = items[currentIndex] ?? null;
  const isLast = currentIndex >= items.length - 1;
  const image = item?.image ?? null;
  const arabic = item ? pickText(item.text, true) : '';
  const hint = item ? pickText(item.hint, isArabic) : null;
  const daleel = item ? pickText(item.daleel, isArabic) : null;

  const handleCount = useCallback(() => {
    if (!item) return;
    setCount((c) => (c >= item.repetitions ? 0 : c + 1));
  }, [item]);

  const isFirst = currentIndex <= 0;

  const handleNext = useCallback(() => {
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setCount(0);
    setShowDaleel(false);
  }, [isLast]);

  const handlePrevious = useCallback(() => {
    if (isFirst) return;
    setCurrentIndex((i) => i - 1);
    setCount(0);
    setShowDaleel(false);
  }, [isFirst]);

  const toggleDaleel = useCallback(() => setShowDaleel((v) => !v), []);
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
        <EmptyState icon="sparkles-outline" title={t.adhkar.empty} />
      </Screen>
    );
  }

  return (
    <Screen>
      <PatternedBackground />
      <Header title={title} showBack />

      <View style={s.body}>
        {/* ── Dhikr card ─────────────────────────────── */}
        <View style={s.cardWrapper}>
          <View style={s.card}>
            {/* Text + hint + optional daleel + circular counter */}
            <View style={s.cardContent}>
              {image ? (
                <Image source={{ uri: image }} style={s.image} contentFit="contain" />
              ) : null}
              {arabic ? <Text style={s.arabicText}>{arabic}</Text> : null}
              {hint ? <Text style={s.hintText}>{hint}</Text> : null}
              {showDaleel && daleel ? (
                <Text style={s.daleelExpandedText}>{daleel}</Text>
              ) : null}
              <AdhkarCounter
                count={count}
                total={item.repetitions}
                onPress={handleCount}
              />
            </View>

            {/* Daleel toggle button — pinned to card bottom */}
            {daleel ? (
              <Pressable onPress={toggleDaleel} style={s.daleelBtn}>
                <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={14} color={palette.brand[500]} />
                <Text style={s.daleelBtnLabel}>{t.adhkar.daleel}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* ── Bottom panel ────────────────────────────── */}
        <View style={s.bottomPanel}>
          {/* Item position indicator */}
          <View style={s.progressRow}>
            <Text style={s.progressText}>
              {t.adhkar.progress(currentIndex + 1, items.length)}
            </Text>
          </View>

          {/* Next (left) + Previous (right) — Figma 18086:1614 RTL order */}
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
                {isLast ? t.adhkar.done : t.adhkar.next}
              </Text>
            </Pressable>

            <Pressable
              onPress={handlePrevious}
              style={[s.navBtn, isFirst && s.navBtnDisabled]}
              disabled={isFirst}
            >
              <Text style={s.navBtnText}>{t.adhkar.previous}</Text>
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
