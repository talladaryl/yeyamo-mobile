import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { CAMEROON_BOOTSTRAP_CONFIGURATION } from './country.mappers';
import type { CountryConfiguration, CountryState, DiscoveryScope } from './country.types';

const STORAGE_KEY = 'yeyamo-country-preferences-v1';
type Persisted = Pick<CountryState, 'selectedCountryCode' | 'selectedCityId' | 'preferredLanguageCode' | 'discoveryScope'>;
const defaults: Persisted = { selectedCountryCode: 'CM', selectedCityId: null, preferredLanguageCode: 'fr', discoveryScope: 'COUNTRY' };
const configurationFor = (code: string | null): CountryConfiguration | null => code === 'CM' ? CAMEROON_BOOTSTRAP_CONFIGURATION : null;
const persist = (state: Persisted) => SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state));

export const useCountryStore = create<CountryState>((set, get) => ({
  ...defaults,
  countryConfiguration: CAMEROON_BOOTSTRAP_CONFIGURATION,
  isHydrated: false,
  hydrate: async () => {
    let restored = defaults;
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as Partial<Persisted> : undefined;
      if (parsed) restored = {
        selectedCountryCode: typeof parsed.selectedCountryCode === 'string' ? parsed.selectedCountryCode : defaults.selectedCountryCode,
        selectedCityId: typeof parsed.selectedCityId === 'string' ? parsed.selectedCityId : null,
        preferredLanguageCode: typeof parsed.preferredLanguageCode === 'string' ? parsed.preferredLanguageCode : defaults.preferredLanguageCode,
        discoveryScope: parsed.discoveryScope === 'LOCAL' || parsed.discoveryScope === 'COUNTRY' || parsed.discoveryScope === 'AFRICA' || parsed.discoveryScope === 'TRAVEL' ? parsed.discoveryScope : defaults.discoveryScope,
      };
    } catch { /* Une préférence locale corrompue ne bloque pas l'app. */ }
    const countryConfiguration = configurationFor(restored.selectedCountryCode) ?? CAMEROON_BOOTSTRAP_CONFIGURATION;
    set({ ...restored, selectedCountryCode: countryConfiguration.code, countryConfiguration, isHydrated: true });
  },
  selectCountry: async (countryConfiguration) => {
    const next = { ...get(), selectedCountryCode: countryConfiguration.code, countryConfiguration, selectedCityId: null };
    set(next); await persist(next);
  },
  setSelectedCityId: async (selectedCityId) => { const next = { ...get(), selectedCityId }; set(next); await persist(next); },
  setPreferredLanguageCode: async (preferredLanguageCode) => { const next = { ...get(), preferredLanguageCode }; set(next); await persist(next); },
  setDiscoveryScope: async (discoveryScope) => { const next = { ...get(), discoveryScope }; set(next); await persist(next); },
}));
