import { useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { formatCount } from '@/utils/format';
import { useRouter } from 'expo-router';
import type { FeedPost } from '@/features/feed/types';

type VerticalFeedItemProps = {
  post: FeedPost;
  height: number;
  bottomOverlayInset: number;
  isActive: boolean;
  isFollowing: boolean;
  isSaved: boolean;
  playbackRate: number;
  onFollow: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
};

export function VerticalFeedItem({
  post,
  height,
  bottomOverlayInset,
  isActive,
  isFollowing,
  isSaved,
  playbackRate,
  onFollow,
  onLike,
  onComment,
  onShare,
  onSave,
}: VerticalFeedItemProps) {
  const router = useRouter();
  const videoUri = post.type === 'video' ? (post.media[0]?.url ?? '') : '';
  const backendLinked = post.linkedContent;
  const legacyLinked = post.linked_content;
  const linkedRoute = backendLinked
    ? (backendLinked.type === 'PROVERB' ? '/(explore)/proverbs/' : '/(explore)/recipes/')
    : legacyLinked ? ({ proverb: '/(explore)/proverbs/', recipe: '/(explore)/recipes/', artwork: '/(explore)/artworks/', artist: '/(explore)/artisans/', language: '/(explore)/languages/', culture: '/(explore)/culture/' } as const)[legacyLinked.type] : null;
  const linkedId = backendLinked?.id ?? legacyLinked?.id;
  const linkedLabel = backendLinked ? backendLinked.title ?? (backendLinked.type === 'PROVERB' ? 'Voir le proverbe' : 'Voir la recette') : legacyLinked?.label;
  
  const player = useVideoPlayer(
    post.type === 'video' && isActive ? videoUri : null,
    (p) => {
      p.loop = true;
      p.playbackRate = playbackRate;
      if (isActive) p.play();
    }
  );

  useEffect(() => {
    if (post.type === 'video') player.playbackRate = playbackRate;
  }, [playbackRate, player, post.type]);

  return (
    <View style={{ height }} className="bg-[#0A0A0A]">
      {/* Media */}
      {post.type === 'video' ? (
        <VideoView
          player={player}
          style={{ flex: 1 }}
          contentFit="cover"
          nativeControls={false}
        />
      ) : (
        <Image
          source={{ uri: post.media[0]?.url }}
          style={{ flex: 1 }}
          contentFit="cover"
        />
      )}

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.88)']}
        className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none"
      />

      {/* Bottom info */}
      <View className="absolute left-4 right-20" style={{ bottom: bottomOverlayInset + 8 }}>
        <Pressable onPress={() => router.push(`/(profile)/${post.author.username}`)} className="mb-2 flex-row items-center gap-1.5">
          <Text className="text-[15px] font-extrabold text-white">@{post.author.username}</Text>
          {post.author.is_verified && <VerifiedBadge size={15} />}
        </Pressable>

        {post.caption && (
          <Text className="mb-2 text-sm leading-5 text-white" numberOfLines={4}>
            {post.caption}
          </Text>
        )}

        {linkedRoute && linkedId && linkedLabel ? (
          <TouchableOpacity
            onPress={() => {
              router.push(`${linkedRoute}${linkedId}` as never);
            }}
            className="mb-2 self-start flex-row items-center rounded-full bg-white/20 px-3 py-2"
          >
            <Icon name="book-outline" size={15} color="#FFFFFF" />
            <Text className="ml-2 text-xs font-bold text-white">{linkedLabel}</Text>
            <Icon name="chevron-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}

        {post.place_tag && (
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="location" size={14} color="#EF4444" />
            <Text className="text-white text-xs">{post.place_tag.name}</Text>
          </View>
        )}
      </View>

      {/* Right action buttons */}
      <View className="absolute right-3 gap-5" style={{ bottom: bottomOverlayInset + 18 }}>
        {/* Author avatar (clickable) */}
        <View className="items-center pb-1">
        <TouchableOpacity onPress={() => router.push(`/(profile)/${post.author.username}`)} activeOpacity={0.8}>
          <Avatar
            uri={post.author.avatar_url}
            displayName={post.author.display_name}
            size={44}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onFollow}
          activeOpacity={0.8}
          className="-mt-2 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#EF4444]"
          accessibilityRole="button"
          accessibilityLabel={isFollowing ? `Ne plus suivre ${post.author.display_name}` : `Suivre ${post.author.display_name}`}
        >
          <Icon library="ionicons" name={isFollowing ? 'checkmark' : 'add'} size={16} color="#FFFFFF" />
        </TouchableOpacity>
        </View>

        {/* Like */}
        <TouchableOpacity
          onPress={onLike}
          className="items-center"
          activeOpacity={0.7}
        >
          <Icon
            library="ionicons"
            name={post.is_liked ? 'heart' : 'heart-outline'}
            size={32}
            color={post.is_liked ? '#EF4444' : '#FFFFFF'}
          />
          <Text className="text-white text-xs font-semibold mt-1">
            {formatCount(post.likes_count)}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          onPress={onComment}
          className="items-center"
          activeOpacity={0.7}
        >
          <Icon library="ionicons" name="chatbubble-outline" size={30} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold mt-1">
            {formatCount(post.comments_count)}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          onPress={onShare}
          className="items-center"
          activeOpacity={0.7}
        >
          <Icon library="ionicons" name="arrow-redo-outline" size={30} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold mt-1">
            {formatCount(post.shares_count)}
          </Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          onPress={onSave}
          className="items-center"
          activeOpacity={0.7}
        >
          <Icon
            library="ionicons"
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={30}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
