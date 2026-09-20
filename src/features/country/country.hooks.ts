import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { countryApi } from './country.api';
import { mapCountryConfiguration, mapCountrySummary } from './country.mappers';
import { useCountryStore } from './country.store';
import type { CountryConfiguration, CountryFeatureCode, CountrySummary } from './country.types';

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
  return useQuery({
    queryKey: countryKeys.available(),
    queryFn: async () => {
      try {
        return (await countryApi.available()).map(mapCountrySummary);
      } catch (error) {
        // The legacy production endpoint interprets `/available` as a country
        // code. Fall back to the complete public list while that route is
        // being deployed, without masking unrelated failures.
        if (!isLegacyCountryEndpointError(error)) throw error;
        return (await countryApi.countries())
          .map(mapCountrySummary)
          .filter((country) => country.status === 'LIVE' || country.status === 'BETA');
      }
    },
  });
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
        // The deployed legacy countries endpoint only exposes the country
        // summary. A manually selected LIVE/BETA country must still allow
        // registration; use that public summary until the richer endpoint is
        // deployed, rather than treating it as an unavailable country.
        if (isLegacyCountryEndpointError(error)) {
          const mapped = legacyCountryConfiguration(await countryApi.country(countryCode!));
          await selectCountry(mapped);
          return mapped;
        }
        markUnavailable();
        throw error;
      }
    },
  });
}

export function useCountryCities(countryCode: string | null) {
  return useQuery({
    queryKey: countryKeys.cities(countryCode), enabled: Boolean(countryCode),
    queryFn: async () => {
      try {
        return await countryApi.cities(countryCode!);
      } catch (error) {
        // City selection remains optional on registration. The legacy API has
        // no country-scoped city route, so expose an empty optional list.
        if (isLegacyCountryEndpointError(error)) return [];
        throw error;
      }
    },
  });
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
      // Explorer and recommendations are user-personalized. Refresh only
      // these affected caches after a real server-side preference update.
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['discovery'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
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

function isLegacyCountryEndpointError(error: unknown): boolean {
  return typeof error === 'object' && error !== null
    && 'status' in error
    && ((error as { status?: unknown }).status === 400 || (error as { status?: unknown }).status === 404);
}

function legacyCountryConfiguration(dto: Parameters<typeof mapCountrySummary>[0]): CountryConfiguration {
  const country: CountrySummary = mapCountrySummary(dto);
  return {
    ...country,
    currencies: country.defaultCurrencyCode ? [country.defaultCurrencyCode] : [],
    timezones: country.defaultTimezone ? [country.defaultTimezone] : [],
    languages: [country.defaultLanguageCode],
    features: {
      registrationEnabled: country.registrationEnabled,
      contentPublishingEnabled: false,
      placePublishingEnabled: false,
      eventFeatureEnabled: false,
      partnerOnboardingEnabled: false,
      paymentsEnabled: false,
      bookingEnabled: false,
      ticketingEnabled: false,
      artisanCommerceEnabled: false,
      cultureModuleEnabled: false,
    },
  };
}
