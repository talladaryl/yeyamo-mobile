import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { CultureCategoryCard } from '@/features/culture/components/CultureCategoryCard';
import { useAvailableCountries } from '@/features/country/country.hooks';
import { useThemeStore } from '@/features/theme/theme.store';

export default function RecipeCountriesScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const countries = useAvailableCountries();
  return <SafeScreen><Header title="Cuisine africaine" subtitle="Choisissez un pays pour découvrir sa cuisine." />
    {countries.isLoading ? <ActivityIndicator className="mt-16" color={colors.primary} /> : countries.isError ? <View className="items-center px-8 py-20"><Text className="text-center" style={{ color: colors.textSecondary }}>Les pays sont indisponibles.</Text><TouchableOpacity onPress={() => countries.refetch()} className="mt-4"><Text className="font-bold" style={{ color: colors.primary }}>Réessayer</Text></TouchableOpacity></View> : <FlatList data={countries.data ?? []} numColumns={2} columnWrapperStyle={{ gap: 12 }} keyExtractor={(item) => item.code} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} renderItem={({ item }) => <CultureCategoryCard title={`Cuisine ${countryAdjective(item.name)}`} subtitle={`${item.flag} ${item.name}`} icon="restaurant-outline" onPress={() => router.push(`/(explore)/recipes/country/${item.code}`)} />} ListEmptyComponent={<Text className="p-8 text-center" style={{ color: colors.textSecondary }}>Aucun pays disponible.</Text>} />}
  </SafeScreen>;
}
function countryAdjective(name: string) { return name === 'Cameroun' ? 'camerounaise' : name === 'Sénégal' ? 'sénégalaise' : name === "Côte d'Ivoire" ? 'ivoirienne' : name === 'Nigeria' ? 'nigériane' : `de ${name}`; }
function Header({ title, subtitle }: { title: string; subtitle: string }) { const router = useRouter(); const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center px-4 py-3"><TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><View className="ml-2 flex-1"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>{title}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{subtitle}</Text></View></View>; }
