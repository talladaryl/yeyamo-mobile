import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useSavedArtworks } from '@/features/artworks/artworks.hooks';

export default function SavedArtworksScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const saved = useSavedArtworks();

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text className="ml-2 text-2xl font-extrabold" style={{ color: colors.text }}>Œuvres enregistrées</Text>
      </View>
      {saved.isLoading ? <ActivityIndicator className="mt-20" color={colors.primary} /> : null}
      {saved.isError ? <View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.textSecondary }}>Impossible de charger vos œuvres enregistrées.</Text><TouchableOpacity onPress={() => void saved.refetch()} className="mt-4 rounded-xl px-4 py-3" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View> : null}
      {saved.isSuccess ? <FlatList data={saved.data} keyExtractor={(item) => item.artwork.assetId} contentContainerStyle={{ padding: 16, gap: 12, flexGrow: saved.data.length ? 0 : 1 }} renderItem={({ item }) => <TouchableOpacity onPress={() => router.push(`/(explore)/artworks/${item.artwork.assetId}`)} className="flex-row items-center rounded-2xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}>{item.artwork.imageUrl ? <Image source={{ uri: item.artwork.imageUrl }} style={{ width: 76, height: 76, borderRadius: 12 }} contentFit="cover" /> : <View className="h-[76px] w-[76px] items-center justify-center rounded-xl" style={{ backgroundColor: colors.elevated }}><Icon name="color-palette-outline" size={28} color={colors.primary} /></View>}<View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{item.artwork.title}</Text><Text className="mt-1 text-sm" numberOfLines={2} style={{ color: colors.textSecondary }}>{item.artwork.shortDescription ?? item.artwork.culturalCommunity ?? 'Œuvre artisanale'}</Text></View><Icon name="chevron-forward" size={19} color={colors.textMuted} /></TouchableOpacity>} ListEmptyComponent={<View className="flex-1 items-center justify-center px-8"><Icon name="bookmark-outline" size={42} color={colors.textMuted} /><Text className="mt-4 text-center" style={{ color: colors.textSecondary }}>Aucune œuvre enregistrée.</Text></View>} /> : null}
    </SafeScreen>
  );
}
