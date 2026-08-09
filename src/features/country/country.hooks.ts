import { useCountryStore } from './country.store';
import type { CountryFeatureCode } from './country.types';

export function useCountryFeature(featureCode: CountryFeatureCode): boolean {
  return useCountryStore((state) => state.countryConfiguration?.features[featureCode] ?? false);
}

export function useCountry() {
  return useCountryStore((state) => ({
    selectedCountryCode: state.selectedCountryCode,
    countryConfiguration: state.countryConfiguration,
    selectedCityId: state.selectedCityId,
    preferredLanguageCode: state.preferredLanguageCode,
    discoveryScope: state.discoveryScope,
  }));
}
