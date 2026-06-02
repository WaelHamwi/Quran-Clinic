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
  accents: { green: '#34c759' },
  mint: {
    100: '#d1fae5', // AI chat avatar background (Figma 18081:2332)
    200: '#a7f3d0', // AI chat avatar border
  },
  white: '#ffffff',
  black: '#303030',
  shadow: '#313940',
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
  verseArabicColor: palette.text.primary,
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
  verseArabicColor: '#f5f6f7',
};
