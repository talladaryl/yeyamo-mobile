import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { countryApi } from './country.api';
import { mapCountryConfiguration, mapCountrySummary } from './country.mappers';
import { useCountryStore } from './country.store';
import type { CountryFeatureCode } from './country.types';

export const countryKeys = {
  all: ['countries'] as const,
  available: () => [...countryKeys.all, 'available'] as const,
  configuration: (code: string | null) => [...countryKeys.all, 'configuration', code] as const,
  cities: (code: string | null) => [...countryKeys.all, 'cities', code] as const,
  profile: () => [...countryKeys.all, 'profile'] as const,
};

export function useCountryFeature(featureCode: CountryFeatureCode): boolean {
  return useCountryStore((state) => state.countryConfiguration?.features[featureCode] ?? false);
}

export function useCountries() {
  return useQuery({ queryKey: countryKeys.all, queryFn: async () => (await countryApi.countries()).map(mapCountrySummary) });
}

export function useAvailableCountries() {
  return useQuery({ queryKey: countryKeys.available(), queryFn: async () => (await countryApi.available()).map(mapCountrySummary) });
}

export function useCountryConfiguration(countryCode: string | null) {
  const selectCountry = useCountryStore((state) => state.selectCountry);
  const markUnavailable = useCountryStore((state) => state.markConfigurationUnavailable);
  return useQuery({
    queryKey: countryKeys.configuration(countryCode), enabled: Boolean(countryCode), retry: 1,
    queryFn: async () => {
      try {
        const [configuration, flags] = await Promise.all([countryApi.configuration(countryCode!), countryApi.features(countryCode!)]);
        const mapped = mapCountryConfiguration(configuration, flags);
        await selectCountry(mapped);
        return mapped;
      } catch (error) {
        markUnavailable();
        throw error;
      }
    },
  });
}

export function useCountryCities(countryCode: string | null) {
  return useQuery({ queryKey: countryKeys.cities(countryCode), enabled: Boolean(countryCode), queryFn: () => countryApi.cities(countryCode!) });
}

export function useCountryProfile() {
  const backendSession = useAuthStore((state) => state.sessionMode === 'backend');
  const applyProfilePreferences = useCountryStore((state) => state.applyProfilePreferences);
  return useQuery({
    queryKey: [...countryKeys.profile(), backendSession ? 'backend' : 'local'], enabled: backendSession,
    queryFn: async () => {
      const preferences = await countryApi.myPreferences();
      await applyProfilePreferences(preferences);
      return preferences;
    },
  });
}

export function useSelectCountry() {
  const queryClient = useQueryClient();
  const selectCountry = useCountryStore((state) => state.selectCountry);
  const applyProfilePreferences = useCountryStore((state) => state.applyProfilePreferences);
  return useMutation({
    mutationFn: async (countryCode: string) => {
      const [configuration, flags] = await Promise.all([countryApi.configuration(countryCode), countryApi.features(countryCode)]);
      const country = mapCountryConfiguration(configuration, flags);
      const profile = await countryApi.updateLocation({ countryCode: country.code, cityId: null, timezone: country.defaultTimezone });
      await selectCountry(country);
      await applyProfilePreferences(profile);
      return country;
    },
    onSuccess: (country) => {
      queryClient.setQueryData(countryKeys.configuration(country.code), country);
      queryClient.invalidateQueries({ queryKey: countryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: countryKeys.cities(country.code) });
    },
  });
}

function useCountryPreferenceMutation<TInput>(mutation: (input: TInput) => Promise<import('./country.types').UserCountryPreferences>) {
  const queryClient = useQueryClient();
  const applyProfilePreferences = useCountryStore((state) => state.applyProfilePreferences);
  return useMutation({
    mutationFn: mutation,
    onSuccess: async (preferences) => {
      await applyProfilePreferences(preferences);
      queryClient.invalidateQueries({ queryKey: countryKeys.profile() });
    },
  });
}

export function useUpdateCountryLocation() { return useCountryPreferenceMutation(countryApi.updateLocation); }
export function useUpdateCountryLanguage() { return useCountryPreferenceMutation(countryApi.updateLanguage); }
export function useUpdateCountryDiscoveryPreferences() { return useCountryPreferenceMutation(countryApi.updateDiscoveryPreferences); }

export function useCountry() {
  return useCountryStore((state) => ({
    selectedCountryCode: state.selectedCountryCode,
    countryConfiguration: state.countryConfiguration,
    selectedCityId: state.selectedCityId,
    preferredLanguageCode: state.preferredLanguageCode,
    discoveryScope: state.discoveryScope,
    configurationError: state.configurationError,
  }));
}
