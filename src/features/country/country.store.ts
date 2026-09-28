import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import type { CountryState, UserCountryPreferences } from './country.types';

const STORAGE_KEY = 'yeyamo-country-preferences-v1';
type Persisted = Pick<CountryState, 'selectedCountryCode' | 'selectedCityId' | 'preferredLanguageCode' | 'discoveryScope'>;
const defaults: Persisted = { selectedCountryCode: null, selectedCityId: null, preferredLanguageCode: null, discoveryScope: 'COUNTRY' };
const persist = (state: Persisted) => SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state));
const persisted = (state: CountryState): Persisted => ({
  selectedCountryCode: state.selectedCountryCode, selectedCityId: state.selectedCityId,
  preferredLanguageCode: state.preferredLanguageCode, discoveryScope: state.discoveryScope,
});

export const useCountryStore = create<CountryState>((set, get) => ({
  ...defaults,
  countryConfiguration: null,
  isHydrated: false,
  resolutionStatus: 'PROFILE_LOADING',
  configurationError: null,
  hydrate: async () => {
    let restored = defaults;
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as Partial<Persisted> : undefined;
      if (parsed) restored = {
        selectedCountryCode: typeof parsed.selectedCountryCode === 'string' ? parsed.selectedCountryCode.toUpperCase() : null,
        selectedCityId: typeof parsed.selectedCityId === 'string' ? parsed.selectedCityId : null,
        preferredLanguageCode: typeof parsed.preferredLanguageCode === 'string' ? parsed.preferredLanguageCode : null,
        discoveryScope: parsed.discoveryScope === 'LOCAL' || parsed.discoveryScope === 'COUNTRY' || parsed.discoveryScope === 'AFRICA' || parsed.discoveryScope === 'TRAVEL' ? parsed.discoveryScope : defaults.discoveryScope,
      };
    } catch { /* A corrupted local preference must not block startup. */ }
    set({
      ...restored,
      countryConfiguration: null,
      isHydrated: true,
      // Never treat a device-cached country as a backend profile result.
      resolutionStatus: 'PROFILE_LOADING',
      configurationError: null,
    });
  },
  reset: async () => {
    try { await SecureStore.deleteItemAsync(STORAGE_KEY); } catch { /* The in-memory reset still protects account switching. */ }
    set({ ...defaults, countryConfiguration: null, isHydrated: true, resolutionStatus: 'PROFILE_LOADING', configurationError: null });
  },
  setProfileLoading: () => set({ resolutionStatus: 'PROFILE_LOADING', configurationError: null }),
  selectCountry: async (countryConfiguration) => {
    const current = get();
    const next = {
      ...current,
      selectedCountryCode: countryConfiguration.code,
      countryConfiguration,
      // Refreshing a configuration must not discard a city returned by the profile API.
      // A genuinely new country still resets the location, which avoids a cross-country city id.
      selectedCityId: current.selectedCountryCode === countryConfiguration.code ? current.selectedCityId : null,
      resolutionStatus: 'COUNTRY_READY' as const,
      configurationError: null,
    };
    set(next); await persist(persisted(next));
  },
  applyProfilePreferences: async (preferences: UserCountryPreferences) => {
    const next = {
      ...get(), selectedCountryCode: preferences.countryCode?.toUpperCase() ?? null,
      selectedCityId: preferences.cityId, preferredLanguageCode: preferences.preferredLanguageCode,
      resolutionStatus: preferences.countryCode ? 'COUNTRY_LOADING' as const : 'COUNTRY_MISSING' as const,
      countryConfiguration: preferences.countryCode ? get().countryConfiguration : null,
    };
    set(next); await persist(persisted(next));
  },
  markConfigurationUnavailable: () => set({
    countryConfiguration: null,
    configurationError: 'unavailable',
    resolutionStatus: 'COUNTRY_ERROR',
  }),
  setSelectedCityId: async (selectedCityId) => { const next = { ...get(), selectedCityId }; set(next); await persist(persisted(next)); },
  setPreferredLanguageCode: async (preferredLanguageCode) => { const next = { ...get(), preferredLanguageCode }; set(next); await persist(persisted(next)); },
  setDiscoveryScope: async (discoveryScope) => { const next = { ...get(), discoveryScope }; set(next); await persist(persisted(next)); },
}));
