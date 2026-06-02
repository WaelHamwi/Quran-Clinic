import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/utils/cacheKeys';
import { courseService } from '@/services/courseService';

export function useCourses() {
  const query = useQuery({
    queryKey: cacheKeys.courses,
    queryFn: courseService.getCourses,
    staleTime: 1000 * 60 * 10,
  });
  return {
    courses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
