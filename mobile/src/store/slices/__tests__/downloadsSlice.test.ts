import reducer, {
  startTask,
  updateProgress,
  completeTask,
  cancelTask,
  removeDownload,
  selectResumableTasks,
} from '@/store/slices/downloadsSlice';
import type { RootState } from '@/store/rootReducer';

const start = () =>
  reducer(
    undefined,
    startTask({
      recordingId: 42,
      downloadUrl: 'https://cdn.test/ruqyah.mp3',
      diseaseId: 7,
      title: 'الأمراض العضوية',
      subtitle: 'الرقية المختصرة',
      sessionNumber: 1,
      localPath: 'file:///audio/42.mp3',
    }),
  );

describe('downloadsSlice reducer', () => {
  it('startTask files the task under the wird name it was started from', () => {
    const task = start().tasks[42];
    expect(task.title).toBe('الأمراض العضوية');
    // Both of a wird's ruqyahs share its name — the subtitle is what separates them.
    expect(task.subtitle).toBe('الرقية المختصرة');
    expect(task.status).toBe('downloading');
    expect(task.progress).toBe(0);
  });

  it('updateProgress tracks the fraction written and the expected total', () => {
    const state = reducer(start(), updateProgress({ recordingId: 42, progress: 0.45, totalBytes: 2_000_000 }));
    expect(state.tasks[42].progress).toBeCloseTo(0.45);
    expect(state.tasks[42].totalBytes).toBe(2_000_000);
  });

  it('completeTask carries the name onto the stored download and counts its size', () => {
    let state = reducer(start(), updateProgress({ recordingId: 42, progress: 1, totalBytes: 900 }));
    state = reducer(
      state,
      completeTask({
        recordingId: 42,
        diseaseId: 7,
        title: 'الأمراض العضوية',
        subtitle: 'الرقية المختصرة',
        sessionNumber: 1,
        localPath: 'file:///audio/42.mp3',
        size: 900,
        downloadedAt: 1,
      }),
    );

    expect(state.tasks[42]).toBeUndefined();
    expect(state.completed[42].title).toBe('الأمراض العضوية');
    expect(state.completed[42].subtitle).toBe('الرقية المختصرة');
    expect(state.storageUsed).toBe(900);

    expect(reducer(state, removeDownload(42)).storageUsed).toBe(0);
  });

  it('lists an interrupted task as resumable, and drops it once cancelled', () => {
    const state = start();
    const asRoot = { downloads: state } as RootState;
    expect(selectResumableTasks(asRoot).map((t) => t.recordingId)).toEqual([42]);

    const cancelled = { downloads: reducer(state, cancelTask(42)) } as RootState;
    expect(selectResumableTasks(cancelled)).toEqual([]);
  });
});
