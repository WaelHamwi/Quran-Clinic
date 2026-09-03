import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/diseaseScreen.styles';
import { palette } from '@/theme/colors';
import { WirdReader } from '@/components/players/WirdReader';
import { LockedWird } from '@/components/players/LockedWird';
import { occurrenceKeyOf } from '@/utils/recordings';
import type { AccessibleRecording } from '@/types/recording';

type Props = {
  viewedLocked: boolean;
  /** Every session of the tab being read, in play order. */
  sessions: AccessibleRecording[];
  displayed: AccessibleRecording | undefined;
  isDarkMode: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onSubscribe: () => void;
  onReturn: () => void;
  /** Message shown when the source has no recordings to display. */
  emptyText?: string;
};

/** The reading card: paywall (locked), karaoke segments, plain verse text, or an
 *  empty/refreshable surface. Figma nodes 18032:3107 / 18972:3492 (locked). */
export function WirdSectionCard({
  viewedLocked,
  sessions,
  displayed,
  isDarkMode,
  refreshing,
  onRefresh,
  onSubscribe,
  onReturn,
  emptyText,
}: Props) {
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  // palette.brand[700] is the deliberately fixed dark reading-card surface (see CLAUDE.md).
  return (
    <View style={[s.sectionCard, isDarkMode && { backgroundColor: palette.brand[700] }]}>
      {viewedLocked ? (
        <LockedWird onSubscribe={onSubscribe} onReturn={onReturn} />
      ) : (
        (() => {
          const refreshCtrl = (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          );
          const readable = sessions.filter(
            (r) => (r.segments?.length ?? 0) > 0 || !!r.description,
          );

          if (readable.length === 0) {
            return (
              <ScrollView
                contentContainerStyle={s.cardScroll}
                showsVerticalScrollIndicator={false}
                refreshControl={refreshCtrl}
              >
                {emptyText ? (
                  // The reading card is fixed-dark in player dark mode, so the
                  // muted (dark) theme colour would vanish on it.
                  <Text style={[s.emptyText, isDarkMode && { color: palette.brand[200] }]}>
                    {emptyText}
                  </Text>
                ) : null}
              </ScrollView>
            );
          }

          return (
            <WirdReader
              recordings={readable}
              playingKey={displayed ? occurrenceKeyOf(displayed) : undefined}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          );
        })()
      )}
    </View>
  );
}
