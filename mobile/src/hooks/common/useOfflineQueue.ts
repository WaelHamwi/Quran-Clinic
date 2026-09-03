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
import { favoriteService, type FavoriteNodeKind } from '@/services/content/favoriteService';
import { feedbackService } from '@/services/content/feedbackService';
import { ruqyahService } from '@/services/content/ruqyahService';
import { notificationService } from '@/services/notifications/notificationService';
import type { FeedbackPayload } from '@/types/feedback';
import type { NotificationPreferences } from '@/types/notification';

const MAX_RETRIES = 3;

async function runQueuedAction(item: QueuedAction): Promise<void> {
  switch (item.type) {
    case 'favorite': {
      const { diseaseId } = item.payload as { diseaseId: number };
      await favoriteService.toggleFavorite(diseaseId);
      return;
    }
    case 'favoriteNode': {
      const { kind, nodeId } = item.payload as { kind: FavoriteNodeKind; nodeId: number };
      await favoriteService.toggleFavoriteNode(kind, nodeId);
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
    case 'notificationPreferences': {
      await notificationService.savePreferences(item.payload as NotificationPreferences);
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
  // eslint-disable-next-line react-hooks/refs -- always-fresh ref read by processQueue (a useCallback below) so it sees the latest queue without needing queue in its deps
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
