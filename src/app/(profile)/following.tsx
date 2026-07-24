// ÉCRAN 3 - Liste des abonnements (Following)
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { UserListItem } from '@/components/social/UserListItem';
import { useFollowActions, useFollowing } from '@/features/social/useSocial';

export default function FollowingScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: following = [] } = useFollowing();
  const { unfollow } = useFollowActions();

  const filteredFollowing = searchQuery
    ? following.filter(
        (user) =>
          user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : following;

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Abonnements',
        }}
      />

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-2.5 gap-3">
          <Icon library="ionicons" name="search" size={20} color="#A1A1AA" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher dans les abonnements..."
            placeholderTextColor="#A1A1AA"
            className="flex-1 text-[#18181B] dark:text-white text-sm"
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredFollowing}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            onPress={() => router.push(`/(profile)/${item.username}`)}
            onFollowPress={() => unfollow.mutate(item.id)}
            showFollowButton={true}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Icon library="ionicons" name="people-outline" size={64} color="#27272A" />
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4">Aucun abonnement</Text>
          </View>
        }
      />
    </View>
  );
}
