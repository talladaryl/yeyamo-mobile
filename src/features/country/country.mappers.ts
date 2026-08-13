import type { CountryConfiguration, CountryFeatureCode, CountrySummary } from './country.types';

type CountryDto = {
  code: string; name: string; defaultLanguageCode: string; defaultCurrencyCode: string;
  defaultTimezone: string; phoneCountryCode: string | null; launchStatus: string;
  registrationEnabled: boolean | null; contentPublishingEnabled: boolean | null;
  placePublishingEnabled: boolean | null; eventFeatureEnabled: boolean | null;
  partnerOnboardingEnabled: boolean | null; paymentsEnabled: boolean | null;
  bookingEnabled: boolean | null; ticketingEnabled: boolean | null;
  artisanCommerceEnabled: boolean | null; cultureModuleEnabled: boolean | null;
};

type FeatureFlagsDto = Omit<CountryDto, 'code' | 'name' | 'defaultLanguageCode' | 'defaultCurrencyCode' | 'defaultTimezone' | 'phoneCountryCode' | 'launchStatus'>;

export type CountryConfigurationDto = {
  country: CountryDto;
  languages: { languageCode: string; isDefault: boolean }[];
  currencies: { currencyCode: string; isDefault: boolean }[];
  timezones: { timezone: string; isDefault: boolean }[];
};

const featureCodes: CountryFeatureCode[] = [
  'registrationEnabled', 'contentPublishingEnabled', 'placePublishingEnabled', 'eventFeatureEnabled',
  'partnerOnboardingEnabled', 'paymentsEnabled', 'bookingEnabled', 'ticketingEnabled',
  'artisanCommerceEnabled', 'cultureModuleEnabled',
];

function countryStatus(value: string): CountrySummary['status'] {
  return value === 'LIVE' || value === 'BETA' || value === 'COMING_SOON' || value === 'DISABLED' ? value : 'DISABLED';
}

function mapFeatures(source: CountryDto | FeatureFlagsDto): CountryConfiguration['features'] {
  const values = source as Record<string, unknown>;
  return Object.fromEntries(featureCodes.map((code) => [code, Boolean(values[code])])) as CountryConfiguration['features'];
}

export function mapCountrySummary(dto: CountryDto): CountrySummary {
  return {
    code: dto.code.toUpperCase(), name: dto.name, flag: getCountryFlag(dto.code), status: countryStatus(dto.launchStatus),
    registrationEnabled: Boolean(dto.registrationEnabled), defaultCurrencyCode: dto.defaultCurrencyCode,
    defaultTimezone: dto.defaultTimezone, defaultLanguageCode: dto.defaultLanguageCode,
    callingCode: dto.phoneCountryCode,
  };
}

export function mapCountryConfiguration(dto: CountryConfigurationDto, featureFlags?: FeatureFlagsDto): CountryConfiguration {
  const country = mapCountrySummary(dto.country);
  return {
    ...country,
    currencies: dto.currencies.map((item) => item.currencyCode),
    timezones: dto.timezones.map((item) => item.timezone),
    languages: dto.languages.map((item) => item.languageCode),
    features: mapFeatures(featureFlags ?? dto.country),
  };
}

export function getCountryFlag(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map((letter) => 127397 + letter.charCodeAt(0)));
}
