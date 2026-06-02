/** Spacing scale (dp). Theme-independent — shared across light/dark.
 *  Existing scale (used widely across the codebase). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Figma spacing tokens (Spacing/xs..xl). Tighter than the legacy scale.
 *  Use for new Figma-accurate layouts: Spacing/xs=4, sm=6, md=8, lg=12, xl=16. */
export const space = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

/** Border-radius scale (Figma Corner Radius tokens). */
export const radius = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

/** Standard hit-slop for small pressable icons. */
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
