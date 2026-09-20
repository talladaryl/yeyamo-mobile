import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { ExperienceCard } from '@/components/experiences/ExperienceCard';
import { mockExperiences } from '@/features/experiences/mockData';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { useDiscoverySearch } from '@/features/discovery/discovery.hooks';
import type { DiscoveryItem } from '@/features/discovery/discovery.types';

export default function ExperiencesListScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false); const query = useDiscoverySearch('', 'EXPERIENCE');
  const header = <Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerTitle: 'Expériences', headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-4"><Icon name="arrow-back" size={24} color={colors.text} /></TouchableOpacity> }} />;
  if (isDemo) return <View className="flex-1" style={{ backgroundColor: colors.background }}>{header}<FlatList data={mockExperiences} keyExtractor={(item) => String(item.id)} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} renderItem={({ item }) => <ExperienceCard id={item.id} title={item.title} location={item.location} rating={item.rating} reviewsCount={item.reviews_count} priceFrom={item.price_from} currency={item.currency} imageUrl={item.cover_image_url} isSaved={item.is_saved} onPress={() => router.push(`/(experiences)/${item.id}`)} />}/></View>;
  if (query.isLoading) return <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>{header}<ActivityIndicator color={colors.primary} /></View>;
  return <View className="flex-1" style={{ backgroundColor: colors.background }}>{header}<FlatList<DiscoveryItem> data={query.data?.items ?? []} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} renderItem={({ item }) => <TouchableOpacity onPress={() => router.push(`/(explore)/search?type=EXPERIENCE`)} className="mb-3 rounded-2xl border p-4" style={{backgroundColor:colors.card,borderColor:colors.border}}><Text className="text-xs font-bold" style={{color:colors.primary}}>EXPÉRIENCE</Text><Text className="mt-2 text-lg font-extrabold" style={{color:colors.text}}>{item.title}</Text>{item.description?<Text className="mt-1" style={{color:colors.textSecondary}} numberOfLines={2}>{item.description}</Text>:null}</TouchableOpacity>} ListEmptyComponent={<View className="items-center py-20"><Text style={{color:colors.textSecondary}}>Aucune expérience publiée.</Text></View>} /></View>;
}
