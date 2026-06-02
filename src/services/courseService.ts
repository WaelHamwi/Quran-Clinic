import { apiGet } from '@/services/apiClient';
import type { Course } from '@/types/course';

export const courseService = {
  getCourses: (): Promise<Course[]> => apiGet<Course[]>('/courses'),
};
