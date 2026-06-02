/** Payload for POST /feedback. */
export interface FeedbackPayload {
  service_type: string;
  service_id?: number | null;
  was_beneficial?: boolean | null;
  likes?: string | null;
  dislikes?: string | null;
  comment?: string | null;
}
