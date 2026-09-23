export type CountryStatus = 'LIVE' | 'BETA' | 'COMING_SOON' | 'DISABLED';

export type CountryFeatureCode =
  | 'registrationEnabled'
  | 'contentPublishingEnabled'
  | 'placePublishingEnabled'
  | 'eventFeatureEnabled'
  | 'partnerOnboardingEnabled'
  | 'paymentsEnabled'
  | 'bookingEnabled'
  | 'ticketingEnabled'
  | 'artisanCommerceEnabled'
  | 'cultureModuleEnabled';

export type DiscoveryScope = 'LOCAL' | 'COUNTRY' | 'AFRICA' | 'TRAVEL';

export interface CountryConfiguration {
  code: string;
  name: string;
  flag: string;
  status: CountryStatus;
  currencies: string[];
  defaultCurrencyCode: string;
  callingCode: string | null;
  timezones: string[];
  defaultTimezone: string;
  languages: string[];
  features: Record<CountryFeatureCode, boolean>;
}

export interface CountrySummary {
  code: string;
  name: string;
  flag: string;
  status: CountryStatus;
  registrationEnabled: boolean;
  defaultCurrencyCode: string;
  defaultTimezone: string;
  defaultLanguageCode: string;
  callingCode: string | null;
}

export interface CountryCity {
  id: string;
  countryCode: string;
  administrativeAreaId: string | null;
  name: string;
  slug: string;
  active: boolean;
}

/**
 * Geographic references owned by country-config-service.  Their identifiers
 * are passed through to write APIs; a rendered name is never used as an ID.
 */
export interface CountryAdministrativeArea {
  id: string;
  countryCode: string;
  parentId: string | null;
  level: number;
  name: string;
  slug: string;
  active: boolean;
}

export interface CountryLocality {
  id: string;
  countryCode: string;
  administrativeAreaId: string | null;
  cityId: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface UserCountryPreferences {
  countryCode: string | null;
  cityId: string | null;
  preferredLanguageCode: string | null;
  timezone: string | null;
  preferredCurrencyCode: string | null;
  contentCountries: string[];
  contentLanguages: string[];
  localRadiusKm: number | null;
  discoverAfricanContent: boolean;
}

export interface CountryState {
  selectedCountryCode: string | null;
  countryConfiguration: CountryConfiguration | null;
  selectedCityId: string | null;
  preferredLanguageCode: string | null;
  discoveryScope: DiscoveryScope;
  isHydrated: boolean;
  configurationError: 'unavailable' | null;
  hydrate: () => Promise<void>;
  selectCountry: (configuration: CountryConfiguration) => Promise<void>;
  applyProfilePreferences: (preferences: UserCountryPreferences) => Promise<void>;
  markConfigurationUnavailable: () => void;
  setSelectedCityId: (cityId: string | null) => Promise<void>;
  setPreferredLanguageCode: (languageCode: string | null) => Promise<void>;
  setDiscoveryScope: (scope: DiscoveryScope) => Promise<void>;
}
