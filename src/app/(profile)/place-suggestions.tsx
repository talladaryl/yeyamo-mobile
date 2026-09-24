import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/ViewStates';
import { useMyPlaceSuggestions } from '@/features/places/placeSuggestions.hooks';
import type { PlaceSuggestion } from '@/features/places/places.api';
import { useThemeStore } from '@/features/theme/theme.store';

const statusCopy: Record<PlaceSuggestion['status'], { label: string; detail: string }> = {
  PENDING: { label: 'En attente', detail: 'Cette suggestion est en cours de modération.' },
  APPROVED: { label: 'Approuvée', detail: 'Le serveur a relié cette suggestion à un lieu canonique.' },
  REJECTED: { label: 'Refusée', detail: 'Le serveur a refusé cette suggestion.' },
};

export default function MyPlaceSuggestionsScreen() {
  const colors = useThemeStore((state) => state.colors);
  const suggestions = useMyPlaceSuggestions();
  const items = suggestions.data?.pages.flatMap((page) => page.content) ?? [];

  return <SafeScreen>
    {suggestions.isLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : suggestions.isError ? <ErrorState title="Suggestions indisponibles" message="Impossible de récupérer vos suggestions depuis le serveur." retry={() => void suggestions.refetch()} /> : items.length ? <FlatList data={items} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16, paddingBottom: 36 }} renderItem={({ item }) => <SuggestionCard item={item} />} ListFooterComponent={suggestions.hasNextPage ? <View className="mt-3"><Button label="Charger plus" variant="secondary" isLoading={suggestions.isFetchingNextPage} disabled={suggestions.isFetchingNextPage} onPress={() => void suggestions.fetchNextPage()} /></View> : null} /> : <EmptyState title="Aucune suggestion" message="Les suggestions de lieux que vous envoyez apparaîtront ici avec leur statut serveur." />}
  </SafeScreen>;
}

function SuggestionCard({ item }: { item: PlaceSuggestion }) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const status = statusCopy[item.status];
  return <View className="mb-3 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
    <View className="flex-row items-start justify-between gap-3"><View className="flex-1"><Text className="text-base font-bold" style={{ color: colors.text }}>{item.name}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{item.address}</Text></View><Text className="text-xs font-bold" style={{ color: colors.primary }}>{status.label}</Text></View>
    <Text className="mt-3 text-xs leading-5" style={{ color: colors.textSecondary }}>{item.status === 'REJECTED' && item.moderationReason ? item.moderationReason : status.detail}</Text>
    {item.status === 'APPROVED' && item.canonicalPlaceId ? <TouchableOpacity onPress={() => router.push(`/(places)/${item.canonicalPlaceId}`)} className="mt-3 self-start"><Text className="text-sm font-semibold" style={{ color: colors.primary }}>Voir le lieu publié</Text></TouchableOpacity> : null}
  </View>;
}
