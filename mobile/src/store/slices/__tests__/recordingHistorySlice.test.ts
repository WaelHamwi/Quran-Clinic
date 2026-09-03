import reducer, {
  recordPlay,
  clearHistory,
  selectRecordingHistory,
} from '@/store/slices/recordingHistorySlice';
import type { Recording } from '@/types/recording';

const rec = (id: number, requires_subscription = false) =>
  ({ id, requires_subscription } as unknown as Recording);

describe('recordingHistorySlice reducer', () => {
  it('recordPlay adds an entry and selectRecordingHistory returns most-recent-first', () => {
    let state = reducer(undefined, recordPlay(rec(1)));
    state = reducer(state, recordPlay(rec(2)));
    const ordered = selectRecordingHistory({ recordingHistory: state } as any);
    expect(ordered.map((r) => r.id)).toEqual([2, 1]);
  });

  it('replaying a recording moves it to the front instead of duplicating it', () => {
    let state = reducer(undefined, recordPlay(rec(1)));
    state = reducer(state, recordPlay(rec(2)));
    state = reducer(state, recordPlay(rec(1)));
    const ordered = selectRecordingHistory({ recordingHistory: state } as any);
    expect(ordered.map((r) => r.id)).toEqual([1, 2]);
  });

  it('evicts the oldest entries once over the 200-entry cap', () => {
    let state = reducer(undefined, { type: '@@init' } as any);
    for (let i = 0; i < 201; i++) state = reducer(state, recordPlay(rec(i)));
    expect(Object.keys(state.entries)).toHaveLength(200);
    expect(state.entries[0]).toBeUndefined();
    expect(state.entries[200]).toBeDefined();
  });

  it('clearHistory resets to empty (called on sign-out)', () => {
    let state = reducer(undefined, recordPlay(rec(1)));
    state = reducer(state, clearHistory());
    expect(state.entries).toEqual({});
  });
});
