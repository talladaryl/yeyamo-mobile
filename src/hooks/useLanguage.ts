import { useTranslation } from 'react-i18next';
import { saveLanguage } from '@/i18n';

/**
 * Hook personnalisé pour gérer la langue de l'application
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as 'fr' | 'en';

  const changeLanguage = async (language: 'fr' | 'en') => {
    await saveLanguage(language);
  };

  const isRTL = i18n.dir() === 'rtl';

  return {
    currentLanguage,
    changeLanguage,
    isRTL,
    availableLanguages: ['fr', 'en'] as const,
  };
}
