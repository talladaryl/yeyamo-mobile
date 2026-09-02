import { apiGet, apiPatch } from '@/services/api/client';
import type { CountryCity, UserCountryPreferences } from './country.types';
import type { CountryConfigurationDto } from './country.mappers';

type CountryDto = CountryConfigurationDto['country'];
type FeatureFlagsDto = Omit<CountryDto, 'code' | 'name' | 'defaultLanguageCode' | 'defaultCurrencyCode' | 'defaultTimezone' | 'phoneCountryCode' | 'launchStatus'>;

const code = (value: string) => encodeURIComponent(value.toUpperCase());

export const countryApi = {
  countries: () => apiGet<CountryDto[]>('/countries'),
  available: () => apiGet<CountryDto[]>('/countries/available'),
  country: (countryCode: string) => apiGet<CountryDto>(`/countries/${code(countryCode)}`),
  configuration: (countryCode: string) => apiGet<CountryConfigurationDto>(`/countries/${code(countryCode)}/configuration`),
  features: (countryCode: string) => apiGet<FeatureFlagsDto>(`/countries/${code(countryCode)}/features`),
  languages: (countryCode: string) => apiGet<CountryConfigurationDto['languages']>(`/countries/${code(countryCode)}/languages`),
  currencies: (countryCode: string) => apiGet<CountryConfigurationDto['currencies']>(`/countries/${code(countryCode)}/currencies`),
  timezones: (countryCode: string) => apiGet<CountryConfigurationDto['timezones']>(`/countries/${code(countryCode)}/timezones`),
  cities: (countryCode: string) => apiGet<CountryCity[]>(`/countries/${code(countryCode)}/cities`),
  myPreferences: () => apiGet<UserCountryPreferences>('/users/me'),
  updateLocation: (input: Pick<UserCountryPreferences, 'countryCode' | 'cityId' | 'timezone'> & { adminLevel1Id?: string | null; adminLevel2Id?: string | null; localityId?: string | null }) =>
    apiPatch<UserCountryPreferences>('/users/me/location', input),
  updateLanguage: (input: Pick<UserCountryPreferences, 'preferredLanguageCode' | 'contentLanguages'>) =>
    apiPatch<UserCountryPreferences>('/users/me/language', input),
  updateDiscoveryPreferences: (input: Pick<UserCountryPreferences, 'contentCountries' | 'localRadiusKm' | 'discoverAfricanContent' | 'preferredCurrencyCode'> & { contentLanguages?: string[] }) => {
    const { contentLanguages: _contentLanguages, ...body } = input;
    return apiPatch<UserCountryPreferences>('/users/me/discovery-preferences', body);
  },
};
