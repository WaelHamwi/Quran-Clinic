import React, { useCallback, useMemo } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { useCourses } from '@/hooks/useCourses';
import { useLanguage } from '@/context/LanguageContext';
import { pickText, formatDate } from '@/utils/formatters';
import { courseDetailStyles as s } from '@/styles/courseDetailScreen.styles';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, isLoading } = useCourses();
  const { t, isArabic, language } = useLanguage();

  const course = useMemo(
    () => courses.find((c) => String(c.id) === id),
    [courses, id],
  );

  const title = course ? pickText(course.title, isArabic) : t.courses.title;

  const openWhatsapp = useCallback(() => {
    if (course?.whatsapp_link) Linking.openURL(course.whatsapp_link).catch(() => {});
  }, [course?.whatsapp_link]);

  if (isLoading) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={title} showBack />
        <Loader fullScreen message={t.common.loading} />
      </Screen>
    );
  }

  if (!course) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={t.courses.title} showBack />
        <EmptyState icon="school-outline" title={t.common.empty} />
      </Screen>
    );
  }

  const description = pickText(course.description, isArabic);

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={title} showBack />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title + badge */}
        <View style={s.headerRow}>
          <Text style={s.title}>{pickText(course.title, isArabic)}</Text>
          {course.is_coming_soon ? (
            <View style={s.badge}>
              <Text style={s.badgeText}>{t.courses.comingSoon}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.divider} />

        {/* Meta: instructor, price, start date */}
        <View style={s.metaGroup}>
          <Text style={s.metaRow}>
            {t.courses.instructor(course.instructor_name)}
          </Text>
          {course.price ? (
            <Text style={s.priceText}>{t.courses.price(course.price)}</Text>
          ) : null}
          {course.start_date ? (
            <Text style={s.dateText}>
              {t.courses.startDate(formatDate(course.start_date, language))}
            </Text>
          ) : null}
        </View>

        {/* Description */}
        {description ? (
          <>
            <View style={s.divider} />
            <View style={s.section}>
              <Text style={s.sectionTitle}>{t.courses.about}</Text>
              <Text style={s.sectionBody}>{description}</Text>
            </View>
          </>
        ) : null}

        {/* WhatsApp CTA */}
        {course.whatsapp_link && !course.is_coming_soon ? (
          <Pressable
            style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]}
            onPress={openWhatsapp}
          >
            <Text style={s.ctaBtnText}>{t.courses.joinWhatsapp}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
