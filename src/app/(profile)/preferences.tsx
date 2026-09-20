import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { Input } from '@/components/ui/Input';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAvailableCountries, useCountries, useCountryProfile, useUpdateCountryDiscoveryPreferences, useUpdateCountryLanguage } from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';

export default function PreferencesScreen() {
  const router = useRouter();
  const { preference, setThemePreference, colors } = useThemeStore();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const selectedCountryCode = useCountryStore((state) => state.selectedCountryCode);
  const configuration = useCountryStore((state) => state.countryConfiguration);
  const selectedLanguage = useCountryStore((state) => state.preferredLanguageCode);
  const profile = useCountryProfile();
  const countries = useCountries();
  const availableCountries = useAvailableCountries();
  const updateLanguage = useUpdateCountryLanguage();
  const updateDiscovery = useUpdateCountryDiscoveryPreferences();
  const [radiusDraft, setRadiusDraft] = useState('');
  const [isEditingRadius, setIsEditingRadius] = useState(false);
  const accountCountry = (countries.data ?? []).find((country) => country.code === (profile.data?.countryCode ?? selectedCountryCode));
  const saveRadius = () => {
    if (!isEditingRadius) return;
    const localRadiusKm = Number(isEditingRadius ? radiusDraft : (profile.data?.localRadiusKm ?? 25));
    if (!Number.isInteger(localRadiusKm) || localRadiusKm < 1 || localRadiusKm > 500) return;
    saveDiscoveryPreferences({ localRadiusKm });
    setRadiusDraft('');
    setIsEditingRadius(false);
  };
  const saveDiscoveryPreferences = (changes: Partial<{ contentCountries: string[]; localRadiusKm: number; discoverAfricanContent: boolean; preferredCurrencyCode: string }>) => {
    if (isDemo || !configuration || !profile.data) return;
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
          <View className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>Pays du compte</Text>
            <Text className="mt-1 text-sm" style={{ color: colors.text }}>{accountCountry ? `${accountCountry.flag} ${accountCountry.name}` : 'Non renseigné'}</Text>
            <Text className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>Ce pays appartient au profil. Sa modification se fait dans Modifier le profil, pas dans les préférences de découverte.</Text>
            {profile.isError || countries.isError ? <Text className="mt-3 text-xs" style={{ color: colors.primary }}>Impossible de récupérer votre configuration pays. Réessayez plus tard.</Text> : null}
            <View className="mt-5">
              <MultiSelect
                label="Pays à découvrir"
                values={profile.data?.contentCountries ?? []}
                options={(availableCountries.data ?? []).filter((country) => country.status === 'LIVE' || country.status === 'BETA').map((country) => ({ value: country.code, label: `${country.flag} ${country.name}` }))}
                placeholder="Choisir un ou plusieurs pays"
                onChange={(contentCountries) => saveDiscoveryPreferences({ contentCountries })}
              />
              <Text className="mt-2 text-xs leading-5" style={{ color: colors.textSecondary }}>Préférence enregistrée par le backend. Les résultats Explorer ne reçoivent pas encore explicitement ces pays : BACKEND_REQUIRED.</Text>
            </View>
            <Text className="mt-5 text-sm font-semibold" style={{ color: colors.text }}>Villes à découvrir</Text>
            <Text className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>La sélection de plusieurs villes n’est pas disponible dans le contrat de préférences actuel : BACKEND_CONTRACT_INCOMPLETE.</Text>
            {configuration ? <><Text className="mt-5 text-sm font-semibold" style={{ color: colors.text }}>Langues de contenu</Text><View className="mt-2 flex-row flex-wrap gap-2">{configuration.languages.map((language) => { const selected = profile.data?.contentLanguages?.includes(language) ?? language === selectedLanguage; const next = selected ? (profile.data?.contentLanguages ?? []).filter((code) => code !== language) : [...(profile.data?.contentLanguages ?? []), language]; return <TouchableOpacity key={language} disabled={updateLanguage.isPending} onPress={() => updateLanguage.mutate({ preferredLanguageCode: language, contentLanguages: next })} className="rounded-full border px-3 py-2" style={{ borderColor: selected ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{language}</Text></TouchableOpacity>; })}</View></> : null}
          </View>
        </View>

        <View className="mt-6">
          <SectionLabel label="Apparence" />
          <View className="mx-4 overflow-hidden rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <ThemeSelector
              value={preference}
              onChange={(value) => {
                setThemePreference(value);
              }}
            />
          </View>
        </View>

        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Découverte</Text>
          <View className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Input label="Rayon local (km)" value={isEditingRadius ? radiusDraft : String(profile.data?.localRadiusKm ?? 25)} onChangeText={(value) => { setIsEditingRadius(true); setRadiusDraft(value); }} onSubmitEditing={saveRadius} onBlur={saveRadius} keyboardType="number-pad" returnKeyType="done" editable={!updateDiscovery.isPending && !isDemo} helperText="Valeur comprise entre 1 et 500 km. Elle est enregistrée, mais Explorer ne transmet pas encore de coordonnées ni de rayon à ses requêtes : BACKEND_REQUIRED." />
            {radiusDraft && (!Number.isInteger(Number(radiusDraft)) || Number(radiusDraft) < 1 || Number(radiusDraft) > 500) ? <Text className="mt-2 text-xs" style={{ color: colors.primary }}>Saisissez un nombre entier entre 1 et 500.</Text> : null}
            {configuration ? <><Text className="mt-5 text-sm font-semibold" style={{ color: colors.text }}>Devise préférée</Text><View className="mt-2 flex-row flex-wrap gap-2">{configuration.currencies.map((currency) => <TouchableOpacity key={currency} disabled={updateDiscovery.isPending} onPress={() => saveDiscoveryPreferences({ preferredCurrencyCode: currency })} className="rounded-full border px-3 py-2" style={{ borderColor: (profile.data?.preferredCurrencyCode ?? configuration.defaultCurrencyCode) === currency ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{currency}</Text></TouchableOpacity>)}</View><TouchableOpacity disabled={updateDiscovery.isPending || isDemo} onPress={() => saveDiscoveryPreferences({ discoverAfricanContent: !(profile.data?.discoverAfricanContent ?? false) })} className="mt-5 flex-row items-center justify-between rounded-lg border px-3 py-3" style={{ borderColor: colors.border }}><View className="flex-1 pr-3"><Text className="text-sm font-semibold" style={{ color: colors.text }}>Contenus africains</Text><Text className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>Préférence enregistrée par le profil. L’API Explorer ne la reçoit pas explicitement : BACKEND_REQUIRED.</Text></View><Ionicons name={(profile.data?.discoverAfricanContent ?? false) ? 'toggle' : 'toggle-outline'} size={32} color={(profile.data?.discoverAfricanContent ?? false) ? colors.primary : colors.textMuted} /></TouchableOpacity></> : null}
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
