import type { CultureLanguage } from './culture.types';

/** Maps the exact `/culture/languages` response shape to FormSelect options. */
export function toCultureLanguageOptions(languages: readonly CultureLanguage[]) {
  return languages.map((language) => ({
    label: language.nativeName || language.name,
    value: language.code,
    description: language.name,
  }));
}
