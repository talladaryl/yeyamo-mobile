import { useState } from 'react';
import { getCurrentLanguage, saveLanguage } from '@/i18n';

/**
 * Hook personnalisé pour gérer la langue de l'application
 */
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en'>(getCurrentLanguage());

  const changeLanguage = async (language: 'fr' | 'en') => {
    await saveLanguage(language);
    setCurrentLanguage(language);
  };

  const isRTL = false;

  return {
    currentLanguage,
    changeLanguage,
    isRTL,
    availableLanguages: ['fr', 'en'] as const,
  };
}
