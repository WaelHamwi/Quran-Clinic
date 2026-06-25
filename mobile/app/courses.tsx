import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CourseCard } from '@/components/lists/CourseCard';
import { useCourses } from '@/hooks/useCourses';
import { useLanguage } from '@/context/LanguageContext';
import { spacing } from '@/theme/spacing';
import type { Course } from '@/types/course';

export default function CoursesScreen() {
  const { t } = useLanguage();
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
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyState icon="school-outline" title={t.courses.empty} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, flexGrow: 1 },
  separator: { height: spacing.md },
});
