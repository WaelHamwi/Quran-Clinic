import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

export type QueuedActionType = 'favorite' | 'favoriteNode' | 'feedback' | 'playCount' | 'notificationPreferences';

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

interface OfflineQueueState {
  queue: QueuedAction[];
  processing: boolean;
}

const initialState: OfflineQueueState = { queue: [], processing: false };

/** Actions deferred while offline; replayed on reconnect. Persisted. */
const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    enqueue(
      state,
      action: PayloadAction<{ type: QueuedActionType; payload: unknown }>,
    ) {
      state.queue.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: action.payload.type,
        payload: action.payload.payload,
        timestamp: Date.now(),
        retryCount: 0,
      });
    },
    dequeue(state, action: PayloadAction<string>) {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
    },
    /** Like `enqueue`, but first drops any pending item of the same type — for
     *  actions where only the latest state matters (e.g. settings toggled
     *  repeatedly while offline should replay once, not N times in order). */
    enqueueReplacing(
      state,
      action: PayloadAction<{ type: QueuedActionType; payload: unknown }>,
    ) {
      state.queue = state.queue.filter((item) => item.type !== action.payload.type);
      state.queue.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: action.payload.type,
        payload: action.payload.payload,
        timestamp: Date.now(),
        retryCount: 0,
      });
    },
    incrementRetry(state, action: PayloadAction<string>) {
      const item = state.queue.find((q) => q.id === action.payload);
      if (item) item.retryCount += 1;
    },
    setProcessing(state, action: PayloadAction<boolean>) {
      state.processing = action.payload;
    },
    clearQueue(state) {
      state.queue = [];
    },
  },
});

export const { enqueue, enqueueReplacing, dequeue, incrementRetry, setProcessing, clearQueue } =
  offlineQueueSlice.actions;
export default offlineQueueSlice.reducer;

export const selectQueue = (s: RootState): QueuedAction[] => s.offlineQueue.queue;
export const selectQueueSize = (s: RootState): number => s.offlineQueue.queue.length;
export const selectQueueProcessing = (s: RootState): boolean => s.offlineQueue.processing;
