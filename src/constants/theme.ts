export const colors = {
  // Couleurs YEYAMO officielles
  yeyamo: {
    primary: '#EF4444',
    secondary: '#DC2626',
    dark: '#B91C1C',
  },
  primary: '#EF4444',  // Couleur principale = YEYAMO rouge
  primaryLight: '#FEE2E2',
  accent: '#F59E0B',
  background: '#0A0A0A',
  card: '#161616',
  elevated: '#1F1F1F',
  white: '#FFFFFF',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#52525B',
  border: '#27272A',
  danger: '#EF4444',  // Danger = YEYAMO rouge aussi
  success: '#22C55E',
} as const;

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const themeColors = {
  light: {
    primary: '#EF4444',
    background: '#FFFFFF',
    surface: '#F7F7F8',
    card: '#FFFFFF',
    elevated: '#F1F1F2',
    text: '#18181B',
    textSecondary: '#52525B',
    textMuted: '#71717A',
    border: '#E4E4E7',
    tabBar: '#FFFFFF',
  },
  dark: {
    primary: '#EF4444',
    background: '#0A0A0A',
    surface: '#111111',
    card: '#161616',
    elevated: '#1F1F1F',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    border: '#27272A',
    tabBar: '#0A0A0A',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;
