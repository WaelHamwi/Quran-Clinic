import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { pickText, formatDate } from '@/utils/formatters';
import { courseCardStyles as s } from './CourseCard.styles';
import type { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
}

function CourseCardBase({ course }: CourseCardProps) {
  const { isArabic, t, language } = useLanguage();
  const router = useRouter();

  const onShowDetails = useCallback(() => {
    router.push(`/course/${course.id}`);
  }, [router, course.id]);

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.title} numberOfLines={2}>
          {pickText(course.title, isArabic)}
        </Text>
        {course.is_coming_soon ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>{t.courses.comingSoon}</Text>
          </View>
        ) : null}
      </View>

      <Text style={s.instructor}>
        {t.courses.instructor(course.instructor_name)}
      </Text>

      {course.price ? (
        <Text style={s.price}>{t.courses.price(course.price)}</Text>
      ) : null}

      {course.start_date ? (
        <Text style={s.date}>
          {t.courses.startDate(formatDate(course.start_date, language))}
        </Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [s.detailsBtn, pressed && { opacity: 0.75 }]}
        onPress={onShowDetails}
      >
        <Text style={s.detailsBtnText}>{t.courses.showDetails}</Text>
      </Pressable>
    </View>
  );
}

export const CourseCard = React.memo(CourseCardBase);
