import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import {
  homeSectionPillsStyles as s,
  PILL_ACTIVE_TINT,
  PILL_INACTIVE_TINT,
} from './HomeSectionPills.styles';

interface PillProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress?: () => void;
}

function Pill({ label, icon, active, onPress }: PillProps) {
  const { isArabic } = useLanguage();
  const tint = active ? PILL_ACTIVE_TINT : PILL_INACTIVE_TINT;
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
  const scrollRef = useRef<ScrollView>(null);

  const goCourses = useCallback(() => router.push('/courses'), [router]);
  const goAdhkar = useCallback(() => router.push('/adhkar'), [router]);
  const goTahsinat = useCallback(() => router.push('/tahsinat'), [router]);

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
      <Pill label={t.home.pillCourses} icon="school-outline" onPress={goCourses} />
      <Pill label={t.home.pillAdhkar} icon="book-outline" onPress={goAdhkar} />
      <Pill label={t.home.pillTahsinat} icon="shield-checkmark-outline" onPress={goTahsinat} />
    </ScrollView>
  );
}
