import { useMemo } from 'react';
import { usePlayer } from '@/hooks/player/usePlayer';
import { useTheme } from '@/context/ThemeContext';
import { readableOn } from '@/utils/colors';

/**
 * Resolves how the wird reading card is painted. The card is dark when the
 * player's reading dark-mode is on OR the app theme is dark — the text colour
 * must follow both, not just the player toggle.
 */
export function useReadingSurface() {
  const { textColor, fontSize, isDarkMode } = usePlayer();
  const { theme } = useTheme();
  const darkSurface = isDarkMode || theme.isDark;

  return useMemo(
    () => ({ darkSurface, fontSize, textColor: readableOn(textColor, darkSurface) }),
    [darkSurface, fontSize, textColor],
  );
}
