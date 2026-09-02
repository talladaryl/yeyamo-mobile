import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { colorScheme } from 'nativewind';
import { themeColors, type ResolvedTheme, type ThemePreference } from '@/constants/theme';

// V2 intentionally starts existing installs on the new light-first experience.
// Subsequent user choices are persisted under this key.
const STORAGE_KEY = 'yeyamo-theme-preference-v2';

type ThemeStore = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  colors: typeof themeColors.light | typeof themeColors.dark;
  isHydrated: boolean;
  hydrateTheme: () => Promise<void>;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  syncSystemTheme: () => void;
};

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }

  return preference;
}

function valuesFor(preference: ThemePreference) {
  const resolvedTheme = resolveTheme(preference);
  colorScheme.set(preference);
  return {
    preference,
    resolvedTheme,
    colors: themeColors[resolvedTheme],
  };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...valuesFor('light'),
  isHydrated: false,

  hydrateTheme: async () => {
    const storedPreference = await SecureStore.getItemAsync(STORAGE_KEY);
    const preference =
      storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system'
        ? storedPreference
        : 'light';

    set({ ...valuesFor(preference), isHydrated: true });
  },

  setThemePreference: async (preference) => {
    await SecureStore.setItemAsync(STORAGE_KEY, preference);
    set(valuesFor(preference));
  },

  syncSystemTheme: () => {
    if (get().preference === 'system') {
      set(valuesFor('system'));
    }
  },
}));
