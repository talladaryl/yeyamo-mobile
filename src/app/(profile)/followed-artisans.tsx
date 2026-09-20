import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { ArtisanCard } from '@/features/artisans/components/ArtisanCard';
import { useFollowedArtisans } from '@/features/artisans/artisans.hooks';

export default function FollowedArtisansScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const followed = useFollowedArtisans();

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text className="ml-2 text-2xl font-extrabold" style={{ color: colors.text }}>Artisans suivis</Text>
      </View>
      {followed.isLoading ? <ActivityIndicator className="mt-20" color={colors.primary} /> : null}
      {followed.isError ? <View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.textSecondary }}>Impossible de charger les artisans suivis.</Text><TouchableOpacity onPress={() => void followed.refetch()} className="mt-4 rounded-xl px-4 py-3" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View> : null}
      {followed.isSuccess ? <FlatList horizontal data={followed.data} keyExtractor={(item) => item.partnerId} contentContainerStyle={{ padding: 16, flexGrow: followed.data.length ? 0 : 1 }} renderItem={({ item }) => <ArtisanCard artisan={item} onPress={() => router.push(`/(explore)/artisans/${item.partnerId}`)} />} ListEmptyComponent={<View className="flex-1 items-center justify-center px-8"><Icon name="people-outline" size={42} color={colors.textMuted} /><Text className="mt-4 text-center" style={{ color: colors.textSecondary }}>Vous ne suivez encore aucun artisan.</Text></View>} /> : null}
    </SafeScreen>
  );
}
