export type Theme = {
  isDark: boolean;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryMid: string;
  accent: string;
  error: string;
  activeVerseBg: string;
  playerBg: string;
  headerBg: string;
  tabHeaderBg: string;
  searchBg: string;
  verseArabicColor: string;
  // Figma-screen semantic tokens. Light values are pixel-identical to the
  // `palette` colors the screens used before they were themed; dark values are
  // chosen to match the dark surface system above.
  card: string;             // white card/sheet surface (was palette.white / bg.primary as a surface)
  cardBorder: string;       // card outline (was palette.border.secondary)
  divider: string;          // hairline dividers (was palette.border.tertiary)
  fieldBg: string;          // subtle input / disabled fill (was palette.bg.disabled / gray[100])
  textOnBrand: string;      // text/icon on a brand-colored surface (was palette.text.onBrand)
  textPlaceholder: string;  // placeholder / quaternary text (was palette.text.placeholder)
  iconMuted: string;        // muted icon / chevron (was palette.fg.quaternary / gray[400])
  brandSubtle: string;      // active row / icon-bubble tint (was palette.brand[25])
  brandSubtleBorder: string;// number-pill / subtle brand border (was palette.brand[50])
  onBrandMuted: string;     // muted text on brand backgrounds (was palette.text.secondaryOnBrand)
  success: string;          // green action button (was palette.secondaryGreen[600])
  overlayBg: string;        // translucent top-bar background (was palette.bg.overlay)
  backgroundGradient: readonly [string, string]; // PatternedBackground canvas stops (top → bottom)
  chatGradient: readonly [string, string]; // Ask-me chat canvas stops (top → bottom)
};

export const palette = {
  brand: {
    25: '#ebfafa',
    50: '#d5e9e9',
    100: '#c0d9d8',
    200: '#aac8c8',
    400: '#699695',
    500: '#135452',
    600: '#0f4342',
    700: '#0b3231',
  },
  secondaryGreen: {
    25: '#f9fdf8',
    50: '#e4efd9', // Figma 18085:1755 mushaf page background
    100: '#c8e6b0', // āyah marker circle fill — midpoint between 50 and 300
    300: '#97d88a',
    500: '#56c040',
    600: '#469b34',
  },
  lightGreen: { 25: '#eff9d5' },
  text: {
    primary: '#181d27',
    secondary: '#414651',
    tertiary: '#535862',
    quaternary: '#717680',
    placeholder: '#717680',
    onBrand: '#ffffff',
    secondaryOnBrand: '#aac8c8',
    brandTertiary: '#0f4342',
    white: '#ffffff',
  },
  bg: {
    primary: '#ffffff',
    overlay: 'rgba(255,255,255,0.5)',
    mushaf: '#F5F3ED',  // warm parchment page — Mushaf reader only
    quaternary: '#e9eaeb',
    disabled: '#f5f5f5',
    primarySolid: '#0a0d12',
  },
  border: {
    primary: '#d5d7da',
    secondary: '#e9eaeb',
    tertiary: '#f5f5f5',
    brand: '#135452',
  },
  fg: {
    secondary: '#414651',
    tertiary: '#535862',
    quaternary: '#a4a7ae',
    white: '#ffffff',
    disabled: '#a4a7ae',
    disabledSubtle: '#d5d7da',
  },
  gray: {
    50: '#f8f8f8', // Figma sponsor logo box background (18272:3686)
    100: '#f5f5f5',
    200: '#e9eaeb',
    400: '#a4a7ae',
    500: '#717680',
  },
  system: {
    error: { 25: '#fffbfa', 50: '#fef3f2', 500: '#f04438', 900: '#7a271a' },
    warning: { 25: '#fffcf5', 400: '#fdb022', 500: '#f79009', 800: '#93370d', 900: '#7a2e0e' },
    success: { 950: '#053321' },
  },
  accents: { green: '#34c759', sale: '#fb364a' },
  // iOS "Separators/Vibrant" hairline used inside native-style sheets.
  separator: '#e6e6e6',
  // Flag pill fills (country brand colors — constant across themes).
  flags: { sa: '#559e1c', gb: '#012169' },
  mint: {
    100: '#d1fae5', // AI chat avatar background (Figma 18081:2332)
    200: '#a7f3d0', // AI chat avatar border
  },
  white: '#ffffff',
  black: '#303030',
  shadow: '#313940',
  // Vivid fallback tints for category/icon tiles that have no server-set color.
  // Decorative accents (not surfaces) — intentionally constant across light/dark.
  tileFallback: ['#9a38f0', '#1ea525', '#f79009', '#f04438', '#3894f0'],
  // Named adhkar icon-bubble tints (Figma 18063:1291–1293) — decorative, constant.
  tile: { green: '#1ea525', purple: '#9a38f0', blue: '#3894f0', rose: '#f04438' },
  // Traditional Madani Mushaf palette — decorative, intentionally constant
  // across light/dark (the parchment page itself doesn't invert). Used only
  // by the Mushaf reader's reading surface (reader.styles.ts).
  mushaf: {
    ink: '#2C2C2C',        // verse & basmalah text
    surahName: '#C9A84C',  // surah header band (surahNameIcon font)
    verseNumber: '#8B4513',// ayah-end marker
    borderDark: '#5C4033', // inner border ring — dark brown, contrasts the gold outer ring
    accent: '#D4AF37',     // active-verse highlight, banner border
    bannerFill: '#F3E5C0', // pale gold tint — banner background (kept lighter than
                           // surahName/accent so the gold text stays readable on it)
    divider: '#D4C4A8',    // page-break divider
    juzTitle: '#8B0000',   // reserved for a future Juz indicator — not wired to any UI yet
    // Sampled directly from the ornamental title end-cap artwork
    // (assets/mushaf/title-endcap-*.png) so the stretchable CSS middle
    // section matches the photographic end-caps seamlessly.
    titleFill: '#E7F3DB',
    titleBorderGold: '#C86E28',
    // Dominant green sampled from the ornate page-border artwork
    // (assets/mushaf/frame-edge-*.png) — ties the title lines to the frame.
    titleBorderGreen: '#285838',
  },
} as const;

