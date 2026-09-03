import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useStyles } from '@/hooks/common/useStyles';
import {
  QCF4_FONT_SCALE_MULTIPLIERS,
  QCF4_PAGE_DIVIDER_HEIGHT,
  QCF4_TOTAL_PAGES,
  qcf4ContinuousPageHeight,
} from '@/constants/qcf4';
import { qcf4PageMeasures, qcf4PageWeights } from '@/services/mushaf/qcf4Pages';
import type { FontScale } from '@/utils/mushafReader';
import { MadaniPage } from './MadaniPage';
import { createStyles } from './MadaniVerticalPager.styles';

type Props = {
  initialPage: number;
  viewabilityConfig: { itemVisiblePercentThreshold: number };
  onViewableItemsChanged: (info: { viewableItems: { index: number | null }[] }) => void;
  highlightVerseKey?: string | null;
  fontScale: FontScale;
  listRef?: React.RefObject<FlatList<number> | null>;
  /** Feeds useAutoScroll's offset/bounds tracking (see useMadaniReader's
   *  onAutoScrollSync) — auto-scroll drives this same list via
   *  scrollToOffset, so it needs this list's live scroll position and
   *  content height the same way the classic reader's ScrollView does. */
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Tap on a page's text surface (a drag is still a scroll, never a tap). */
  onPagePress?: () => void;
};

const PAGES: number[] = Array.from({ length: QCF4_TOTAL_PAGES }, (_, i) => i + 1);

/** Vertical "continuous" mode — scrolls straight through pages 1→604 in
 *  reading order (no RTL page-flip direction here; down is down regardless
 *  of language). Each page is set at the full width of the screen and cut to
 *  the height its own text needs (qcf4ContinuousPageHeight), rather than to
 *  the viewport — a page taller than the screen is simply scrolled past
 *  instead of being squeezed to fit the way the horizontal pager must. */
export function MadaniVerticalPager({
  initialPage,
  viewabilityConfig,
  onViewableItemsChanged,
  highlightVerseKey,
  fontScale,
  listRef: externalListRef,
  onScroll,
  onPagePress,
}: Props) {
  const styles = useStyles(createStyles);
  const ownListRef = React.useRef<FlatList<number>>(null);
  const listRef = externalListRef ?? ownListRef;

  const [pageWidth, setPageWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setPageWidth(e.nativeEvent.layout.width);
  const textScale = QCF4_FONT_SCALE_MULTIPLIERS[fontScale];
  // Each page is cut to exactly the height ITS OWN lines need at the chosen
  // size — 8-line opening pages and surah-dense closing pages included — so no
  // page is handed height its text doesn't use. That is also what makes the
  // size picker worth using: a smaller size shortens every page by the same
  // fraction, bringing proportionally more of the Mushaf onto the screen
  // instead of shrinking the glyphs inside a box that stays the same height.
  //
  // The rule under each page is part of the item's height, and the offsets
  // must be the running sum of those heights rather than index × one height —
  // pages differ, and any drift here lands the jumps measured in these offsets
  // (search, bookmarks, follow-the-audio, auto-scroll) short of their page.
  const layout = useMemo(() => {
    if (pageWidth <= 0) return null;
    const weights = qcf4PageWeights();
    const pageMeasures = qcf4PageMeasures();
    const heights = weights.map(
      (weight, i) =>
        qcf4ContinuousPageHeight(pageWidth, textScale, weight, pageMeasures[i]) + QCF4_PAGE_DIVIDER_HEIGHT
    );
    const offsets: number[] = [];
    let running = 0;
    for (const height of heights) {
      offsets.push(running);
      running += height;
    }
    return { heights, offsets };
  }, [pageWidth, textScale]);

  const getItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      length: layout?.heights[index] ?? 0,
      offset: layout?.offsets[index] ?? 0,
      index,
    }),
    [layout]
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <View style={styles.pageItem}>
        <MadaniPage
          page={item}
          width={pageWidth}
          height={(layout?.heights[item - 1] ?? QCF4_PAGE_DIVIDER_HEIGHT) - QCF4_PAGE_DIVIDER_HEIGHT}
          highlightVerseKey={highlightVerseKey}
          textScale={textScale}
          onPress={onPagePress}
        />
      </View>
    ),
    [pageWidth, layout, highlightVerseKey, textScale, styles.pageItem, onPagePress]
  );

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {pageWidth > 0 && layout != null && (
        <FlatList
          ref={listRef}
          data={PAGES}
          keyExtractor={(page) => String(page)}
          initialScrollIndex={initialPage - 1}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          // removeClippedSubviews is deliberately left off: on Android it recycles
          // native views without forcing a redraw when the container resizes fast
          // (device rotation), which showed up as garbled/overlapping glyphs on the
          // QCF text. windowSize/maxToRenderPerBatch above already cap it to ~1-3
          // rendered pages, so the memory saved by clipping would be marginal anyway.
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          onScroll={onScroll}
          scrollEventThrottle={32}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToOffset({
                offset: layout.offsets[info.index] ?? 0,
                animated: false,
              });
            }, 100);
          }}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
