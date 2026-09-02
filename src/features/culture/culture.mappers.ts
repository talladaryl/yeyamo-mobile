import type { CultureContent, CultureTranslation } from './culture.types';

export function preferredTranslation(translations: CultureTranslation[], preferredLanguageCode?: string | null): CultureTranslation | undefined {
  return translations.find((item) => item.languageCode === preferredLanguageCode) ?? translations[0];
}

export function contentLabel(content: CultureContent): string {
  return content.type.replace(/_/g, ' ').toLocaleLowerCase('fr-FR');
}
