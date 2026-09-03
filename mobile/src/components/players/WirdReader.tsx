import React, { useCallback, useRef } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { palette } from '@/theme/colors';
import { usePlayer } from '@/hooks/player/usePlayer';
import { useStyles } from '@/hooks/common/useStyles';
import { KaraokeBlock } from './KaraokeBlock';
import { VerseBlock } from './VerseBlock';
import { createStyles } from './WirdReader.styles';
import { occurrenceKeyOf } from '@/utils/recordings';
import type { AccessibleRecording } from '@/types/recording';

interface Props {
  /** Every session of the tab being read, in play order. */
  recordings: AccessibleRecording[];
  /**
   * The session currently playing — the only block that highlights and
   * auto-scrolls. An occurrence key, not a recording id: a ruqyah that returns
   * to the same recording later would otherwise light up both blocks at once.
   */
  playingKey?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * The sessions of one tab are a single ruqyah, so their texts read as one
 * document rather than one screen each. Only the playing session highlights;
 * the rest stay legible above and below it so the whole ruqyah can be read
 * ahead of the audio.
 */
function WirdReaderBase({ recordings, playingKey, refreshing, onRefresh }: Props) {
  const { isDarkMode } = usePlayer();
  const s = useStyles(createStyles);
  const scrollRef = useRef<ScrollView>(null);
  const blockTops = useRef<number[]>([]);

  // A block reports its active row relative to itself; adding the block's own
  // offset turns that into a position in the shared scroll.
  const scrollToActiveRow = useCallback((blockIndex: number, rowY: number) => {
    const top = blockTops.current[blockIndex] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, top + rowY - 80), animated: true });
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      style={[s.scroll, isDarkMode && { backgroundColor: palette.brand[700] }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={palette.brand[500]}
            colors={[palette.brand[500]]}
          />
        ) : undefined
      }
    >
      {recordings.map((recording, index) => {
        const live = occurrenceKeyOf(recording) === playingKey;
        const hasSegments = (recording.segments?.length ?? 0) > 0;

        if (!hasSegments && !recording.description) return null;

        return (
          <View
            key={occurrenceKeyOf(recording)}
            onLayout={(e) => { blockTops.current[index] = e.nativeEvent.layout.y; }}
          >
            {index > 0 && <View style={s.sessionDivider} />}

            {hasSegments ? (
              <KaraokeBlock
                segments={recording.segments!}
                live={live}
                onActiveRowY={live ? (y) => scrollToActiveRow(index, y) : undefined}
              />
            ) : (
              <VerseBlock
                text={recording.description!}
                live={live}
                onActiveRowY={live ? (y) => scrollToActiveRow(index, y) : undefined}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

export const WirdReader = React.memo(WirdReaderBase);
