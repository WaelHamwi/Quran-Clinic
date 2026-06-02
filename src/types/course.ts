import type { Translatable } from '@/types/translatable';

export interface Course {
  id: number;
  title: Translatable;
  description: Translatable;
  instructor_name: string;
  price: string;
  start_date: string | null;
  whatsapp_link: string | null;
  is_coming_soon: boolean;
  display_order: number;
}
