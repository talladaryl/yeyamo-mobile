// ÉCRAN 4 - Liste des abonnés (Followers)
import { useState } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { UserListItem } from '@/components/social/UserListItem';
import { useFollowActions, useFollowers } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

export default function FollowersScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: followers = [] } = useFollowers();
  const { follow, removeFollower } = useFollowActions();

  const filteredFollowers = searchQuery
    ? followers.filter(
        (user) =>
          user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : followers;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Abonnés',
        }}
      />

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-2.5 gap-3">
          <Icon library="ionicons" name="search" size={20} color="#A1A1AA" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher dans les abonnés..."
            placeholderTextColor={colors.textMuted}
            className="flex-1 text-[#18181B] dark:text-white text-sm"
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredFollowers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            onPress={() => router.push(`/(profile)/${item.username}`)}
            onFollowPress={() => follow.mutate(item.id)}
            onRemovePress={() => removeFollower.mutate(item.id)}
            showFollowButton={!item.is_following}
            showRemoveButton={true}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Icon library="ionicons" name="people-outline" size={64} color="#27272A" />
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4">Aucun abonné</Text>
          </View>
        }
      />
    </View>
  );
}
