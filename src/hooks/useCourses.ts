import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/utils/cacheKeys';
import { courseService } from '@/services/courseService';
import { cachedFetch } from '@/services/contentCache';

export function useCourses() {
  const query = useQuery({
    queryKey: cacheKeys.courses,
    queryFn: () => cachedFetch('courses_list', courseService.getCourses),
    staleTime: 1000 * 60 * 10,
  });
  return {
    courses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
