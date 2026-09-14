import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FavoritePlaceCard } from '@/components/profile/FavoritePlaceCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useUserFavorites } from '@/features/profile/useProfile';
import { useThemeStore } from '@/features/theme/theme.store';

export default function FavoritesScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data: favorites, isLoading, isError, refetch } = useUserFavorites();
  return <SafeScreen><View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="text-xl font-bold" style={{ color: colors.text }}>Mes favoris</Text><View className="w-10" /></View>{isLoading ? <LoadingState /> : isError ? <ErrorState title="Impossible de charger vos favoris" retry={() => void refetch()} /> : favorites?.length ? <FlatList data={favorites} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ padding: 16 }} renderItem={({ item }) => <FavoritePlaceCard place={item} onPress={() => router.push(`/(places)/${item.id}`)} />} /> : <EmptyState title="Aucun favori" message="Ajoutez des lieux à vos favoris pour les retrouver facilement" icon={<Ionicons name="heart-outline" size={64} color={colors.textMuted} />} />}</SafeScreen>;
}
