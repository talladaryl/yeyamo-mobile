// ÉCRAN 5 - Suggestions à suivre
import { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SuggestionCard } from '@/components/social/SuggestionCard';
import { useFollowActions, useSocialSuggestions } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SuggestionsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data: suggestions = [] } = useSocialSuggestions();
  const { follow } = useFollowActions();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const visibleSuggestions = suggestions.filter((item) => !dismissedIds.includes(String(item.id)));

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Suggestions à suivre',
        }}
      />

      {/* Header Info */}
      <View className="px-4 py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <Text className="text-[#18181B] dark:text-white font-bold text-lg mb-1">Pour vous</Text>
        <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">
          Découvrez des personnes selon vos centres d'intérêt
        </Text>
      </View>

      {/* Suggestions List */}
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
            <Icon library="ionicons" name="people-outline" size={64} color="#27272A" />
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4">Aucune suggestion disponible</Text>
          </View>
        }
      />
    </View>
  );
}
