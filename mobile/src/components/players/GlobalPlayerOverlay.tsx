import React from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@/store/hooks';
import { selectMiniPlayerVisible } from '@/store/slices/playerSlice';
import { useGeneralRuqyah } from '@/hooks/player/useGeneralRuqyah';
import { useMushafAudio } from '@/context/MushafAudioContext';
import { useStyles } from '@/hooks/common/useStyles';
import { shouldHideGlobalPlayer } from '@/utils/playerOverlay';
import { MiniPlayer } from './MiniPlayer';
import { MushafMiniPlayer } from './MushafMiniPlayer';
import { createStyles } from './GlobalPlayerOverlay.styles';

export function GlobalPlayerOverlay() {
  const s = useStyles(createStyles);
  const pathname = usePathname();
  const { bottom } = useSafeAreaInsets();

  const ruqyahVisible = useAppSelector(selectMiniPlayerVisible);
  const { isGeneralMode } = useGeneralRuqyah();
  const mushafAudio = useMushafAudio();

  // Mirrors the bars' own render conditions — the wrapper must vanish with
  // them, or its surface-coloured safe-area padding would paint an empty strip.
  const anyVisible =
    (ruqyahVisible && !isGeneralMode) ||
    (mushafAudio.playingSurah != null && mushafAudio.hasSource);

  if (shouldHideGlobalPlayer(pathname)) return null;
  if (!anyVisible) return null;

  return (
    <View style={[s.wrap, { paddingBottom: bottom }]}>
      <MushafMiniPlayer />
      <MiniPlayer />
    </View>
  );
}
