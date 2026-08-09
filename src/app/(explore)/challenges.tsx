import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { CultureChallengeCard } from '@/features/culture/components/CultureChallengeCard';
import { useChallenges } from '@/features/culture/culture.hooks';

export default function ChallengesScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const challenges = useChallenges();
  return <SafeScreen>
    <View className="flex-row items-center px-4 py-3">
      <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
      <Text className="ml-2 text-2xl font-extrabold" style={{ color: colors.text }}>Défis culturels</Text>
    </View>
    {challenges.isLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : <FlatList
      data={challenges.data?.content ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => <View className="mb-3"><CultureChallengeCard challenge={item} onPress={() => router.push(`/(explore)/challenges/${item.id}`)} /></View>}
      ListEmptyComponent={<Text className="p-8 text-center" style={{ color: colors.textSecondary }}>Aucun défi en ce moment.</Text>}
    />}
  </SafeScreen>;
}
