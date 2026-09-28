import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { countryApi } from './country.api';
import { mapCountryConfiguration, mapCountrySummary } from './country.mappers';
import { useCountryStore } from './country.store';
import { traceCountryRuntime } from './country.runtime-trace';
import type { CountryConfiguration, CountryFeatureCode, CountrySummary } from './country.types';

export const countryKeys = {
  all: ['countries'] as const,
  available: () => [...countryKeys.all, 'available'] as const,
  configuration: (code: string | null) => [...countryKeys.all, 'configuration', code] as const,
  administrativeAreas: (code: string | null) => [...countryKeys.all, 'administrative-areas', code] as const,
  cities: (code: string | null) => [...countryKeys.all, 'cities', code] as const,
  localities: (cityId: string | null) => [...countryKeys.all, 'localities', cityId] as const,
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
  const referencesEnabled = useCountryReferenceQueriesEnabled(countryCode);
  return useQuery({
    queryKey: countryKeys.cities(countryCode), enabled: referencesEnabled,
    queryFn: async () => {
      try {
        traceCountryRuntime('CITIES_REQUEST', { queryKey: countryKeys.cities(countryCode), url: `/countries/${countryCode}/cities`, countryCode });
        const cities = await countryApi.cities(countryCode!);
        traceCountryRuntime('CITIES_RESPONSE', { queryKey: countryKeys.cities(countryCode), url: `/countries/${countryCode}/cities`, countryCode, rawCount: cities.length, parsedCount: cities.length });
        return cities;
      } catch (error) {
        // City selection remains optional on registration. The legacy API has
        // no country-scoped city route, so expose an empty optional list.
        if (isLegacyCountryEndpointError(error)) return [];
        throw error;
      }
    },
  });
}

export function useCountryAdministrativeAreas(countryCode: string | null) {
  const referencesEnabled = useCountryReferenceQueriesEnabled(countryCode);
  return useQuery({
    queryKey: countryKeys.administrativeAreas(countryCode), enabled: referencesEnabled,
    queryFn: async () => {
      traceCountryRuntime('ADMINISTRATIVE_AREAS_REQUEST', { queryKey: countryKeys.administrativeAreas(countryCode), url: `/countries/${countryCode}/administrative-areas`, countryCode });
      const areas = await countryApi.administrativeAreas(countryCode!);
      traceCountryRuntime('ADMINISTRATIVE_AREAS_RESPONSE', { queryKey: countryKeys.administrativeAreas(countryCode), url: `/countries/${countryCode}/administrative-areas`, countryCode, rawCount: areas.length, parsedCount: areas.length });
      return areas;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCountryLocalities(cityId: string | null) {
  const resolutionStatus = useCountryStore((state) => state.resolutionStatus);
  const backendSession = useAuthStore((state) => state.sessionMode === 'backend');
  return useQuery({
    queryKey: countryKeys.localities(cityId),
    enabled: Boolean(cityId) && (!backendSession || resolutionStatus !== 'PROFILE_LOADING'),
    queryFn: async () => {
      traceCountryRuntime('LOCALITIES_REQUEST', { queryKey: countryKeys.localities(cityId), url: `/cities/${cityId}/localities`, cityId });
      const localities = await countryApi.localities(cityId!);
      traceCountryRuntime('LOCALITIES_RESPONSE', { queryKey: countryKeys.localities(cityId), url: `/cities/${cityId}/localities`, cityId, rawCount: localities.length, parsedCount: localities.length });
      return localities;
    },
    staleTime: 5 * 60 * 1000,
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
    resolutionStatus: state.resolutionStatus,
    configurationError: state.configurationError,
  }));
}

/**
 * Registration remains a guest flow.  Authenticated Create screens, however,
 * must wait for the canonical `/users/me` country before requesting dependent
 * references; otherwise a previous account's SecureStore country can leak
 * into the query cache during a cold login.
 */
function useCountryReferenceQueriesEnabled(countryCode: string | null): boolean {
  const resolutionStatus = useCountryStore((state) => state.resolutionStatus);
  const backendSession = useAuthStore((state) => state.sessionMode === 'backend');
  return Boolean(countryCode) && (!backendSession || resolutionStatus !== 'PROFILE_LOADING');
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
