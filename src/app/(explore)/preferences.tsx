import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { CountryStatusPill } from '@/features/country/components/CountryStatusPill';
import { useCountries, useCountryCities, useSelectCountry, useUpdateCountryLocation } from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';
import { useRegions } from '@/features/explore/useExplore';
import { useExploreLocationStore } from '@/features/explore/explore-location.store';
import { useThemeStore } from '@/features/theme/theme.store';

/**
 * This screen deliberately configures only the Explorer country, city and
 * region. Adventure criteria are chosen per adventure, not persisted here.
 */
export default function ExploreLocationScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const selectedCountryCode = useCountryStore((state) => state.selectedCountryCode);
  const selectedCityId = useCountryStore((state) => state.selectedCityId);
  const countryConfiguration = useCountryStore((state) => state.countryConfiguration);
  const selectedRegionId = useExploreLocationStore((state) => state.selectedRegionId);
  const setSelectedRegionId = useExploreLocationStore((state) => state.setSelectedRegionId);
  const countries = useCountries();
  const cities = useCountryCities(selectedCountryCode);
  const regions = useRegions();
  const selectCountry = useSelectCountry();
  const updateLocation = useUpdateCountryLocation();

  const orderedCountries = useMemo(
    () => [...(countries.data ?? [])].sort((left, right) => (
      left.code === 'CM' ? -1 : right.code === 'CM' ? 1 : left.name.localeCompare(right.name)
    )),
    [countries.data],
  );

  const chooseCountry = async (countryCode: string) => {
    if (countryCode === selectedCountryCode || selectCountry.isPending) return;
    try {
      await selectCountry.mutateAsync(countryCode);
      setSelectedRegionId(undefined);
    } catch {
      Alert.alert('Pays indisponible', 'Ce pays ne peut pas être sélectionné pour le moment. Réessayez plus tard.');
    }
  };

  const chooseCity = async (cityId: string | null) => {
    if (!countryConfiguration || updateLocation.isPending) return;
    try {
      await updateLocation.mutateAsync({
        countryCode: countryConfiguration.code,
        cityId,
        timezone: countryConfiguration.defaultTimezone,
      });
    } catch {
      Alert.alert('Ville indisponible', 'Votre ville n’a pas pu être enregistrée. Réessayez plus tard.');
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="-ml-2 h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel="Retour">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="ml-2 flex-1">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Pays et zone</Text>
          <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>Choisissez où Explorer doit chercher</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <Section title="Pays principal">
          <Text className="px-4 pb-3 text-xs leading-5" style={{ color: colors.textSecondary }}>
            La liste provient du backend. Le Cameroun est affiché en premier pour faciliter sa sélection.
          </Text>
          {countries.isLoading ? <View className="items-center py-5"><ActivityIndicator color={colors.primary} /></View> : null}
          {countries.isError ? <Text className="px-4 pb-4 text-sm" style={{ color: colors.textSecondary }}>Les pays sont indisponibles. Réessayez plus tard.</Text> : null}
          {orderedCountries.map((country, index) => {
            const active = country.code === selectedCountryCode;
            const disabled = country.status === 'DISABLED' || selectCountry.isPending;
            return (
              <TouchableOpacity
                key={country.code}
                onPress={() => void chooseCountry(country.code)}
                disabled={disabled}
                className="min-h-14 flex-row items-center px-4 py-3"
                style={{ borderTopWidth: index ? 1 : 0, borderColor: colors.border, opacity: country.status === 'DISABLED' ? 0.5 : 1 }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active, disabled }}
              >
                <Text className="flex-1 font-semibold" style={{ color: colors.text }}>{country.flag} {country.name}</Text>
                <CountryStatusPill status={country.status} />
                {active ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} style={{ marginLeft: 8 }} /> : null}
              </TouchableOpacity>
            );
          })}
        </Section>

        <Section title="Ville">
          {!selectedCountryCode ? <Text className="px-4 py-4 text-sm" style={{ color: colors.textSecondary }}>Choisissez d’abord un pays.</Text> : null}
          {selectedCountryCode && cities.isLoading ? <View className="items-center py-5"><ActivityIndicator color={colors.primary} /></View> : null}
          {selectedCountryCode && cities.isError ? <Text className="px-4 py-4 text-sm" style={{ color: colors.textSecondary }}>Les villes sont indisponibles pour le moment.</Text> : null}
          {selectedCountryCode && !cities.isLoading && !cities.isError ? <View className="flex-row flex-wrap gap-2 p-4">
            <Choice label="Toutes les villes" selected={selectedCityId === null} onPress={() => void chooseCity(null)} />
            {(cities.data ?? []).filter((city) => city.active).map((city) => <Choice key={city.id} label={city.name} selected={city.id === selectedCityId} onPress={() => void chooseCity(city.id)} />)}
          </View> : null}
        </Section>

        <Section title="Région Explorer">
          <View className="p-4">
            <Choice label="Tout le pays" selected={selectedRegionId === undefined} onPress={() => setSelectedRegionId(undefined)} />
            {regions.isLoading ? <View className="items-center py-4"><ActivityIndicator color={colors.primary} /></View> : null}
            {regions.isError ? <Text className="py-3 text-sm" style={{ color: colors.textSecondary }}>Les régions sont indisponibles. Explorer reste ouvert à tout le pays.</Text> : null}
            <View className="mt-2 flex-row flex-wrap gap-2">
              {(regions.data ?? []).map((region) => <Choice key={region.id} label={region.name} selected={region.id === selectedRegionId} onPress={() => setSelectedRegionId(region.id)} />)}
            </View>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mt-6 px-4"><Text className="mb-3 text-xs font-bold uppercase" style={{ color: colors.textSecondary }}>{title}</Text><View className="overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>{children}</View></View>;
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="min-h-10 flex-row items-center rounded-full border px-3 py-2" style={{ borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? `${colors.primary}12` : colors.surface }} accessibilityRole="radio" accessibilityState={{ selected }}><Text className="text-xs font-semibold" style={{ color: selected ? colors.primary : colors.text }}>{label}</Text>{selected ? <Ionicons name="checkmark" size={15} color={colors.primary} style={{ marginLeft: 4 }} /> : null}</TouchableOpacity>;
}
