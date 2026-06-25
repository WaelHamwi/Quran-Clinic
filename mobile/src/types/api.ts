/**
 * Standard backend response envelope.
 * Every Laravel endpoint returns `{ success, data, message, meta, errors }`.
 */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
  meta?: PaginationMeta | null;
  errors?: Record<string, string[]> | null;
}

/** A paginated result unwrapped by a service: list + its meta. */
export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
