export type CountryStatus = 'LIVE' | 'BETA' | 'COMING_SOON' | 'DISABLED';

export type CountryFeatureCode =
  | 'paymentsEnabled'
  | 'bookingEnabled'
  | 'ticketingEnabled'
  | 'artisanCommerceEnabled'
  | 'cultureModuleEnabled'
  | 'partnerOnboardingEnabled'
  | 'contentPublishingEnabled';

export type DiscoveryScope = 'LOCAL' | 'COUNTRY' | 'AFRICA' | 'TRAVEL';

export interface CountryConfiguration {
  code: string;
  name: string;
  flag: string;
  status: CountryStatus;
  currencies: string[];
  defaultCurrencyCode: string;
  callingCode: string;
  timezones: string[];
  defaultTimezone: string;
  languages: string[];
  features: Record<CountryFeatureCode, boolean>;
}

export interface CountryState {
  selectedCountryCode: string | null;
  countryConfiguration: CountryConfiguration | null;
  selectedCityId: string | null;
  preferredLanguageCode: string | null;
  discoveryScope: DiscoveryScope;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  selectCountry: (configuration: CountryConfiguration) => Promise<void>;
  setSelectedCityId: (cityId: string | null) => Promise<void>;
  setPreferredLanguageCode: (languageCode: string | null) => Promise<void>;
  setDiscoveryScope: (scope: DiscoveryScope) => Promise<void>;
}
