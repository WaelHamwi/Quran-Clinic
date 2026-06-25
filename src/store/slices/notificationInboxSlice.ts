import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

/** A single adhkar notification that was actually delivered to the device. */
export interface InboxNotification {
  /** The OS notification identifier — used to de-duplicate the foreground
   *  listener against the tray reconcile (getPresentedNotificationsAsync). */
  id: string;
  /** adhkarType from the notification payload: morning | evening | sleep | waking. */
  type: string;
  title: string;
  body: string;
  /** Epoch ms when it was delivered. */
  receivedAt: number;
}

interface NotificationInboxState {
  items: InboxNotification[];
  /** Epoch ms of the last time the user opened the inbox — drives the unread dot. */
  lastSeenAt: number;
}

const initialState: NotificationInboxState = {
  items: [],
  lastSeenAt: 0,
};

/** Midnight (local) of the day `now` falls in. Items older than this are dropped,
 *  which is what gives the inbox its "resets every day" behaviour. */
function startOfToday(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * In-app notification inbox: the list of adhkar reminders the user was actually
 * notified with. Persisted, but pruned to the current calendar day so it never
 * grows stale — yesterday's reminders are cleared automatically.
 */
const notificationInboxSlice = createSlice({
  name: 'notificationInbox',
  initialState,
  reducers: {
    addInboxNotification(state, action: PayloadAction<InboxNotification>) {
      // Prune to today first, then de-dupe, so a repeating daily reminder that
      // re-uses its identifier across days is still recorded each new day.
      const cutoff = startOfToday();
      const fresh = state.items.filter((i) => i.receivedAt >= cutoff);
      if (fresh.some((i) => i.id === action.payload.id)) {
        state.items = fresh;
        return;
      }
      state.items = [action.payload, ...fresh];
    },
    pruneInbox(state) {
      const cutoff = startOfToday();
      state.items = state.items.filter((i) => i.receivedAt >= cutoff);
    },
    markInboxSeen(state) {
      state.lastSeenAt = Date.now();
    },
    clearInbox(state) {
      state.items = [];
      state.lastSeenAt = Date.now();
    },
  },
});

export const { addInboxNotification, pruneInbox, markInboxSeen, clearInbox } =
  notificationInboxSlice.actions;
export default notificationInboxSlice.reducer;

export const selectInboxItems = (s: RootState): InboxNotification[] => s.notificationInbox.items;
export const selectInboxUnreadCount = (s: RootState): number => {
  const { items, lastSeenAt } = s.notificationInbox;
  return items.reduce((n, i) => (i.receivedAt > lastSeenAt ? n + 1 : n), 0);
};
