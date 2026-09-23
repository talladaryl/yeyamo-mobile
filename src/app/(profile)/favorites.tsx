import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useExplorerFavorites } from '@/features/interactions/generic-interactions.hooks';
import type { GenericInteraction } from '@/features/interactions/generic-interactions.api';
import { useThemeStore } from '@/features/theme/theme.store';

const TARGET_LABEL: Record<GenericInteraction['targetType'], string> = { POST: 'Publication', PLACE: 'Lieu', EVENT: 'Événement', ACTIVITY: 'Activité', EXPERIENCE: 'Expérience', ARTWORK: 'Œuvre', CULTURE_CONTENT: 'Contenu culturel', ARTISAN: 'Artisan' };

function destinationForFavorite(favorite: GenericInteraction): string | null {
  if (favorite.targetType === 'PLACE') return `/(places)/${favorite.targetId}`;
  if (favorite.targetType === 'EVENT') return `/(events)/${favorite.targetId}`;
  if (favorite.targetType === 'EXPERIENCE') return `/(experiences)/${favorite.targetId}`;
  if (favorite.targetType === 'CULTURE_CONTENT') return `/(explore)/culture/${favorite.targetId}`;
  return null;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const favorites = useExplorerFavorites();
  const items = favorites.data?.pages.flatMap((page) => page.content) ?? [];
  return <SafeScreen><View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="text-xl font-bold" style={{ color: colors.text }}>Mes favoris</Text><View className="w-10" /></View>{favorites.isPending ? <LoadingState /> : favorites.isError ? <ErrorState title="Impossible de charger vos favoris" retry={() => void favorites.refetch()} /> : !items.length ? <EmptyState title="Aucun favori" message="Ajoutez des lieux, événements ou contenus à vos favoris pour les retrouver ici." icon={<Ionicons name="bookmark-outline" size={64} color={colors.textMuted} />} /> : <FlatList data={items} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16, paddingBottom: 28 }} renderItem={({ item }) => <FavoriteItem item={item} onPress={() => { const destination = destinationForFavorite(item); if (destination) router.push(destination as never); }} />} ListFooterComponent={favorites.hasNextPage ? <View className="mt-3"><Button label="Charger plus" variant="secondary" onPress={() => void favorites.fetchNextPage()} isLoading={favorites.isFetchingNextPage} /></View> : null} />}</SafeScreen>;
}

function FavoriteItem({ item, onPress }: { item: GenericInteraction; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const destination = destinationForFavorite(item);
  return <TouchableOpacity disabled={!destination} onPress={onPress} className="mb-3 flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border, opacity: destination ? 1 : 0.72 }} accessibilityRole={destination ? 'button' : undefined} accessibilityLabel={destination ? `Ouvrir le favori ${TARGET_LABEL[item.targetType]}` : undefined}><View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.primary}18` }}><Ionicons name="bookmark" size={21} color={colors.primary} /></View><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{TARGET_LABEL[item.targetType]}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>{item.targetId}</Text></View>{destination ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null}</TouchableOpacity>;
}
