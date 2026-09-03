import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, type LayoutChangeEvent } from 'react-native';
import { useStyles } from '@/hooks/common/useStyles';
import { QCF4_TOTAL_PAGES } from '@/constants/qcf4';
import { MadaniPage } from './MadaniPage';
import { createStyles } from './MadaniPager.styles';

type Props = {
  initialPage: number;
  viewabilityConfig: { itemVisiblePercentThreshold: number };
  onViewableItemsChanged: (info: { viewableItems: { index: number | null }[] }) => void;
  /** verse_key of the verse currently being recited, highlighted wherever it
   *  appears on the rendered pages. */
  highlightVerseKey?: string | null;
  /** Lets the caller (search jump, bookmark jump, follow-the-audio) turn the
   *  page programmatically via `.scrollToIndex({ index: page - 1 })`. */
  listRef?: React.RefObject<FlatList<number> | null>;
  /** Tap on a page's text surface (a swipe is still a page flip, never a tap). */
  onPagePress?: () => void;
};

const PAGES: number[] = Array.from({ length: QCF4_TOTAL_PAGES }, (_, i) => i + 1);

// A fitted page's text size is dictated by the page box, so the reader's size
// control doesn't apply in this mode (the header hides it) — pages always
// render at the print scale, where a line fills the page's full measure.
const PRINT_TEXT_SCALE = 1;

/** Horizontal pager over all 604 Madina Mushaf pages. Always inverted — a
 *  printed Mushaf turns pages right-to-left regardless of UI language. Each
 *  page fills the frame edge to edge and is shown whole: nothing scrolls,
 *  nothing is cut off, and no part of the screen is left blank. */
export function MadaniPager({
  initialPage,
  viewabilityConfig,
  onViewableItemsChanged,
  highlightVerseKey,
  listRef: externalListRef,
  onPagePress,
}: Props) {
  const styles = useStyles(createStyles);
  const ownListRef = useRef<FlatList<number>>(null);
  const listRef = externalListRef ?? ownListRef;
  // Pages must match the reading frame's viewport, so the list only mounts
  // once the real size is measured. Height is measured explicitly (not left
  // to flex:1) because a horizontal FlatList's cross-axis size is derived
  // from its rendered item's own height — if that item also relies on
  // flex:1 for its height, the two form a circular dependency that Yoga
  // resolves by collapsing to the smallest possible content size.
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    setPageWidth(e.nativeEvent.layout.width);
    setPageHeight(e.nativeEvent.layout.height);
  };

  // Tracks the currently visible page so a width change (device rotation)
  // can resync the scroll offset below — getItemLayout's offsets are all
  // computed from the new pageWidth, but the FlatList's actual scroll
  // position stays at its old (now-stale) pixel offset unless corrected,
  // which is what shows part of one page and part of the next after a flip.
  const lastIndexRef = useRef(initialPage - 1);
  const handleViewableItemsChanged = useCallback(
    (info: { viewableItems: { index: number | null }[] }) => {
      const idx = info.viewableItems[0]?.index;
      if (idx != null) lastIndexRef.current = idx;
      onViewableItemsChanged(info);
    },
    [onViewableItemsChanged]
  );

  const prevWidthRef = useRef(0);
  useEffect(() => {
    if (pageWidth > 0 && prevWidthRef.current > 0 && prevWidthRef.current !== pageWidth) {
      listRef.current?.scrollToOffset({
        offset: pageWidth * lastIndexRef.current,
        animated: false,
      });
    }
    prevWidthRef.current = pageWidth;
  }, [pageWidth, listRef]);

  const getItemLayout = useCallback(
    (_: ArrayLike<number> | null | undefined, index: number) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth]
  );

  // The page IS the frame — full width, full height, no scroll. Holding it to
  // the printed page's proportions instead would letterbox it on any frame
  // shorter than 1.5x its width (most phones once the header and player are
  // out), leaving a fifth of the screen as blank margin down both sides. A
  // frame that can't hold 15 lines at the full measure instead sets them a
  // shade smaller, and each line is justified back out to both edges
  // (MadaniPageLine), so the width goes to the word gaps rather than to
  // margins.
  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <MadaniPage
        page={item}
        width={pageWidth}
        height={pageHeight}
        highlightVerseKey={highlightVerseKey}
        textScale={PRINT_TEXT_SCALE}
        onPress={onPagePress}
      />
    ),
    [pageWidth, pageHeight, highlightVerseKey, onPagePress]
  );

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {pageWidth > 0 && pageHeight > 0 && (
        <FlatList
          ref={listRef}
          data={PAGES}
          keyExtractor={(page) => String(page)}
          horizontal
          pagingEnabled
          inverted
          showsHorizontalScrollIndicator={false}
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
          onViewableItemsChanged={handleViewableItemsChanged}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToOffset({
                offset: pageWidth * info.index,
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
