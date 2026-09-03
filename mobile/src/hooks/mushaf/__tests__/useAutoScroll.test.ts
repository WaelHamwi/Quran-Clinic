import { act, renderHook } from '@testing-library/react-native';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import { useAutoScroll, type AutoScrollSpeed } from '@/hooks/mushaf/useAutoScroll';

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));

const scrollEvent = (y: number, viewport: number, content: number) =>
  ({
    nativeEvent: {
      contentOffset: { y },
      layoutMeasurement: { height: viewport },
      contentSize: { height: content },
    },
  }) as NativeSyntheticEvent<NativeScrollEvent>;

describe('useAutoScroll', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts off and does nothing until toggled', () => {
    const onAdvancePage = jest.fn(() => true);
    const { result } = renderHook(() => useAutoScroll({ mode: 'paged', onAdvancePage }));

    expect(result.current.enabled).toBe(false);
    act(() => { jest.advanceTimersByTime(120000); });
    expect(onAdvancePage).not.toHaveBeenCalled();
  });

  it('turns pages on an interval in paged mode', () => {
    const onAdvancePage = jest.fn(() => true);
    const { result } = renderHook(() => useAutoScroll({ mode: 'paged', onAdvancePage }));

    act(() => { result.current.toggle(); });
    expect(result.current.enabled).toBe(true);

    // Default speed 3 → 32s per page.
    act(() => { jest.advanceTimersByTime(32000); });
    expect(onAdvancePage).toHaveBeenCalledTimes(1);
    act(() => { jest.advanceTimersByTime(32000); });
    expect(onAdvancePage).toHaveBeenCalledTimes(2);
  });

  it('turns pages faster at a higher speed', () => {
    const onAdvancePage = jest.fn(() => true);
    const { result } = renderHook(() => useAutoScroll({ mode: 'paged', onAdvancePage }));

    act(() => { result.current.toggle(); });
    act(() => { result.current.setSpeed(5 as AutoScrollSpeed); });

    act(() => { jest.advanceTimersByTime(12000); });
    expect(onAdvancePage).toHaveBeenCalledTimes(1);
  });

  it('stops itself when there is no next page', () => {
    const onAdvancePage = jest.fn(() => false);
    const { result } = renderHook(() => useAutoScroll({ mode: 'paged', onAdvancePage }));

    act(() => { result.current.toggle(); });
    act(() => { jest.advanceTimersByTime(32000); });

    expect(result.current.enabled).toBe(false);
    act(() => { jest.advanceTimersByTime(200000); });
    expect(onAdvancePage).toHaveBeenCalledTimes(1);
  });

  it('scrolls forward from the last known offset in continuous mode', () => {
    const scrollTo = jest.fn();
    const scrollRef = { current: { scrollTo } as unknown as ScrollView };
    const { result } = renderHook(() => useAutoScroll({ mode: 'continuous', scrollRef }));

    // A real scroll seeds the cursor and the scrollable range.
    act(() => { result.current.onScrollSync(scrollEvent(100, 800, 5000)); });
    act(() => { result.current.toggle(); });
    act(() => { jest.advanceTimersByTime(1000); });

    // Speed 3 = 38px/s, so ~1s of ticks lands just under 138.
    const lastY = scrollTo.mock.calls.at(-1)![0].y;
    expect(lastY).toBeGreaterThan(100);
    expect(lastY).toBeLessThanOrEqual(138);
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ animated: false }));
  });

  it('stops at the bottom of the content', () => {
    const scrollTo = jest.fn();
    const scrollRef = { current: { scrollTo } as unknown as ScrollView };
    const { result } = renderHook(() => useAutoScroll({ mode: 'continuous', scrollRef }));

    // Max offset = 1000 - 800 = 200; start 10px short of it.
    act(() => { result.current.onScrollSync(scrollEvent(190, 800, 1000)); });
    act(() => { result.current.toggle(); });
    act(() => { jest.advanceTimersByTime(5000); });

    expect(result.current.enabled).toBe(false);
    expect(scrollTo).toHaveBeenLastCalledWith({ y: 200, animated: false });
  });

  it('re-seats on a manual jump but ignores its own scroll echo', () => {
    const scrollTo = jest.fn();
    const scrollRef = { current: { scrollTo } as unknown as ScrollView };
    const { result } = renderHook(() => useAutoScroll({ mode: 'continuous', scrollRef }));

    act(() => { result.current.onScrollSync(scrollEvent(0, 800, 5000)); });
    act(() => { result.current.toggle(); });

    // Echo of its own scroll (a few px behind) must not move the cursor back.
    act(() => { result.current.onScrollSync(scrollEvent(5, 800, 5000)); });
    act(() => { jest.advanceTimersByTime(1000); });
    expect(scrollTo.mock.calls.at(-1)![0].y).toBeLessThan(50);

    // A real drag far away wins.
    act(() => { result.current.onScrollSync(scrollEvent(3000, 800, 5000)); });
    act(() => { jest.advanceTimersByTime(32); });
    expect(scrollTo.mock.calls.at(-1)![0].y).toBeGreaterThan(3000);
  });
});
