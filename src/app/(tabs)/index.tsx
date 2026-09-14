import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VerticalFeedList } from '@/components/feed/VerticalFeedList';
import { StoriesList } from '@/components/story/StoriesList';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { useFeed, useSponsoredFeed } from '@/features/feed/useFeed';
import { isSponsoredFeedItem, type FeedItem } from '@/features/feed/types';
import { useAuthStore } from '@/features/auth/auth.store';
import { useStories } from '@/features/story/useStory';

function deduplicateFeed(items: FeedItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${isSponsoredFeedItem(item) ? 'sponsored' : 'post'}:${String(item.id)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function FeedScreen() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const feed = useFeed();
  const { data: stories = [] } = useStories();
  const { data: sponsoredItems = [] } = useSponsoredFeed();

  const posts = useMemo<FeedItem[]>(() => {
    const organic = feed.data?.pages.flatMap((page) => page.data) ?? [];
    const withSponsored = sponsoredItems.length && organic.length >= 2
      ? [...organic.slice(0, 2), sponsoredItems[0], ...organic.slice(2)]
      : organic;
    return deduplicateFeed(withSponsored);
  }, [feed.data, sponsoredItems]);

  if (!isHydrated || !isAuthenticated || feed.isLoading) {
    return <View className="flex-1 bg-black"><StatusBar style="light" /><LoadingState label="Chargement de votre feed…" /></View>;
  }

  if (feed.isError && posts.length === 0) {
    return <View className="flex-1 bg-black"><StatusBar style="light" /><ErrorState title="Impossible de charger le feed" message={feed.error.message} retry={() => void feed.refetch()} /></View>;
  }

  if (!feed.isLoading && !feed.isError && posts.length === 0) {
    return <View className="flex-1 bg-black"><StatusBar style="light" /><EmptyState title="Aucune publication pour le moment" message="Explorez Yeyamo ou revenez un peu plus tard." /></View>;
  }

  return <View className="flex-1 bg-black">
    <StatusBar style="light" />
    <VerticalFeedList
      posts={posts}
      onEndReached={() => { if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage(); }}
      onRefresh={() => void feed.refetch()}
      refreshing={feed.isRefetching && !feed.isFetchingNextPage}
      isFetchingNextPage={feed.isFetchingNextPage}
      nextPageError={feed.isFetchNextPageError ? feed.error.message : null}
      onRetryNextPage={() => void feed.fetchNextPage()}
    />

    <SafeAreaView pointerEvents="box-none" edges={['top']} className="absolute left-0 right-0 top-0 z-20">
      <View pointerEvents="box-none" className="h-16 flex-row items-center justify-between px-4">
        <Text className="text-lg font-extrabold text-white" style={{ textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 }}>Pour vous</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => void feed.refetch()} className="h-11 w-11 items-center justify-center" activeOpacity={0.75} accessibilityLabel="Actualiser le feed"><Icon name="refresh" size={24} color="#FFFFFF" /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(explore)/search')} className="h-11 w-11 items-center justify-center" activeOpacity={0.75} accessibilityLabel="Rechercher"><Icon name="search" size={27} color="#FFFFFF" /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(social-graph)/passport')} className="h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[#EF4444]" style={{ shadowColor: '#000000', shadowOpacity: 0.35, shadowRadius: 5, elevation: 5 }} activeOpacity={0.8} accessibilityLabel="Ouvrir le Passport Yeyamo"><Icon name="id-card-outline" size={23} color="#FFFFFF" /></TouchableOpacity>
        </View>
      </View>
      <StoriesList stories={stories} currentUserId={currentUserId} overlay />
    </SafeAreaView>
  </View>;
}
