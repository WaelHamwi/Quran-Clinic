import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

export const AUTO_SCROLL_SPEEDS = [1, 2, 3, 4, 5] as const;
export type AutoScrollSpeed = (typeof AUTO_SCROLL_SPEEDS)[number];

export const DEFAULT_AUTO_SCROLL_SPEED: AutoScrollSpeed = 3;

// Continuous mode: pixels per second. Level 3 ≈ a page of Mushaf text per
// minute at the default font scale — slow enough to actually read.
const PX_PER_SECOND: Record<AutoScrollSpeed, number> = { 1: 12, 2: 22, 3: 38, 4: 62, 5: 100 };

// Paged mode: how long one page stays on screen before it turns.
const MS_PER_PAGE: Record<AutoScrollSpeed, number> = {
  1: 75000,
  2: 50000,
  3: 32000,
  4: 20000,
  5: 12000,
};

const TICK_MS = 32;

// A tick moves at most ~3px, so anything beyond this gap means the user dragged
// or jumped the page themselves — the auto-scroll cursor re-seats there instead
// of yanking the page back to where it had counted up to.
const RESYNC_THRESHOLD_PX = 60;

const KEEP_AWAKE_TAG = 'mushaf-auto-scroll';

type Params = {
  /** 'continuous' drives `scrollRef` (or `scrollTo`) pixel-by-pixel; 'paged'
   *  calls `onAdvancePage` once per interval. */
  mode: 'continuous' | 'paged';
  scrollRef?: React.RefObject<ScrollView | null>;
  /** Alternative to scrollRef for continuous mode when the scroll container
   *  isn't a ScrollView (e.g. a virtualized FlatList, via its
   *  `.scrollToOffset`) — takes precedence over scrollRef when given. Read
   *  through a ref, so its identity may change freely. */
  scrollTo?: (y: number) => void;
  /** Turn to the next page. Return false when there is none left, which stops
   *  auto-scroll. Read through a ref, so its identity may change freely. */
  onAdvancePage?: () => boolean;
};

/**
 * Hands-free reading for the Mushaf readers. The screen is kept awake while
 * active — the whole point is reading without touching the device, which would
 * otherwise let the display time out mid-page.
 */
export function useAutoScroll({ mode, scrollRef, scrollTo, onAdvancePage }: Params) {
  const [enabled, setEnabled] = useState(false);
  const [speed, setSpeed] = useState<AutoScrollSpeed>(DEFAULT_AUTO_SCROLL_SPEED);

  const offsetRef = useRef(0);
  const maxOffsetRef = useRef(0);
  /* eslint-disable react-hooks/refs -- always-fresh refs written during render (same pattern as useReaderScroll's getIdxAtMsRef) so the stable onScrollSync callback and the running interval read the latest values without being re-created */
  const enabledRef = useRef(false);
  enabledRef.current = enabled;

  const advanceRef = useRef(onAdvancePage);
  advanceRef.current = onAdvancePage;

  const scrollToRef = useRef(scrollTo);
  scrollToRef.current = scrollTo;
  /* eslint-enable react-hooks/refs */

  useEffect(() => {
    if (!enabled) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => { deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {}); };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    if (mode === 'paged') {
      const id = setInterval(() => {
        if (advanceRef.current?.() === false) setEnabled(false);
      }, MS_PER_PAGE[speed]);
      return () => clearInterval(id);
    }

    const applyScroll = (y: number) => {
      if (scrollToRef.current) scrollToRef.current(y);
      else scrollRef?.current?.scrollTo({ y, animated: false });
    };

    const step = (PX_PER_SECOND[speed] * TICK_MS) / 1000;
    const id = setInterval(() => {
      const max = maxOffsetRef.current;
      const next = offsetRef.current + step;
      // Stop at the end of the surah rather than fighting the bounce.
      if (max > 0 && next >= max) {
        offsetRef.current = max;
        applyScroll(max);
        setEnabled(false);
        return;
      }
      offsetRef.current = next;
      applyScroll(next);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [enabled, mode, speed, scrollRef]);

  const onScrollSync = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    maxOffsetRef.current = Math.max(0, contentSize.height - layoutMeasurement.height);
    if (!enabledRef.current || Math.abs(contentOffset.y - offsetRef.current) > RESYNC_THRESHOLD_PX) {
      offsetRef.current = contentOffset.y;
    }
  }, []);

  const toggle = useCallback(() => setEnabled((v) => !v), []);
  const stop = useCallback(() => setEnabled(false), []);

  return { enabled, toggle, stop, speed, setSpeed, onScrollSync };
}
