import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { useFeatureVisibility } from '@/hooks/common/useFeatures';
import { FEATURE_KEYS } from '@/constants/features';
import { createStyles } from './HomeSectionPills.styles';

interface PillProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress?: () => void;
}

function Pill({ label, icon, active, onPress }: PillProps) {
  const { isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const tint = active ? theme.textOnBrand : theme.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.homeSectionPills__pill,
        isArabic && s['homeSectionPills__pill--rtl'],
        active ? s['homeSectionPills__pill--active'] : s['homeSectionPills__pill--inactive'],
        pressed && s['homeSectionPills__pill--pressed'],
      ]}
    >
      <Text style={[s.homeSectionPills__label, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name={icon} size={24} color={tint} />
    </Pressable>
  );
}

export function HomeSectionPills() {
  const { t, isArabic } = useLanguage();
  const router = useRouter();
  const s = useStyles(createStyles);
  const isVisible = useFeatureVisibility();
  const scrollRef = useRef<ScrollView>(null);

  const goCourses = useCallback(() => router.push('/courses'), [router]);
  const goAdhkar = useCallback(() => router.push('/adhkar'), [router]);
  const goTahsinat = useCallback(() => router.push('/tahsinat'), [router]);
  const goTawjihat = useCallback(() => router.push('/tawjihat'), [router]);
  const goFaq = useCallback(() => router.push('/faq'), [router]);

  useEffect(() => {
    if (isArabic) {
      const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 0);
      return () => clearTimeout(id);
    }
  }, [isArabic]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={isArabic ? s['homeSectionPills__row--ar'] : s['homeSectionPills__row--en']}
      style={s.homeSectionPills__scroll}
    >
      <Pill label={t.home.pillSections} icon="business-outline" active />
      {isVisible(FEATURE_KEYS.COURSES) && (
        <Pill label={t.home.pillCourses} icon="school-outline" onPress={goCourses} />
      )}
      {isVisible(FEATURE_KEYS.ADHKAR) && (
        <Pill label={t.home.pillAdhkar} icon="book-outline" onPress={goAdhkar} />
      )}
      {isVisible(FEATURE_KEYS.TAHSINAT) && (
        <Pill label={t.home.pillTahsinat} icon="shield-checkmark-outline" onPress={goTahsinat} />
      )}
      <Pill label={t.home.pillTawjihat} icon="information-circle-outline" onPress={goTawjihat} />
      <Pill label={t.home.pillFaq} icon="person-outline" onPress={goFaq} />
    </ScrollView>
  );
}
