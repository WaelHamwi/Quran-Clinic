/** Typography tokens. Theme-independent.
 *  Figma uses Alexandria for UI text and MadaniArabic for displays.
 *  Amiri is kept for Mushaf verse rendering (purpose-built Quranic font). */

export const fontSize = {
  '2xs': 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 32,
} as const;

export const lineHeight = {
  '2xs': 16,
  xs: 18,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 30,
  displaySm: 38,
} as const;

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Loaded in `app/_layout.tsx`.
 *  - alexandria: Figma `Font family/font-family-text` — UI body text.
 *  - alexandriaBold/Medium/SemiBold: Alexandria weighted variants.
 *  - madani: Figma `Font weight/Display/2 = MadaniArabic-Medium` — display headings.
 *    MadaniArabic is NOT on Google Fonts; until a TTF is dropped in `assets/fonts/`,
 *    `madani` aliases to Alexandria SemiBold so styling stays consistent.
 *  - arabic / arabicBold: Amiri — kept for Mushaf verse rendering. */
export const fontFamily = {
  alexandria: 'Alexandria_400Regular',
  alexandriaLight: 'Alexandria_300Light',
  alexandriaMedium: 'Alexandria_500Medium',
  alexandriaSemiBold: 'Alexandria_600SemiBold',
  alexandriaBold: 'Alexandria_700Bold',
  madani: 'Alexandria_600SemiBold',
  arabic: 'Amiri_400Regular',
  arabicBold: 'Amiri_700Bold',
} as const;
