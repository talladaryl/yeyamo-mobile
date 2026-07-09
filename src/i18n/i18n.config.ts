import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import en from './locales/en.json';

const LANGUAGE_STORAGE_KEY = '@yeyamo:language';

// Ressources de traduction
const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

// Détection de la langue système
const getDeviceLanguage = () => {
  const locale = Localization.getLocales()[0];
  const languageCode = locale.languageCode;
  
  // Si la langue système est supportée, l'utiliser, sinon français par défaut
  return ['fr', 'en'].includes(languageCode) ? languageCode : 'fr';
};

// Récupérer la langue sauvegardée ou détecter la langue système
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && ['fr', 'en'].includes(savedLanguage)) {
      return savedLanguage;
    }
  } catch (error) {
    console.error('Error reading language from storage:', error);
  }
  return getDeviceLanguage();
};

// Configuration i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Langue par défaut temporaire (sera remplacée)
    fallbackLng: 'fr',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

// Initialiser avec la langue détectée/sauvegardée
getInitialLanguage().then((language) => {
  i18n.changeLanguage(language);
});

// Fonction pour sauvegarder la langue choisie
export const saveLanguage = async (language: 'fr' | 'en') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export default i18n;
