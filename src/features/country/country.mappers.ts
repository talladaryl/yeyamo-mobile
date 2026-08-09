import type { CountryConfiguration } from './country.types';

/**
 * Configuration de démarrage limitée au pays lancé. Ce n'est pas une réponse
 * simulée : country.api.ts prendra le relais quand le service sera exposé.
 */
export const CAMEROON_BOOTSTRAP_CONFIGURATION: CountryConfiguration = {
  code: 'CM', name: 'Cameroun', flag: '🇨🇲', status: 'LIVE',
  currencies: ['XAF'], defaultCurrencyCode: 'XAF', callingCode: '+237',
  timezones: ['Africa/Douala'], defaultTimezone: 'Africa/Douala', languages: ['fr', 'en'],
  features: {
    paymentsEnabled: true, bookingEnabled: true, ticketingEnabled: true,
    artisanCommerceEnabled: true, cultureModuleEnabled: true,
    partnerOnboardingEnabled: true, contentPublishingEnabled: true,
  },
};

export function getCountryFlag(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map((letter) => 127397 + letter.charCodeAt(0)));
}
