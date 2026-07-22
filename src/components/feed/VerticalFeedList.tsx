import { useRef, useState, useCallback } from 'react';
import { Alert, FlatList, Share, Text, View } from 'react-native';
import { VerticalFeedItem } from './VerticalFeedItem';
import { useLikePost } from '@/features/feed/useFeed';
import { useRouter } from 'expo-router';
import type { FeedPost } from '@/features/feed/types';
import type { ViewToken } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';
import { socialApi } from '@/features/social/social.api';
import ENV from '@/config/env';

type VerticalFeedListProps = {
  posts: FeedPost[];
  onEndReached?: () => void;
};

export function VerticalFeedList({ posts, onEndReached }: VerticalFeedListProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemHeight, setItemHeight] = useState(0);
  const [savedPostIds, setSavedPostIds] = useState<Set<number>>(
    () => new Set(posts.filter((post) => post.is_saved).map((post) => post.id)),
  );
  const [followedAuthorIds, setFollowedAuthorIds] = useState<Set<number>>(new Set());
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

  const handleFollow = async (authorId: number) => {
    const wasFollowing = followedAuthorIds.has(authorId);
    setFollowedAuthorIds((current) => {
      const next = new Set(current);
      if (wasFollowing) next.delete(authorId);
      else next.add(authorId);
      return next;
    });

    if (ENV.USE_MOCKS) return;

    try {
      await (wasFollowing ? socialApi.unfollowUser(authorId) : socialApi.followUser(authorId));
    } catch {
      setFollowedAuthorIds((current) => {
        const next = new Set(current);
        if (wasFollowing) next.add(authorId);
        else next.delete(authorId);
        return next;
      });
      Alert.alert('Action impossible', 'Votre abonnement n’a pas pu être mis à jour.');
    }
  };

  return (
    <View
      className="flex-1"
      onLayout={(event) => setItemHeight(Math.round(event.nativeEvent.layout.height))}
    >
    {itemHeight > 0 ? <FlatList
      style={{ flex: 1 }}
      data={posts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => (
        <VerticalFeedItem
          post={item}
          height={itemHeight}
          isActive={index === activeIndex}
          isFollowing={followedAuthorIds.has(item.author.id)}
          isSaved={savedPostIds.has(item.id)}
          onFollow={() => void handleFollow(item.author.id)}
          onLike={() => toggleLike({ postId: item.id, isLiked: item.is_liked })}
          onComment={() => router.push(`/(post)/${item.id}/comments`)}
          onShare={async () => {
            const postUrl = `https://yeyamo.app/posts/${item.id}`;
            const place = item.place_tag?.name ? `\nLieu : ${item.place_tag.name}` : '';

            try {
              await Share.share({
                title: 'Yeyamo',
                message: `Découvre cette publication sur Yeyamo\n${postUrl}${place}`,
                url: postUrl,
              });
            } catch {
              Alert.alert('Partage impossible', 'Le menu de partage du téléphone n’a pas pu être ouvert.');
            }
          }}
          onSave={() => {
            setSavedPostIds((current) => {
              const next = new Set(current);
              if (next.has(item.id)) {
                next.delete(item.id);
                Alert.alert('Retiré', 'Publication retirée des favoris locaux.');
              } else {
                next.add(item.id);
                Alert.alert('Enregistré', 'Publication ajoutée aux favoris locaux.');
              }
              return next;
            });
          }}
        />
      )}
      pagingEnabled
      snapToInterval={itemHeight}
      snapToAlignment="start"
      disableIntervalMomentum
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(_data, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
      removeClippedSubviews={false}
      initialNumToRender={2}
      maxToRenderPerBatch={3}
      windowSize={3}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center px-8 py-20">
          <Text className="text-center text-base font-semibold" style={{ color: colors.text }}>
            Aucune publication pour le moment
          </Text>
          <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
            Les nouvelles découvertes apparaîtront ici.
          </Text>
        </View>
      }
    /> : null}
    </View>
  );
}
