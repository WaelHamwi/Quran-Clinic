import reducer, {
  enqueue,
  enqueueReplacing,
  dequeue,
  selectQueue,
} from '@/store/slices/offlineQueueSlice';

describe('offlineQueueSlice reducer', () => {
  it('enqueue appends without touching existing items of the same type', () => {
    let state = reducer(undefined, enqueue({ type: 'favorite', payload: { diseaseId: 1 } }));
    state = reducer(state, enqueue({ type: 'favorite', payload: { diseaseId: 2 } }));
    const queue = selectQueue({ offlineQueue: state } as any);
    expect(queue).toHaveLength(2);
  });

  it('enqueueReplacing drops any pending item of the same type before pushing the new one', () => {
    let state = reducer(
      undefined,
      enqueueReplacing({ type: 'notificationPreferences', payload: { adhkar_morning_enabled: true } }),
    );
    state = reducer(
      state,
      enqueueReplacing({ type: 'notificationPreferences', payload: { adhkar_morning_enabled: false } }),
    );
    const queue = selectQueue({ offlineQueue: state } as any);
    expect(queue).toHaveLength(1);
    expect(queue[0].payload).toEqual({ adhkar_morning_enabled: false });
  });

  it('enqueueReplacing only drops items of the same type, leaving others untouched', () => {
    let state = reducer(undefined, enqueue({ type: 'favorite', payload: { diseaseId: 1 } }));
    state = reducer(
      state,
      enqueueReplacing({ type: 'notificationPreferences', payload: { adhkar_morning_enabled: true } }),
    );
    const queue = selectQueue({ offlineQueue: state } as any);
    expect(queue).toHaveLength(2);
    expect(queue.map((q) => q.type).sort()).toEqual(['favorite', 'notificationPreferences']);
  });

  it('dequeue removes only the matching item', () => {
    let state = reducer(undefined, enqueue({ type: 'favorite', payload: { diseaseId: 1 } }));
    const id = selectQueue({ offlineQueue: state } as any)[0].id;
    state = reducer(state, dequeue(id));
    expect(selectQueue({ offlineQueue: state } as any)).toHaveLength(0);
  });
});
