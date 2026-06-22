import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  type ViewToken,
  type ListRenderItem,
  ActivityIndicator,
  View,
} from 'react-native';
import { VideoCard } from './VideoCard';
import type { FeedPost } from '@/features/feed/types';

interface FeedListProps {
  posts: FeedPost[];
  onEndReached: () => void;
  isFetchingNextPage: boolean;
}

export function FeedList({ posts, onEndReached, isFetchingNextPage }: FeedListProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) {
        setActiveIndex(first.index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  });

  const renderItem: ListRenderItem<FeedPost> = useCallback(
    ({ item, index }) => (
      <VideoCard post={item} isActive={index === activeIndex} />
    ),
    [activeIndex],
  );

  const keyExtractor = useCallback((item: FeedPost) => String(item.id), []);

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      snapToAlignment="start"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig.current}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      removeClippedSubviews
      maxToRenderPerBatch={3}
      windowSize={5}
      initialNumToRender={2}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-4 items-center">
            <ActivityIndicator color="#7C3AED" />
          </View>
        ) : null
      }
    />
  );
}
