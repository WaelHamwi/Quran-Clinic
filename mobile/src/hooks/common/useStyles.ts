import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/theme/colors';

/**
 * Turns a themed style factory into a memoized StyleSheet for the active theme.
 * Standardizes the `createStyles(theme)` pattern so every component consumes
 * styles the same way and re-styles automatically on light/dark toggle.
 *
 *   // Foo.styles.ts
 *   export const createStyles = (theme: Theme) => StyleSheet.create({ ... });
 *
 *   // Foo.tsx
 *   const s = useStyles(createStyles);
 *
 * The factory must be a stable module-level reference (not defined inline in
 * render) so the memo only recomputes when the theme changes.
 */
export function useStyles<T>(factory: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
