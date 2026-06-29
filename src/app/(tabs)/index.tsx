import { View, Text, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useMemo } from 'react';
import { VerticalFeedList } from '@/components/feed/VerticalFeedList';
import { StoriesList } from '@/components/story/StoriesList';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { useFeed } from '@/features/feed/useFeed';
import type { FeedPost } from '@/features/feed/types';

// Mock stories data - replace with real API call
const mockStories = [
  {
    id: 1,
    author: {
      id: 1,
      username: 'vous',
      display_name: 'Vous',
      avatar_url: null,
    },
    is_viewed: false,
  },
];

export default function FeedScreen() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = useFeed();

  const posts = useMemo<FeedPost[]>(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-base text-center">
          Échec du chargement du feed
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      {/* Header fixe */}
      <SafeAreaView className="bg-[#0A0A0A] border-b border-[#27272A]">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Logo size="small" />
          
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-[#161616] px-3 py-2 rounded-full"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="location-outline" size={16} color="#EF4444" />
              <Text className="text-white text-sm font-medium">Départements</Text>
              <Icon library="ionicons" name="chevron-down" size={16} color="#A1A1AA" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8}>
              <Icon library="ionicons" name="search-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Stories */}
      <StoriesList stories={mockStories} currentUserId={1} />

      {/* Vertical Feed */}
      <VerticalFeedList
        posts={posts}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
      />
    </View>
  );
}
