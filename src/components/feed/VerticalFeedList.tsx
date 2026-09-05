import { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useYeyamoTabBarHeight } from '@/components/navigation/useYeyamoTabBarHeight';
import { useRouter } from 'expo-router';
import type { ViewToken } from 'react-native';
import { FeedShareSheet } from './FeedShareSheet';
import { SponsoredFeedCard } from './SponsoredFeedCard';
import { VerticalFeedItem } from './VerticalFeedItem';
import { useTrackAdImpression } from '@/features/ads/useAds';
import { useAuthStore } from '@/features/auth/auth.store';
import { useConversations, useSendMessage } from '@/features/chat/useChat';
import { useLikePost } from '@/features/feed/useFeed';
import { isSponsoredFeedItem, type FeedItem, type FeedPost } from '@/features/feed/types';
import { socialApi } from '@/features/social/social.api';
import { useThemeStore } from '@/features/theme/theme.store';
import type { EntityId } from '@/types/api.types';

type VerticalFeedListProps = {
  posts: FeedItem[];
  onEndReached?: () => void;
};

export function VerticalFeedList({ posts, onEndReached }: VerticalFeedListProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemHeight, setItemHeight] = useState(0);
  const trackedDeliveries = useRef<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<EntityId>>(
    () => new Set(posts.filter((post) => !isSponsoredFeedItem(post) && post.is_saved).map((post) => post.id)),
  );
  const [followedAuthorIds, setFollowedAuthorIds] = useState<Set<EntityId>>(new Set());
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<EntityId>>(new Set());
  const [interestedPostIds, setInterestedPostIds] = useState<Set<EntityId>>(new Set());
  const [playbackRates, setPlaybackRates] = useState<Record<string, number>>({});
  const [sharePost, setSharePost] = useState<FeedPost | null>(null);
  const { mutate: toggleLike } = useLikePost();
  const { data: conversations = [] } = useConversations();
  const sendMessage = useSendMessage();
  const trackImpression = useTrackAdImpression();
  const tabBarHeight = useYeyamoTabBarHeight();
  const bottomOverlayInset = tabBarHeight + 18;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) setActiveIndex(viewableItems[0].index);
      viewableItems.forEach((token) => {
        const item = token.item as FeedItem;
        if (token.isViewable && isSponsoredFeedItem(item) && !trackedDeliveries.current.has(item.delivery_id)) {
          trackedDeliveries.current.add(item.delivery_id);
          trackImpression.mutate(
            { deliveryId: item.delivery_id, impressionTrackingToken: item.impression_tracking_token, viewDurationMs: 1_000 },
            { onError: () => trackedDeliveries.current.delete(item.delivery_id) },
          );
        }
      });
    },
    [trackImpression],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50, minimumViewTime: 1_000 }).current;

  const handleFollow = async (authorId: EntityId) => {
    const wasFollowing = followedAuthorIds.has(authorId);
    setFollowedAuthorIds((current) => {
      const next = new Set(current);
      if (wasFollowing) next.delete(authorId);
      else next.add(authorId);
      return next;
    });

    if (isDemo) return;
    try {
      await (wasFollowing ? socialApi.unfollowUser(authorId) : socialApi.followUser(authorId));
    } catch {
      setFollowedAuthorIds((current) => {
        const next = new Set(current);
        if (wasFollowing) next.add(authorId);
        else next.delete(authorId);
        return next;
      });
      Alert.alert('Action impossible', "Votre abonnement n'a pas pu être mis à jour.");
    }
  };

  const toggleSaved = (postId: EntityId) => {
    setSavedPostIds((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <View className="flex-1" onLayout={(event) => setItemHeight(Math.round(event.nativeEvent.layout.height))}>
      {itemHeight > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={posts.filter((post) => isSponsoredFeedItem(post) || !hiddenPostIds.has(post.id))}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => isSponsoredFeedItem(item) ? (
            <SponsoredFeedCard item={item} height={itemHeight} isActive={index === activeIndex} bottomOverlayInset={bottomOverlayInset} />
          ) : (
            <VerticalFeedItem
              post={item}
              height={itemHeight}
              bottomOverlayInset={bottomOverlayInset}
              isActive={index === activeIndex}
              isFollowing={followedAuthorIds.has(item.author.id)}
              isSaved={savedPostIds.has(item.id)}
              playbackRate={playbackRates[String(item.id)] ?? 1}
              onFollow={() => void handleFollow(item.author.id)}
              onLike={() => toggleLike({ postId: item.id, isLiked: item.is_liked })}
              onComment={() => router.push(`/(post)/${item.id}/comments`)}
              onShare={() => setSharePost(item)}
              onSave={() => toggleSaved(item.id)}
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
          ListEmptyComponent={(
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-center text-base font-semibold" style={{ color: colors.text }}>Aucune publication pour le moment</Text>
              <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>Les nouvelles découvertes apparaîtront ici.</Text>
            </View>
          )}
        />
      ) : null}

      <FeedShareSheet
        visible={Boolean(sharePost)}
        post={sharePost}
        conversations={conversations}
        playbackRate={sharePost ? (playbackRates[String(sharePost.id)] ?? 1) : 1}
        isSaved={sharePost ? savedPostIds.has(sharePost.id) : false}
        isInterested={sharePost ? interestedPostIds.has(sharePost.id) : false}
        onClose={() => setSharePost(null)}
        onSendToFriend={(conversationId) => {
          if (!sharePost) return;
          sendMessage.mutate(
            { conversation_id: conversationId, body: `Découvre cette publication sur Yeyamo\nhttps://yeyamo.app/posts/${sharePost.id}` },
            {
              onSuccess: () => {
                setSharePost(null);
                Alert.alert('Envoyé', 'La publication a été envoyée.');
              },
              onError: () => Alert.alert('Envoi impossible', "La publication n'a pas pu être envoyée."),
            },
          );
        }}
        onPlaybackRateChange={(rate) => {
          if (sharePost) setPlaybackRates((current) => ({ ...current, [String(sharePost.id)]: rate }));
        }}
        onSave={() => {
          if (sharePost) toggleSaved(sharePost.id);
        }}
        onInterested={() => {
          if (!sharePost) return;
          const postId = sharePost.id;
          setInterestedPostIds((current) => {
            const next = new Set(current);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
          });
        }}
        onNotInterested={() => {
          if (!sharePost) return;
          const postId = sharePost.id;
          setSharePost(null);
          setHiddenPostIds((current) => new Set(current).add(postId));
        }}
      />
    </View>
  );
}
