import { useCallback, useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View, Text } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/Avatar';
import { formatCount } from '@/utils/format';
import { useLikePost } from '@/features/feed/useFeed';
import type { FeedPost } from '@/features/feed/types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoCardProps {
  post: FeedPost;
  isActive: boolean;
}

export function VideoCard({ post, isActive }: VideoCardProps) {
  const videoUri = post.media[0]?.url ?? '';
  const isVideo = post.type === 'video';

  const player = useVideoPlayer(isVideo ? videoUri : null, (p) => {
    p.loop = true;
    p.muted = false;
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  // Auto-play / pause based on whether card is the active one in the feed
  const prevActive = useRef(false);
  if (isVideo) {
    if (isActive && !prevActive.current) {
      player.play();
    } else if (!isActive && prevActive.current) {
      player.pause();
    }
    prevActive.current = isActive;
  }

  const { mutate: toggleLike } = useLikePost();
  const [muted, setMuted] = useState(false);

  const handleMute = useCallback(() => {
    player.muted = !muted;
    setMuted((m) => !m);
  }, [muted, player]);

  const handleLike = useCallback(() => {
    toggleLike({ postId: post.id, isLiked: post.is_liked });
  }, [post.id, post.is_liked, toggleLike]);

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      {/* Media */}
      {isVideo ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleMute}
          className="absolute inset-0"
        >
          <VideoView
            player={player}
            style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
            contentFit="cover"
            nativeControls={false}
          />
        </TouchableOpacity>
      ) : (
        <Image
          source={{ uri: post.media[0]?.url }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          contentFit="cover"
          transition={200}
        />
      )}

      {/* Overlay gradient hint */}
      <View className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* Right action bar */}
      <View className="absolute right-3 bottom-28 gap-6 items-center">
        <ActionButton
          icon={post.is_liked ? '❤️' : '🤍'}
          count={formatCount(post.likes_count)}
          onPress={handleLike}
        />
        <ActionButton icon="💬" count={formatCount(post.comments_count)} onPress={() => {}} />
        <ActionButton icon="↗️" count={formatCount(post.shares_count)} onPress={() => {}} />
        {isVideo && (
          <ActionButton icon={muted ? '🔇' : '🔊'} onPress={handleMute} />
        )}
      </View>

      {/* Bottom author info */}
      <View className="absolute bottom-6 left-4 right-16 gap-2">
        <View className="flex-row items-center gap-2">
          <Avatar
            uri={post.author.avatar_url}
            displayName={post.author.display_name}
            size={36}
          />
          <Text className="text-white font-semibold text-sm">
            @{post.author.username}
          </Text>
        </View>
        {post.caption ? (
          <Text className="text-white text-sm leading-5" numberOfLines={2}>
            {post.caption}
          </Text>
        ) : null}
        {post.place_tag ? (
          <Text className="text-[#A1A1AA] text-xs">📍 {post.place_tag.name}</Text>
        ) : null}
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  count,
  onPress,
}: {
  icon: string;
  count?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center gap-1" activeOpacity={0.7}>
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      {count ? (
        <Text className="text-white text-xs font-medium">{count}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
