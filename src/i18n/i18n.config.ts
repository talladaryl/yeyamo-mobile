import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  fr,
  en,
};

let currentLanguage: 'fr' | 'en' = 'fr';

function translate(key: string) {
  const dictionary = resources[currentLanguage] as Record<string, unknown>;
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, dictionary);

  return typeof value === 'string' ? value : key;
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export const saveLanguage = async (language: 'fr' | 'en') => {
  currentLanguage = language;
};

const i18n = {
  get language() {
    return currentLanguage;
  },
  t: translate,
  changeLanguage: saveLanguage,
  dir: () => 'ltr',
};

export default i18n;
