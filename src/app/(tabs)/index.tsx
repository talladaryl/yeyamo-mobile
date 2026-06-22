import { View, Text, ActivityIndicator } from 'react-native';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native';
import { FeedList } from '@/components/feed/FeedList';
import { useFeed } from '@/features/feed/useFeed';
import type { FeedPost } from '@/features/feed/types';

export default function HomeScreen() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed();

  const posts = useMemo<FeedPost[]>(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-base text-center">
          Failed to load feed. Pull to retry.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" style={{ paddingTop: 0 }}>
      <FeedList
        posts={posts}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        isFetchingNextPage={isFetchingNextPage}
      />
    </SafeAreaView>
  );
}
