import { act, renderHook } from '@testing-library/react-native';
import { useDebounce } from '@/hooks/common/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  it('only updates after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    expect(result.current).toBe('a'); // not yet

    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('a'); // still pending

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('b'); // settled
  });

  it('resets the timer on rapid changes (only the last value lands)', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'c' });
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('a'); // neither settled yet

    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('c'); // last value wins
  });
});
