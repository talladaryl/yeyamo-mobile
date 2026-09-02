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
  background: '#FFFFFF',
  card: '#FFFFFF',
  elevated: '#F4F4F5',
  white: '#FFFFFF',
  textPrimary: '#18181B',
  textSecondary: '#52525B',
  textMuted: '#71717A',
  border: '#E4E4E7',
  danger: '#EF4444',  // Danger = YEYAMO rouge aussi
  success: '#22C55E',
} as const;

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const themeColors = {
  light: {
    primary: '#EF4444',
    accent: '#EF4444',
    accentSoft: '#FDE8E8',
    background: '#F1F5F9',
    surface: '#F7F9FC',
    card: '#FCFDFE',
    elevated: '#E8EEF5',
    surfaceElevated: '#FCFDFE',
    surfaceGlass: '#F8FBFCCC',
    surfaceGlassStrong: '#F8FBFCEB',
    text: '#162033',
    textPrimary: '#162033',
    textSecondary: '#4B5A70',
    textMuted: '#6B7A90',
    border: '#D8E2EC',
    borderSoft: '#D8E2EC',
    borderGlass: '#FFFFFFA8',
    overlay: 'rgba(15, 23, 42, 0.42)',
    tabBar: '#F8FBFCCC',
  },
  dark: {
    primary: '#EF4444',
    accent: '#FB5A5A',
    accentSoft: '#3F1E28',
    background: '#0B1420',
    surface: '#111D2B',
    card: '#152231',
    elevated: '#1B2A3A',
    surfaceElevated: '#1A2A3B',
    surfaceGlass: '#142336CC',
    surfaceGlassStrong: '#17283BE8',
    text: '#F3F7FB',
    textPrimary: '#F3F7FB',
    textSecondary: '#B7C3D2',
    textMuted: '#8797AA',
    border: '#2A3C50',
    borderSoft: '#2A3C50',
    borderGlass: '#6D819433',
    overlay: 'rgba(2, 8, 18, 0.62)',
    tabBar: '#142336CC',
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
