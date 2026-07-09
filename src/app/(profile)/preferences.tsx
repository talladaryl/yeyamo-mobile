// ÉCRAN 4 - Langue & Préférences
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MOCK_USER_SETTINGS } from '@/features/settings/mockData';
import { AVAILABLE_CONTENT_CATEGORIES } from '@/features/settings/types';
import { RadioItem } from '@/components/settings/RadioItem';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { ToggleItem } from '@/components/settings/ToggleItem';
import { useLanguage } from '@/hooks/useLanguage';

export default function PreferencesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [settings, setSettings] = useState(MOCK_USER_SETTINGS.preferences);

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#27272A]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-2">{t('settings.preferences')}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Langue */}
        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            {t('settings.language')}
          </Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <RadioItem
              label="Français"
              selected={currentLanguage === 'fr'}
              onPress={() => {
                changeLanguage('fr');
                setSettings({ ...settings, language: 'fr' });
              }}
              showBorder={false}
            />
            <RadioItem
              label="English"
              selected={currentLanguage === 'en'}
              onPress={() => {
                changeLanguage('en');
                setSettings({ ...settings, language: 'en' });
              }}
            />
          </View>
        </View>

        {/* Thème */}
        <View className="mt-6">
          <View className="px-4 mb-3">
            <Text className="text-[#A1A1AA] text-xs font-semibold uppercase">
              Apparence
            </Text>
          </View>
          <View className="bg-[#161616] rounded-xl mx-4 overflow-hidden">
            <ThemeSelector
              value={settings.theme}
              onChange={(value) => setSettings({ ...settings, theme: value })}
            />
          </View>
        </View>

        {/* Catégories de contenu */}
        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Catégories préférées
          </Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            {AVAILABLE_CONTENT_CATEGORIES.map((category, index) => {
              const isSelected = settings.content_categories.includes(category);
              return (
                <TouchableOpacity
                  key={category}
                  className={`px-4 py-3 flex-row items-center justify-between ${
                    index > 0 ? 'border-t border-[#27272A]' : ''
                  }`}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (isSelected) {
                      setSettings({
                        ...settings,
                        content_categories: settings.content_categories.filter(
                          (c) => c !== category
                        ),
                      });
                    } else {
                      setSettings({
                        ...settings,
                        content_categories: [...settings.content_categories, category],
                      });
                    }
                  }}
                >
                  <Text className="text-white text-sm flex-1">{category}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Accessibilité */}
        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Accessibilité
          </Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <ToggleItem
              label="Réduire les animations"
              description="Réduit les effets de mouvement"
              value={settings.reduce_motion}
              onValueChange={(value) =>
                setSettings({ ...settings, reduce_motion: value })
              }
              showBorder={false}
            />
            <ToggleItem
              label="Texte agrandi"
              description="Augmente la taille du texte"
              value={settings.large_text}
              onValueChange={(value) => setSettings({ ...settings, large_text: value })}
            />
            <ToggleItem
              label="Contraste élevé"
              description="Améliore la lisibilité"
              value={settings.high_contrast}
              onValueChange={(value) =>
                setSettings({ ...settings, high_contrast: value })
              }
            />
          </View>
        </View>

        {/* Contenu */}
        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Contenu
          </Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <ToggleItem
              label="Afficher le contenu sensible"
              description="Contenu potentiellement dérangeant"
              value={settings.show_sensitive_content}
              onValueChange={(value) =>
                setSettings({ ...settings, show_sensitive_content: value })
              }
              showBorder={false}
            />
          </View>
        </View>

        {/* Rayon de découverte */}
        <View className="mt-6 px-4 pb-8">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Découverte
          </Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-medium text-sm">Rayon de recherche</Text>
              <Text className="text-[#EF4444] font-bold text-base">
                {settings.discovery_radius_km} km
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() =>
                  setSettings({
                    ...settings,
                    discovery_radius_km: Math.max(1, settings.discovery_radius_km - 5),
                  })
                }
                className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View className="flex-1 h-2 bg-[#27272A] rounded-full overflow-hidden">
                <View
                  className="h-full bg-[#EF4444] rounded-full"
                  style={{ width: `${settings.discovery_radius_km}%` }}
                />
              </View>
              
              <TouchableOpacity
                onPress={() =>
                  setSettings({
                    ...settings,
                    discovery_radius_km: Math.min(
                      100,
                      settings.discovery_radius_km + 5
                    ),
                  })
                }
                className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text className="text-[#A1A1AA] text-xs text-center mt-2">
              Ajustez le rayon pour découvrir des lieux et événements près de vous
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
