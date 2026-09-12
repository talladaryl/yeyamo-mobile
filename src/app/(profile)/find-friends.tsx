// ÉCRAN 6 - Suggestions d'amis
import { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SuggestionCard } from '@/components/social/SuggestionCard';
import { useFollowActions, useFriendSuggestions } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

export default function FindFriendsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data: friendSuggestions = [] } = useFriendSuggestions();
  const { follow } = useFollowActions();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const visibleSuggestions = friendSuggestions.filter((item) => !dismissedIds.includes(String(item.id)));

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: "Trouver des amis",
        }}
      />

      {/* Header Info */}
      <View className="px-4 py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <Text className="mb-1 text-lg font-bold text-[#18181B] dark:text-white">Trouvez vos amis</Text>
        <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">
          Découvrez les suggestions calculées par Yeyamo
        </Text>
      </View>

      {/* Suggestions List */}
      <View className="px-4 py-2">
        <Text className="mb-2 text-sm font-semibold text-[#18181B] dark:text-white">Amis en commun</Text>
      </View>

      <FlatList
        data={visibleSuggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SuggestionCard
            user={item}
            onPress={() => router.push(`/(profile)/${item.username}`)}
            onFollowPress={() => follow.mutate(item.id)}
            onDismiss={() => setDismissedIds((current) => [...current, String(item.id)])}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Icon library="ionicons" name="people-circle-outline" size={64} color="#27272A" />
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4 text-center px-8">
              Aucune suggestion disponible pour le moment.
            </Text>
          </View>
        }
      />
    </View>
  );
}
