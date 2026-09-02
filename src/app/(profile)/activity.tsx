// ÉCRAN 7 - Activité des personnes suivies
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { ActivityItem } from '@/components/social/ActivityItem';
import { useNetworkActivity } from '@/features/social/useSocial';

type ActivityFilter = 'all' | 'likes' | 'comments' | 'follows' | 'posts';

export default function ActivityScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const { data: activities = [] } = useNetworkActivity();

  const filteredActivities =
    filter === 'all'
      ? activities
      : activities.filter((activity) => {
          if (filter === 'likes') return activity.type === 'like';
          if (filter === 'comments') return activity.type === 'comment';
          if (filter === 'follows') return activity.type === 'follow';
          if (filter === 'posts') return activity.type === 'post';
          return true;
        });

  const filters: { key: ActivityFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'Tout', icon: 'apps' },
    { key: 'likes', label: 'Likes', icon: 'heart' },
    { key: 'comments', label: 'Commentaires', icon: 'chatbubble' },
    { key: 'follows', label: 'Abonnements', icon: 'person-add' },
    { key: 'posts', label: 'Publications', icon: 'image' },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Activité',
        }}
      />

      {/* Header Info */}
      <View className="px-4 py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <Text className="mb-1 text-lg font-bold text-[#18181B] dark:text-white">Réseau</Text>
        <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">
          Activité des personnes que vous suivez
        </Text>
      </View>

      {/* Filters */}
      <View className="border-b border-[#E4E4E7] dark:border-[#27272A]">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.key)}
              className={`mr-3 px-4 py-2 rounded-full flex-row items-center gap-2 ${
                filter === item.key ? 'bg-[#EF4444]' : 'bg-[#F4F4F5] dark:bg-[#27272A]'
              }`}
              activeOpacity={0.8}
            >
              <Icon
                library="ionicons"
                name={item.icon as any}
                size={16}
                color={filter === item.key ? '#FFFFFF' : '#A1A1AA'}
              />
              <Text
                className={`text-sm font-semibold ${
                  filter === item.key ? 'text-white' : 'text-[#52525B] dark:text-[#A1A1AA]'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Activity List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityItem
            activity={item}
            onPress={() => {
              if (item.post) {
                router.push(`/(post)/${item.post.id}`);
              } else if (item.target_user) {
                router.push(`/(profile)/${item.target_user.username}`);
              }
            }}
            onUserPress={() => router.push(`/(profile)/${item.user.username}`)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Icon library="ionicons" name="notifications-outline" size={64} color="#27272A" />
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4">Aucune activité récente</Text>
          </View>
        }
      />
    </View>
  );
}
