import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { CultureCategoryCard } from '@/features/culture/components/CultureCategoryCard';
import { recipeCountryCatalog } from '@/features/country/recipe-country-catalog';
import { useThemeStore } from '@/features/theme/theme.store';

export default function RecipeCountriesScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const [search,setSearch]=useState('');
  const countries=useMemo(()=>recipeCountryCatalog.filter((country)=>`${country.name} ${country.code}`.toLowerCase().includes(search.trim().toLowerCase())),[search]);
  return <SafeScreen><Header title="Cuisine africaine" subtitle="Choisissez un pays pour découvrir sa cuisine." />
    <View className="mx-4 mb-2 flex-row items-center rounded-2xl border px-4" style={{backgroundColor:colors.card,borderColor:colors.border}}><Icon name="search" size={20} color={colors.textMuted}/><TextInput value={search} onChangeText={setSearch} placeholder="Rechercher un pays ou un code…" placeholderTextColor={colors.textMuted} className="ml-3 h-12 flex-1" style={{color:colors.text}} autoCapitalize="none" returnKeyType="search"/></View>
    <FlatList data={countries} numColumns={2} columnWrapperStyle={{ gap: 12 }} keyExtractor={(item) => item.code} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} renderItem={({ item }) => <CultureCategoryCard title={item.name} subtitle={`${item.flag}  ${item.code}`} icon="restaurant-outline" onPress={() => router.push(`/(explore)/recipes/country/${item.code}`)} />} ListEmptyComponent={<Text className="p-8 text-center" style={{ color: colors.textSecondary }}>Aucun pays ne correspond à cette recherche.</Text>} />
  </SafeScreen>;
}
function Header({ title, subtitle }: { title: string; subtitle: string }) { const router = useRouter(); const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center px-4 py-3"><TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><View className="ml-2 flex-1"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>{title}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{subtitle}</Text></View></View>; }