export const shadows = {
  lg: {
    shadowColor: '#313940',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  xl: {
    shadowColor: '#313940',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const lightTheme: Theme = {
  isDark: false,
  background: palette.bg.primary,
  surface: palette.gray[100],
  border: palette.border.primary,
  text: palette.text.primary,
  textSecondary: palette.text.secondary,
  textMuted: palette.text.tertiary,
  primary: palette.brand[500],
  primaryDark: palette.brand[700],
  primaryLight: palette.brand[25],
  primaryMid: palette.brand[600],
  accent: palette.secondaryGreen[500],
  error: palette.system.error[500],
  activeVerseBg: palette.brand[25],
  playerBg: palette.brand[700],
  headerBg: palette.bg.primary,
  tabHeaderBg: palette.brand[500],
  searchBg: palette.bg.primary,
  verseArabicColor: palette.mushaf.ink,
  card: palette.white,
  cardBorder: palette.border.secondary,
  divider: palette.border.tertiary,
  fieldBg: palette.bg.disabled,
  textOnBrand: palette.text.onBrand,
  textPlaceholder: palette.text.placeholder,
  iconMuted: palette.fg.quaternary,
  brandSubtle: palette.brand[25],
  brandSubtleBorder: palette.brand[50],
  onBrandMuted: palette.text.secondaryOnBrand,
  success: palette.secondaryGreen[600],
  overlayBg: palette.bg.overlay,
  // Soft mint→cream brand canvas (over white) — the original Figma gradient.
  backgroundGradient: ['rgba(249,253,248,0.5)', 'rgba(239,249,213,0.5)'],
  // Ask-me chat canvas — Figma 18081:2324 pre-blended branded gradient.
  chatGradient: ['#fcfefb', '#f7fcea'],
};

export const darkTheme: Theme = {
  isDark: true,
  background: '#0a0d12',
  surface: '#161b22',
  border: '#2a3038',
  text: '#f5f6f7',
  textSecondary: '#c5c8cc',
  textMuted: '#94989e',
  primary: palette.brand[400],
  primaryDark: palette.brand[700],
  primaryLight: palette.brand[600],
  primaryMid: palette.brand[500],
  accent: palette.secondaryGreen[300],
  error: palette.system.error[500],
  activeVerseBg: '#0b3231',
  playerBg: '#000000',
  headerBg: '#0a0d12',
  tabHeaderBg: palette.brand[700],
  searchBg: '#161b22',
  verseArabicColor: palette.mushaf.ink, // parchment canvas is fixed light — verse text must always be dark
  card: '#161b22',
  cardBorder: '#2a3038',
  divider: '#21262d',
  fieldBg: '#21262d',
  textOnBrand: '#ffffff',
  textPlaceholder: '#8b9098',
  iconMuted: '#6e7681',
  brandSubtle: '#0b3231',
  brandSubtleBorder: palette.brand[500],
  onBrandMuted: palette.text.secondaryOnBrand,
  success: palette.secondaryGreen[500],
  overlayBg: 'rgba(10,13,18,0.5)',
  // Deep teal→ink gradient: a subtle branded glow at the top fading to the base
  // background, giving dark screens depth instead of a flat near-black wash.
  backgroundGradient: ['#0e2826', '#0a0d12'],
  // Chat canvas mirrors the dark app canvas so bubbles (theme.card) read cleanly.
  chatGradient: ['#0e2826', '#0a0d12'],
};
