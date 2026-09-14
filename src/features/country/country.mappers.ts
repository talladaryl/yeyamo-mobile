import type { CountryConfiguration, CountryFeatureCode, CountrySummary } from './country.types';

/**
 * The country-config service uses `code`. The production gateway may still
 * temporarily serve the legacy place-service response, which uses
 * `countryCode` and omits configuration flags. Keep this adapter at the API
 * boundary so callers always receive one stable mobile shape.
 */
export type CountryDto = {
  code?: string; countryCode?: string; name: string; defaultLanguageCode?: string; defaultCurrencyCode?: string;
  defaultTimezone?: string; phoneCountryCode?: string | null; launchStatus: string;
  registrationEnabled?: boolean | null; contentPublishingEnabled?: boolean | null;
  placePublishingEnabled?: boolean | null; eventFeatureEnabled?: boolean | null;
  partnerOnboardingEnabled?: boolean | null; paymentsEnabled?: boolean | null;
  bookingEnabled?: boolean | null; ticketingEnabled?: boolean | null;
  artisanCommerceEnabled?: boolean | null; cultureModuleEnabled?: boolean | null;
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

// The legacy public endpoint temporarily omits phoneCountryCode. These are
// only used as a compatibility fallback; the country-config value always wins.
const legacyCallingCodes: Record<string, string> = {
  ZA: '+27', CM: '+237', CI: '+225', ET: '+251', GH: '+233',
  KE: '+254', NG: '+234', RW: '+250', SN: '+221', TZ: '+255',
};

function countryStatus(value: string): CountrySummary['status'] {
  return value === 'LIVE' || value === 'BETA' || value === 'COMING_SOON' || value === 'DISABLED' ? value : 'DISABLED';
}

function mapFeatures(source: CountryDto | FeatureFlagsDto): CountryConfiguration['features'] {
  const values = source as Record<string, unknown>;
  return Object.fromEntries(featureCodes.map((code) => [code, Boolean(values[code])])) as CountryConfiguration['features'];
}

export function mapCountrySummary(dto: CountryDto): CountrySummary {
  const code = dto.code ?? dto.countryCode;
  if (!code || !/^[A-Za-z]{2}$/.test(code)) {
    throw new Error('La réponse du serveur pour ce pays est invalide.');
  }
  const normalizedCode = code.toUpperCase();
  const status = countryStatus(dto.launchStatus);
  return {
    code: normalizedCode, name: dto.name, flag: getCountryFlag(code), status,
    // The legacy endpoint has no feature flags. LIVE/BETA was its only
    // registration signal, so retain that historical behaviour until the
    // country-config deployment is active.
    registrationEnabled: typeof dto.registrationEnabled === 'boolean'
      ? dto.registrationEnabled
      : status === 'LIVE' || status === 'BETA',
    defaultCurrencyCode: dto.defaultCurrencyCode ?? '',
    defaultTimezone: dto.defaultTimezone ?? 'UTC', defaultLanguageCode: dto.defaultLanguageCode ?? 'fr',
    callingCode: dto.phoneCountryCode ?? legacyCallingCodes[normalizedCode] ?? null,
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
