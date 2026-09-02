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
import { CountryStatusPill } from '@/features/country/components/CountryStatusPill';
import { useAvailableCountries, useCountries, useCountryCities, useCountryProfile, useSelectCountry, useUpdateCountryDiscoveryPreferences, useUpdateCountryLanguage, useUpdateCountryLocation } from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';

export default function PreferencesScreen() {
  const router = useRouter();
  const { preference, setThemePreference, colors } = useThemeStore();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const selectedCountryCode = useCountryStore((state) => state.selectedCountryCode);
  const configuration = useCountryStore((state) => state.countryConfiguration);
  const selectedCityId = useCountryStore((state) => state.selectedCityId);
  const selectedLanguage = useCountryStore((state) => state.preferredLanguageCode);
  const discoveryScope = useCountryStore((state) => state.discoveryScope);
  const setDiscoveryScope = useCountryStore((state) => state.setDiscoveryScope);
  const profile = useCountryProfile();
  const countries = useCountries();
  const availableCountries = useAvailableCountries();
  const cities = useCountryCities(selectedCountryCode);
  const selectCountry = useSelectCountry();
  const updateLocation = useUpdateCountryLocation();
  const updateLanguage = useUpdateCountryLanguage();
  const updateDiscovery = useUpdateCountryDiscoveryPreferences();
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
  const setDiscoveryRadius = (localRadiusKm: number) => {
    setSettings({ ...settings, discovery_radius_km: localRadiusKm });
    if (!isDemo && configuration) updateDiscovery.mutate({
      contentCountries: profile.data?.contentCountries ?? [],
      localRadiusKm, discoverAfricanContent: profile.data?.discoverAfricanContent ?? false,
      preferredCurrencyCode: profile.data?.preferredCurrencyCode ?? configuration.defaultCurrencyCode,
    });
  };
  const saveDiscoveryPreferences = (changes: Partial<{ contentCountries: string[]; localRadiusKm: number; discoverAfricanContent: boolean; preferredCurrencyCode: string }>) => {
    if (isDemo || !configuration) return;
    updateDiscovery.mutate({
      contentCountries: profile.data?.contentCountries ?? [],
      localRadiusKm: profile.data?.localRadiusKm ?? 25,
      discoverAfricanContent: profile.data?.discoverAfricanContent ?? false,
      preferredCurrencyCode: profile.data?.preferredCurrencyCode ?? configuration.defaultCurrencyCode,
      ...changes,
    });
  };

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
        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Pays et découverte</Text>
          <View className="overflow-hidden rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>Pays principal</Text>
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Le profil backend reste la source de vérité.</Text>
            {profile.isError || countries.isError ? <Text className="mt-3 text-xs text-[#B91C1C]">La configuration pays est indisponible. Les fonctionnalités dépendantes restent bloquées.</Text> : null}
            <View className="mt-3 gap-2">{(countries.data ?? []).map((country) => <TouchableOpacity key={country.code} disabled={selectCountry.isPending || country.code === selectedCountryCode} onPress={() => selectCountry.mutate(country.code)} className="flex-row items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: country.code === selectedCountryCode ? colors.primary : colors.border, opacity: country.status === 'DISABLED' ? 0.55 : 1 }}><Text style={{ color: colors.text }}>{country.flag} {country.name}</Text><CountryStatusPill status={country.status} /></TouchableOpacity>)}</View>
            {configuration ? <><Text className="mt-5 text-sm font-semibold" style={{ color: colors.text }}>Ville</Text><View className="mt-2 flex-row flex-wrap gap-2">{(cities.data ?? []).filter((city) => city.active).map((city) => <TouchableOpacity key={city.id} disabled={updateLocation.isPending} onPress={() => updateLocation.mutate({ countryCode: configuration.code, cityId: city.id === selectedCityId ? null : city.id, timezone: configuration.defaultTimezone })} className="rounded-full border px-3 py-2" style={{ borderColor: city.id === selectedCityId ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{city.name}</Text></TouchableOpacity>)}</View><Text className="mt-5 text-sm font-semibold" style={{ color: colors.text }}>Langues de contenu</Text><View className="mt-2 flex-row flex-wrap gap-2">{configuration.languages.map((language) => { const selected = profile.data?.contentLanguages?.includes(language) ?? language === selectedLanguage; const next = selected ? (profile.data?.contentLanguages ?? []).filter((code) => code !== language) : [...(profile.data?.contentLanguages ?? []), language]; return <TouchableOpacity key={language} disabled={updateLanguage.isPending} onPress={() => updateLanguage.mutate({ preferredLanguageCode: language, contentLanguages: next })} className="rounded-full border px-3 py-2" style={{ borderColor: selected ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{language}</Text></TouchableOpacity>; })}</View><Text className="mt-5 text-sm font-semibold" style={{ color: colors.text }}>Mode de découverte</Text><View className="mt-2 flex-row flex-wrap gap-2">{(['LOCAL','COUNTRY','AFRICA','TRAVEL'] as const).map((scope) => <TouchableOpacity key={scope} onPress={() => void setDiscoveryScope(scope)} className="rounded-full border px-3 py-2" style={{ borderColor: scope === discoveryScope ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{scope}</Text></TouchableOpacity>)}</View><Text className="mt-5 text-sm font-semibold" style={{ color: colors.text }}>Pays à découvrir</Text><View className="mt-2 flex-row flex-wrap gap-2">{(availableCountries.data ?? []).filter((country) => country.code !== configuration.code).map((country) => { const selected = profile.data?.contentCountries?.includes(country.code) ?? false; const next = selected ? (profile.data?.contentCountries ?? []).filter((code) => code !== country.code) : [...(profile.data?.contentCountries ?? []), country.code]; return <TouchableOpacity key={country.code} disabled={updateDiscovery.isPending} onPress={() => updateDiscovery.mutate({ contentCountries: next, contentLanguages: profile.data?.contentLanguages ?? [], localRadiusKm: profile.data?.localRadiusKm ?? 25, discoverAfricanContent: profile.data?.discoverAfricanContent ?? false, preferredCurrencyCode: profile.data?.preferredCurrencyCode ?? configuration.defaultCurrencyCode })} className="rounded-full border px-3 py-2" style={{ borderColor: selected ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{country.flag} {country.code}</Text></TouchableOpacity>; })}</View></> : null}
            {configuration ? <><Text className="mt-5 text-sm font-semibold" style={{ color: colors.text }}>Devise préférée</Text><View className="mt-2 flex-row flex-wrap gap-2">{configuration.currencies.map((currency) => <TouchableOpacity key={currency} disabled={updateDiscovery.isPending} onPress={() => saveDiscoveryPreferences({ preferredCurrencyCode: currency })} className="rounded-full border px-3 py-2" style={{ borderColor: (profile.data?.preferredCurrencyCode ?? configuration.defaultCurrencyCode) === currency ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{currency}</Text></TouchableOpacity>)}</View><TouchableOpacity disabled={updateDiscovery.isPending} onPress={() => saveDiscoveryPreferences({ discoverAfricanContent: !(profile.data?.discoverAfricanContent ?? false) })} className="mt-5 flex-row items-center justify-between rounded-lg border px-3 py-3" style={{ borderColor: colors.border }}><View className="flex-1 pr-3"><Text className="text-sm font-semibold" style={{ color: colors.text }}>Contenus africains</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Inclure des découvertes au-delà de vos pays sélectionnés.</Text></View><Ionicons name={(profile.data?.discoverAfricanContent ?? false) ? 'toggle' : 'toggle-outline'} size={32} color={(profile.data?.discoverAfricanContent ?? false) ? colors.primary : colors.textMuted} /></TouchableOpacity></> : null}
          </View>
        </View>
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
              <RadiusButton icon="remove" onPress={() => setDiscoveryRadius(Math.max(1, settings.discovery_radius_km - 5))} />
              <View className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}>
                <View className="h-full rounded-full" style={{ width: `${settings.discovery_radius_km}%`, backgroundColor: colors.primary }} />
              </View>
              <RadiusButton icon="add" onPress={() => setDiscoveryRadius(Math.min(100, settings.discovery_radius_km + 5))} />
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
