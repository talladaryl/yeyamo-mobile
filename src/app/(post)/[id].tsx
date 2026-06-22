import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { usePostDetail } from '@/features/post/usePost';
import { useLikePost } from '@/features/feed/useFeed';
import { formatCount, timeAgo } from '@/utils/format';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const postId = Number(id);

  const { data: post, isLoading, isError } = usePostDetail(postId);
  const { mutate: toggleLike } = useLikePost();

  const videoUri = post?.type === 'video' ? (post.media[0]?.url ?? '') : '';
  const player = useVideoPlayer(post?.type === 'video' ? videoUri : null, (p) => {
    p.loop = true;
    p.play();
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-center">Post not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: `@${post.author.username}`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pr-4">
              <Text className="text-white text-base">✕</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerClassName="pb-10">
        {/* Media */}
        {post.type === 'video' ? (
          <VideoView
            player={player}
            style={{ width: '100%', height: 400 }}
            contentFit="cover"
            nativeControls
          />
        ) : (
          <Image
            source={{ uri: post.media[0]?.url }}
            style={{ width: '100%', height: 400 }}
            contentFit="cover"
          />
        )}

        {/* Author row */}
        <View className="flex-row items-center px-4 pt-4 gap-3">
          <Avatar
            uri={post.author.avatar_url}
            displayName={post.author.display_name}
            size={44}
          />
          <View className="flex-1">
            <Text className="text-white font-semibold">{post.author.display_name}</Text>
            <Text className="text-[#A1A1AA] text-xs">@{post.author.username}</Text>
          </View>
          <Text className="text-[#52525B] text-xs">{timeAgo(post.created_at)}</Text>
        </View>

        {/* Caption */}
        {post.caption ? (
          <Text className="text-white text-sm leading-6 px-4 pt-3">{post.caption}</Text>
        ) : null}

        {/* Place tag */}
        {post.place_tag ? (
          <Text className="text-[#A1A1AA] text-xs px-4 pt-2">
            📍 {post.place_tag.name}
          </Text>
        ) : null}

        {/* Action bar */}
        <View className="flex-row items-center gap-6 px-4 pt-4 pb-2 border-b border-[#27272A]">
          <TouchableOpacity
            onPress={() => toggleLike({ postId: post.id, isLiked: post.is_liked })}
            className="flex-row items-center gap-1.5"
          >
            <Text style={{ fontSize: 22 }}>{post.is_liked ? '❤️' : '🤍'}</Text>
            <Text className="text-white text-sm">{formatCount(post.likes_count)}</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-1.5">
            <Text style={{ fontSize: 22 }}>💬</Text>
            <Text className="text-white text-sm">{formatCount(post.comments_count)}</Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Text style={{ fontSize: 22 }}>↗️</Text>
            <Text className="text-white text-sm">{formatCount(post.shares_count)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
