import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { VerticalFeedList } from '@/components/feed/VerticalFeedList';
import { StoriesList } from '@/components/story/StoriesList';
import { Icon } from '@/components/ui/Icon';
import { useFeed } from '@/features/feed/useFeed';
import type { FeedPost } from '@/features/feed/types';
import { useThemeStore } from '@/features/theme/theme.store';
import ENV from '@/config/env';
import { MOCK_FEED_PAGE } from '@/features/mock/mockData';

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
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = useFeed();

  const posts = useMemo<FeedPost[]>(() => {
    const loadedPosts = data?.pages.flatMap((page) => page.data) ?? [];
    return ENV.USE_MOCKS && loadedPosts.length === 0 ? MOCK_FEED_PAGE.data : loadedPosts;
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <Text className="text-[#EF4444] text-base text-center">
          Échec du chargement du feed
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Compact feed controls: region + search, without a brand header. */}
      <SafeAreaView edges={['top']} className="border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <View className="flex-row items-center justify-between px-4 py-1.5">
          <TouchableOpacity
            className="h-8 flex-row items-center gap-1.5 rounded-full px-3"
            style={{ backgroundColor: colors.elevated }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Filtrer par département"
          >
            <Icon library="ionicons" name="location" size={15} color="#EF4444" />
            <Text className="text-xs font-semibold" style={{ color: colors.text }}>Départements</Text>
            <Icon library="ionicons" name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(explore)/search')}
            activeOpacity={0.8}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.elevated }}
            accessibilityRole="button"
            accessibilityLabel="Rechercher"
          >
            <Icon library="ionicons" name="search" size={19} color={colors.text} />
          </TouchableOpacity>
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
