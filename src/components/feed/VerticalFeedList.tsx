import { useRef, useState, useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { VerticalFeedItem } from './VerticalFeedItem';
import { useLikePost } from '@/features/feed/useFeed';
import { useRouter } from 'expo-router';
import type { FeedPost } from '@/features/feed/types';
import type { ViewToken } from 'react-native';

type VerticalFeedListProps = {
  posts: FeedPost[];
  onEndReached?: () => void;
};

export function VerticalFeedList({ posts, onEndReached }: VerticalFeedListProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const { mutate: toggleLike } = useLikePost();

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => (
        <VerticalFeedItem
          post={item}
          isActive={index === activeIndex}
          onLike={() => toggleLike({ postId: item.id, isLiked: item.is_liked })}
          onComment={() => router.push(`/(post)/${item.id}/comments`)}
          onShare={() => {
            // TODO: Implement share
          }}
          onSave={() => {
            // TODO: Implement save
          }}
        />
      )}
      pagingEnabled
      snapToInterval={1}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      removeClippedSubviews
      maxToRenderPerBatch={3}
      windowSize={3}
    />
  );
}
