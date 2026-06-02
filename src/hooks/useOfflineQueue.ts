import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  dequeue,
  incrementRetry,
  setProcessing,
  selectQueue,
  selectQueueProcessing,
  type QueuedAction,
} from '@/store/slices/offlineQueueSlice';
import { selectNetworkOnline } from '@/store/slices/uiSlice';
import { favoriteService } from '@/services/favoriteService';
import { feedbackService } from '@/services/feedbackService';
import { ruqyahService } from '@/services/ruqyahService';
import type { FeedbackPayload } from '@/types/feedback';

const MAX_RETRIES = 3;

async function runQueuedAction(item: QueuedAction): Promise<void> {
  switch (item.type) {
    case 'favorite': {
      const { diseaseId } = item.payload as { diseaseId: number };
      await favoriteService.toggleFavorite(diseaseId);
      return;
    }
    case 'feedback': {
      await feedbackService.submitFeedback(item.payload as FeedbackPayload);
      return;
    }
    case 'playCount': {
      const { recordingId } = item.payload as { recordingId: number };
      await ruqyahService.incrementPlayCount(recordingId);
      return;
    }
  }
}

/** Replays queued offline actions on reconnect; drops an action after 3 fails. */
export function useOfflineQueue() {
  const dispatch = useAppDispatch();
  const queue = useAppSelector(selectQueue);
  const processing = useAppSelector(selectQueueProcessing);
  const online = useAppSelector(selectNetworkOnline);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const processQueue = useCallback(async () => {
    const items = queueRef.current;
    if (processing || items.length === 0) return;
    dispatch(setProcessing(true));
    for (const item of items) {
      try {
        await runQueuedAction(item);
        dispatch(dequeue(item.id));
      } catch {
        if (item.retryCount + 1 >= MAX_RETRIES) dispatch(dequeue(item.id));
        else dispatch(incrementRetry(item.id));
      }
    }
    dispatch(setProcessing(false));
  }, [processing, dispatch]);

  // Replay whenever connectivity is (re)gained.
  useEffect(() => {
    if (online && queueRef.current.length > 0) {
      void processQueue();
    }
  }, [online, processQueue]);

  return { queueSize: queue.length, processQueue };
}
