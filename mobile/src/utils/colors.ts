import { palette } from '@/theme/colors';

function expand(hex: string): string {
  const h = hex.replace('#', '');
  return h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
}

/** Perceived brightness of a `#rgb`/`#rrggbb` colour, 0 (black) → 1 (white). */
export function luminance(hex: string): number {
  const h = expand(hex);
  if (!/^[0-9a-f]{6}$/i.test(h)) return 0;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const MID = 0.6;

/**
 * The reading-text colour the user picked belongs to one of two palettes (one
 * authored for the light card, one for the dark card). The card can end up dark
 * for a reason the picker never saw — the app theme itself being dark — so a
 * colour chosen for the other surface would render invisible. Swap it for the
 * default of the surface actually being drawn.
 */
export function readableOn(color: string, darkSurface: boolean): string {
  const lum = luminance(color);
  if (darkSurface) return lum < MID ? palette.white : color;
  return lum > MID ? palette.text.primary : color;
}
