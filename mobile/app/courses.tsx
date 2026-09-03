import React, { useCallback } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CourseCard } from '@/components/lists/CourseCard';
import { useCourses } from '@/hooks/content/useCourses';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/coursesScreen.styles';
import type { Course } from '@/types/course';

export default function CoursesScreen() {
  const { t } = useLanguage();
  const s = useStyles(createStyles);
  const { courses, isLoading } = useCourses();

  const renderItem = useCallback<ListRenderItem<Course>>(
    ({ item }) => <CourseCard course={item} />,
    [],
  );

  return (
    <Screen>
      <PatternedBackground />
      <Header title={t.courses.title} />
      {isLoading ? (
        <Loader fullScreen message={t.common.loading} />
      ) : (
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.content}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          ListEmptyComponent={<EmptyState icon="school-outline" title={t.courses.empty} />}
        />
      )}
    </Screen>
  );
}
