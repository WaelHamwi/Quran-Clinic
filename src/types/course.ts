import type { Translatable } from '@/types/translatable';

export interface Course {
  id: number;
  title: Translatable;
  description: Translatable;
  /** "لمن هذه الدورة؟" body. */
  target_audience: Translatable | null;
  /** "محاور الدورة" — newline-separated; each line is a bullet. */
  course_topics: Translatable | null;
  /** "معلومات التقديم" — newline-separated; each line is a bullet. */
  registration_info: Translatable | null;
  instructor_name: string;
  price: string;
  start_date: string | null;
  /** Cover image shown on the card and detail header. */
  image_url: string | null;
  whatsapp_link: string | null;
  is_coming_soon: boolean;
  display_order: number;
}
