import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { MOCK_USER_SETTINGS } from '@/features/settings/mockData';
import { AVAILABLE_CONTENT_CATEGORIES } from '@/features/settings/types';
import { RadioItem } from '@/components/settings/RadioItem';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { ToggleItem } from '@/components/settings/ToggleItem';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuthStore } from '@/features/auth/auth.store';

export default function PreferencesScreen() {
  const router = useRouter();
  const { preference, setThemePreference, colors } = useThemeStore();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const [settings, setSettings] = useState(() => isDemo ? MOCK_USER_SETTINGS.preferences : {
    language: 'fr' as const,
    theme: 'system' as const,
    content_categories: [],
    show_sensitive_content: false,
    reduce_motion: false,
    large_text: false,
    high_contrast: false,
    discovery_radius_km: 25,
    push_notifications: false,
    email_notifications: false,
    sms_notifications: false,
  });

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <View className="border-b px-4 py-3" style={{ borderColor: colors.border }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>Préférences</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <PreferenceSection title="Langue">
          <RadioItem label="Français" selected={settings.language === 'fr'} onPress={() => setSettings({ ...settings, language: 'fr' })} showBorder={false} />
          <RadioItem label="English" selected={settings.language === 'en'} onPress={() => setSettings({ ...settings, language: 'en' })} />
        </PreferenceSection>

        <View className="mt-6">
          <SectionLabel label="Apparence" />
          <View className="mx-4 overflow-hidden rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <ThemeSelector
              value={preference}
              onChange={(value) => {
                setThemePreference(value);
                setSettings({ ...settings, theme: value });
              }}
            />
          </View>
        </View>

        <PreferenceSection title="Catégories préférées">
          {AVAILABLE_CONTENT_CATEGORIES.map((category, index) => {
            const selected = settings.content_categories.includes(category);
            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.7}
                className="flex-row items-center justify-between px-4 py-3"
                style={{ borderTopWidth: index ? 1 : 0, borderColor: colors.border }}
                onPress={() => setSettings({
                  ...settings,
                  content_categories: selected
                    ? settings.content_categories.filter((item) => item !== category)
                    : [...settings.content_categories, category],
                })}
              >
                <Text className="flex-1 text-sm" style={{ color: colors.text }}>{category}</Text>
                {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
              </TouchableOpacity>
            );
          })}
        </PreferenceSection>

        <PreferenceSection title="Accessibilité">
          <ToggleItem label="Réduire les animations" description="Réduit les effets de mouvement" value={settings.reduce_motion} onValueChange={(value) => setSettings({ ...settings, reduce_motion: value })} showBorder={false} />
          <ToggleItem label="Texte agrandi" description="Augmente la taille du texte" value={settings.large_text} onValueChange={(value) => setSettings({ ...settings, large_text: value })} />
          <ToggleItem label="Contraste élevé" description="Améliore la lisibilité" value={settings.high_contrast} onValueChange={(value) => setSettings({ ...settings, high_contrast: value })} />
        </PreferenceSection>

        <PreferenceSection title="Contenu">
          <ToggleItem label="Afficher le contenu sensible" description="Contenu potentiellement dérangeant" value={settings.show_sensitive_content} onValueChange={(value) => setSettings({ ...settings, show_sensitive_content: value })} showBorder={false} />
        </PreferenceSection>

        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Découverte</Text>
          <View className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm font-medium" style={{ color: colors.text }}>Rayon de recherche</Text>
              <Text className="text-base font-bold" style={{ color: colors.primary }}>{settings.discovery_radius_km} km</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <RadiusButton icon="remove" onPress={() => setSettings({ ...settings, discovery_radius_km: Math.max(1, settings.discovery_radius_km - 5) })} />
              <View className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}>
                <View className="h-full rounded-full" style={{ width: `${settings.discovery_radius_km}%`, backgroundColor: colors.primary }} />
              </View>
              <RadiusButton icon="add" onPress={() => setSettings({ ...settings, discovery_radius_km: Math.min(100, settings.discovery_radius_km + 5) })} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ label }: { label: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <Text className="mb-3 px-4 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>{label}</Text>;
}

function PreferenceSection({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="mt-6 px-4">
      <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>{title}</Text>
      <View className="overflow-hidden rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>{children}</View>
    </View>
  );
}

function RadiusButton({ icon, onPress }: { icon: 'add' | 'remove'; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
      <Ionicons name={icon} size={20} color={colors.text} />
    </TouchableOpacity>
  );
}
