import React, { useCallback, useMemo } from 'react';
import {
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { useCourses } from '@/hooks/useCourses';
import { useLanguage } from '@/context/LanguageContext';
import { pickText, formatDate, resolveMediaUrl } from '@/utils/formatters';
import { palette } from '@/theme/colors';
import { courseDetailStyles as s } from '@/styles/courseDetailScreen.styles';
import courseCover from '@/assets/figma/course-cover.jpg';
import courseCoverSoon from '@/assets/figma/course-cover-soon.jpg';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const { courses, isLoading } = useCourses();
  const { t, isArabic, language } = useLanguage();
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const course = useMemo(
    () => courses.find((c) => String(c.id) === id),
    [courses, id],
  );

  const title = course ? pickText(course.title, isArabic) : t.courses.title;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const openWhatsapp = useCallback(() => {
    if (course?.whatsapp_link) Linking.openURL(course.whatsapp_link).catch(() => {});
  }, [course?.whatsapp_link]);

  const onShare = useCallback(() => {
    if (!course) return;
    const message = course.whatsapp_link
      ? `${pickText(course.title, isArabic)}\n${course.whatsapp_link}`
      : pickText(course.title, isArabic);
    Share.share({ message }).catch(() => {});
  }, [course, isArabic]);

  if (isLoading) {
    return (
      <Screen>
        <PatternedBackground />
        <Header title={title} showBack />
        <Loader fullScreen message={t.common.loading} />
      </Screen>
    );
  }

  if (!course) {
    return (
      <Screen>
        <PatternedBackground />
        <Header title={t.courses.title} showBack />
        <EmptyState icon="school-outline" title={t.common.empty} />
      </Screen>
    );
  }

  const description = pickText(course.description, isArabic);
  const audience = pickText(course.target_audience, isArabic);
  const toLines = (value: typeof course.course_topics) =>
    pickText(value, isArabic)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  const topics = toLines(course.course_topics);
  const registration = toLines(course.registration_info);
  const price = course.price ? course.price.replace(/\.00$/, '') : null;
  const pillLabel = course.is_coming_soon
    ? t.courses.comingSoon
    : course.start_date
      ? formatDate(course.start_date, language)
      : null;
  const canBook = !!course.whatsapp_link && !course.is_coming_soon;
  const coverSource = course.image_url
    ? { uri: resolveMediaUrl(course.image_url) as string }
    : course.is_coming_soon
      ? courseCoverSoon
      : courseCover;

  return (
    <Screen edges={['bottom']}>
      <View style={s.flex}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={coverSource}
            style={[s.cover, { paddingTop: top + 12 }]}
            imageStyle={s.coverImage}
          >
            <View style={s.topRow}>
              <Pressable style={s.circleBtn} onPress={onShare} hitSlop={8}>
                <Ionicons name="share-outline" size={18} color={palette.text.primary} />
              </Pressable>
              <Pressable style={s.circleBtn} onPress={goBack} hitSlop={8}>
                <Ionicons name="close" size={20} color={palette.text.primary} />
              </Pressable>
            </View>

            {pillLabel ? (
              <View style={s.dateRow}>
                <View style={s.datePill}>
                  <Text style={s.datePillText}>{pillLabel}</Text>
                  <Ionicons name="calendar-outline" size={16} color={palette.text.primary} />
                </View>
              </View>
            ) : null}
          </ImageBackground>

          <View style={s.body}>
            <Text style={s.title}>{pickText(course.title, isArabic)}</Text>

            {description ? <Text style={s.description}>{description}</Text> : null}

            {course.instructor_name ? (
              <View style={s.instructorPill}>
                <Text style={s.instructorText} numberOfLines={1}>
                  {t.courses.instructor(course.instructor_name)}
                </Text>
                <Ionicons name="person-outline" size={24} color={palette.brand[500]} />
              </View>
            ) : null}

            {audience ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>{t.courses.audienceTitle}</Text>
                <Text style={s.sectionBody}>{audience}</Text>
              </View>
            ) : null}

            {topics.length ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>{t.courses.topicsTitle}</Text>
                {topics.map((line, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bullet}>•</Text>
                    <Text style={s.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {registration.length ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>{t.courses.registrationTitle}</Text>
                {registration.map((line, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bullet}>•</Text>
                    <Text style={s.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={s.footer}>
          {canBook ? (
            <Pressable
              style={({ pressed }) => [s.bookBtn, pressed && { opacity: 0.85 }]}
              onPress={openWhatsapp}
            >
              <Text style={s.bookBtnText}>{t.courses.book}</Text>
              <Ionicons name="logo-whatsapp" size={18} color={palette.text.onBrand} />
            </Pressable>
          ) : (
            <View />
          )}

          {price ? (
            <View style={s.priceBlock}>
              <Text style={s.price}>{t.courses.priceTag(price)}</Text>
              <Text style={s.priceSuffix}>{t.courses.priceSuffix}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
