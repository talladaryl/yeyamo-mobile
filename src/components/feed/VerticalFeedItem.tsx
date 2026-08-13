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
  onFollow,
  onLike,
  onComment,
  onShare,
  onSave,
}: VerticalFeedItemProps) {
  const router = useRouter();
  const videoUri = post.type === 'video' ? (post.media[0]?.url ?? '') : '';
  
  const player = useVideoPlayer(
    post.type === 'video' && isActive ? videoUri : null,
    (p) => {
      p.loop = true;
      if (isActive) p.play();
    }
  );

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
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
      />

      {/* Bottom info */}
      <View className="absolute left-4 right-20" style={{ bottom: bottomOverlayInset }}>
        <Pressable
          onPress={() => router.push(`/(profile)/${post.author.username}`)}
          className="flex-row items-center gap-2 mb-3"
        >
          <Avatar
            uri={post.author.avatar_url}
            displayName={post.author.display_name}
            size={40}
          />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-white font-semibold text-sm">
                {post.author.username}
              </Text>
              {post.author.is_verified && <VerifiedBadge size={14} />}
            </View>
          </View>
        </Pressable>

        {post.caption && (
          <Text className="text-white text-sm mb-2" numberOfLines={3}>
            {post.caption}
          </Text>
        )}

        {post.place_tag && (
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="location" size={14} color="#EF4444" />
            <Text className="text-white text-xs">{post.place_tag.name}</Text>
          </View>
        )}
      </View>

      {/* Right action buttons */}
      <View className="absolute right-3 gap-6" style={{ bottom: bottomOverlayInset + 8 }}>
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
