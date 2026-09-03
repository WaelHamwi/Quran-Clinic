import { apiPost } from '@/services/common/apiClient';
import type { FeedbackPayload } from '@/types/feedback';

/** Feedback API (auth-gated). Offline/401 failures are queued by the caller. */
export const feedbackService = {
  submitFeedback: (payload: FeedbackPayload): Promise<{ id: number }> =>
    apiPost<{ id: number }>('/feedback', payload),
};
