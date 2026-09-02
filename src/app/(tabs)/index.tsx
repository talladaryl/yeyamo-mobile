import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VerticalFeedList } from '@/components/feed/VerticalFeedList';
import { Icon } from '@/components/ui/Icon';
import { useFeed, useSponsoredFeed } from '@/features/feed/useFeed';
import { isSponsoredFeedItem, type FeedItem } from '@/features/feed/types';

type FeedMode = 'for-you' | 'following';

export default function FeedScreen() {
  const router = useRouter();
  const [feedMode, setFeedMode] = useState<FeedMode>('for-you');
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = useFeed(undefined, true);
  const { data: sponsoredItems = [] } = useSponsoredFeed();

  const posts = useMemo<FeedItem[]>(() => {
    const loadedPosts = data?.pages.flatMap((page) => page.data) ?? [];
    if (feedMode === 'following') return loadedPosts;
    if (!sponsoredItems.length || loadedPosts.length < 2) return loadedPosts;
    return [...loadedPosts.slice(0, 2), sponsoredItems[0], ...loadedPosts.slice(2)];
  }, [data, feedMode, sponsoredItems]);

  if (isLoading) {
    return <View className="flex-1 items-center justify-center bg-black"><StatusBar style="light" /><ActivityIndicator size="large" color="#FFFFFF" /></View>;
  }

  if (isError) {
    return <View className="flex-1 items-center justify-center bg-black px-6"><StatusBar style="light" /><Text className="text-center text-base text-white">Échec du chargement du feed</Text></View>;
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <VerticalFeedList
        posts={posts.filter((item, index, all) => all.findIndex((candidate) => String(candidate.id) === String(item.id) && isSponsoredFeedItem(candidate) === isSponsoredFeedItem(item)) === index)}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
      />

      <SafeAreaView pointerEvents="box-none" edges={['top']} className="absolute left-0 right-0 top-0 z-20">
        <View pointerEvents="box-none" className="h-28 flex-row items-start justify-center px-3">
          <View className="flex-row items-center gap-6">
            <FeedTopTab label="Abonnements" selected={feedMode === 'following'} onPress={() => setFeedMode('following')} />
            <FeedTopTab label="Pour vous" selected={feedMode === 'for-you'} onPress={() => setFeedMode('for-you')} />
          </View>
          <View className="absolute right-3 top-0 items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push('/(explore)/search')}
              className="h-11 w-11 items-center justify-center"
              activeOpacity={0.75}
              accessibilityLabel="Rechercher"
            >
              <Icon name="search" size={29} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(social-graph)/passport')}
              className="h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[#EF4444]"
              style={{ shadowColor: '#000000', shadowOpacity: 0.35, shadowRadius: 5, elevation: 5 }}
              activeOpacity={0.8}
              accessibilityLabel="Ouvrir le Passport Yeyamo"
            >
              <Icon name="id-card-outline" size={23} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeedTopTab({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="relative h-11 justify-center px-1" activeOpacity={0.75} accessibilityRole="tab" accessibilityState={{ selected }}>
      <Text className={`text-[15px] text-white ${selected ? 'font-extrabold' : 'font-semibold opacity-70'}`} style={{ textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 }}>{label}</Text>
      {selected ? <View className="absolute bottom-1.5 left-1/2 h-[3px] w-7 -translate-x-3.5 rounded-full bg-white" /> : null}
    </TouchableOpacity>
  );
}
