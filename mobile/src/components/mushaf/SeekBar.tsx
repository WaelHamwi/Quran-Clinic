import React, { useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { useStyles } from '@/hooks/common/useStyles';
import { createReaderStyles } from '@/styles/reader.styles';

type Props = {
  positionMillis: number;
  durationMillis: number;
  onSeek: (ms: number) => void;
};

/** Draggable audio scrub bar. Uses absolute pageX so the thumb tracks the
 *  finger even when it slides past the track edges. */
export const SeekBar = React.memo(function SeekBar({
  positionMillis,
  durationMillis,
  onSeek,
}: Props) {
  const styles = useStyles(createReaderStyles);

  const viewRef = useRef<View>(null);
  // Stores absolute screen position via measure() — more accurate than onLayout x during drag
  const trackRef = useRef({ pageX: 0, width: 1 });
  const durationRef = useRef(durationMillis);
  durationRef.current = durationMillis;
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const pctFromPageX = (pageX: number) => {
    const { pageX: tx, width } = trackRef.current;
    return Math.max(0, Math.min(1, (pageX - tx) / width));
  };

  const panHandlers = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setDragProgress(pctFromPageX(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        // pageX is absolute — stays correct as finger slides past the track edges
        setDragProgress(pctFromPageX(e.nativeEvent.pageX));
      },
      onPanResponderRelease: (e) => {
        const pct = pctFromPageX(e.nativeEvent.pageX);
        onSeekRef.current(pct * durationRef.current);
        setDragProgress(null);
      },
      onPanResponderTerminate: () => {
        setDragProgress(null);
      },
    })
  ).current;

  const progress =
    dragProgress !== null
      ? dragProgress
      : durationMillis > 0
      ? positionMillis / durationMillis
      : 0;

  const fillPct = `${(progress * 100).toFixed(2)}%`;

  return (
    <View
      ref={viewRef}
      style={styles.seekTrack}
      onLayout={() => {
        // measure() gives absolute pageX; onLayout only gives parent-relative position
        viewRef.current?.measure((_x, _y, width, _h, pageX) => {
          trackRef.current = { pageX, width: width || 1 };
        });
      }}
      {...panHandlers.panHandlers}
    >
      <View style={[styles.seekFill, { width: fillPct as any }]} />
      <View style={[styles.seekThumb, { left: fillPct as any }]} />
    </View>
  );
});
