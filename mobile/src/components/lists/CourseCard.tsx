import React, { useCallback } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { pickText, formatDate, resolveMediaUrl } from '@/utils/formatters';
import { createStyles } from './CourseCard.styles';
import courseCover from '@/assets/figma/course-cover.jpg';
import courseCoverSoon from '@/assets/figma/course-cover-soon.jpg';
import type { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
}

function CourseCardBase({ course }: CourseCardProps) {
  const { isArabic, t, language } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const router = useRouter();

  const onShowDetails = useCallback(() => {
    router.push(`/course/${course.id}`);
  }, [router, course.id]);

  const description = pickText(course.description, isArabic);
  const price = course.price ? course.price.replace(/\.00$/, '') : null;
  const pillLabel = course.is_coming_soon
    ? t.courses.comingSoon
    : course.start_date
      ? formatDate(course.start_date, language)
      : null;
  const coverSource = course.image_url
    ? { uri: resolveMediaUrl(course.image_url) as string }
    : course.is_coming_soon
      ? courseCoverSoon
      : courseCover;

  return (
    <Pressable
      style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
      onPress={onShowDetails}
    >
      <ImageBackground
        source={coverSource}
        style={s.cover}
        imageStyle={s.coverImage}
      >
        {pillLabel ? (
          <View style={s.datePill}>
            <Text style={s.datePillText}>{pillLabel}</Text>
            <Ionicons name="calendar-outline" size={16} color={theme.text} />
          </View>
        ) : null}
      </ImageBackground>

      <View style={s.body}>
        <View style={s.textGroup}>
          <Text style={s.title} numberOfLines={1}>
            {pickText(course.title, isArabic)}
          </Text>
          {description ? (
            <Text style={s.description} numberOfLines={3}>
              {description}
            </Text>
          ) : null}
        </View>

        <View style={s.instructorPill}>
          <Text style={s.instructorText} numberOfLines={1}>
            {t.courses.instructor(course.instructor_name)}
          </Text>
          <Ionicons name="person-outline" size={20} color={theme.primary} />
        </View>

        <View style={s.footerRow}>
          <Pressable
            style={({ pressed }) => [s.detailsBtn, pressed && { opacity: 0.85 }]}
            onPress={onShowDetails}
          >
            <Text style={s.detailsBtnText}>{t.courses.showDetails}</Text>
          </Pressable>

          {price ? (
            <View style={s.priceBlock}>
              <Text style={s.price}>{t.courses.priceTag(price)}</Text>
              <Text style={s.priceSuffix}>{t.courses.priceSuffix}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const CourseCard = React.memo(CourseCardBase);
