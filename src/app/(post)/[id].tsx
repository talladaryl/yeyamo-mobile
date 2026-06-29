import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Icon } from '@/components/ui/Icon';
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
  const player = useVideoPlayer(post?.type === 'video' ? videoUri : '', (p) => {
    p.loop = true;
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#EF4444" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-center">Publication introuvable.</Text>
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
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pl-4">
              <Icon library="ionicons" name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="pr-4">
              <Icon library="ionicons" name="ellipsis-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerClassName="pb-10">
        {/* Media */}
        {post.type === 'video' ? (
          <VideoView
            player={player}
            style={{ width: '100%', aspectRatio: 9 / 16 }}
            contentFit="cover"
            nativeControls
          />
        ) : (
          <Image
            source={{ uri: post.media[0]?.url }}
            style={{ width: '100%', aspectRatio: 1 }}
            contentFit="cover"
          />
        )}

        {/* Author row */}
        <View className="flex-row items-center px-4 pt-4 gap-3">
          <Pressable
            onPress={() => router.push(`/(profile)/${post.author.username}`)}
            className="flex-row items-center gap-3 flex-1"
          >
            <Avatar
              uri={post.author.avatar_url}
              displayName={post.author.display_name}
              size={44}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-1">
                <Text className="text-white font-semibold text-base">
                  {post.author.username}
                </Text>
                {post.author.is_verified && <VerifiedBadge size={16} />}
              </View>
            </View>
          </Pressable>

          <TouchableOpacity
            className="bg-[#EF4444] px-6 py-2 rounded-full"
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-semibold">Suivre</Text>
          </TouchableOpacity>
        </View>

        {/* Actions row */}
        <View className="flex-row items-center gap-5 px-4 pt-4">
          <TouchableOpacity
            onPress={() => toggleLike({ postId: post.id, isLiked: post.is_liked })}
            activeOpacity={0.7}
          >
            <Icon
              library="ionicons"
              name={post.is_liked ? 'heart' : 'heart-outline'}
              size={28}
              color={post.is_liked ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/(post)/${post.id}/comments`)}
            activeOpacity={0.7}
          >
            <Icon library="ionicons" name="chatbubble-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7}>
            <Icon library="ionicons" name="arrow-redo-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="flex-1" />

          <TouchableOpacity activeOpacity={0.7}>
            <Icon
              library="ionicons"
              name={post.is_saved ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Likes count */}
        <View className="px-4 pt-3">
          <Text className="text-white text-sm font-semibold">
            {formatCount(post.likes_count)} j'aime
          </Text>
        </View>

        {/* Caption */}
        {post.caption ? (
          <View className="px-4 pt-2">
            <Text className="text-white text-sm">
              <Text className="font-semibold">{post.author.username} </Text>
              {post.caption}
            </Text>
          </View>
        ) : null}

        {/* Place tag */}
        {post.place_tag ? (
          <TouchableOpacity
            className="px-4 pt-2 flex-row items-center gap-1"
            activeOpacity={0.7}
          >
            <Icon library="ionicons" name="location" size={14} color="#A1A1AA" />
            <Text className="text-[#A1A1AA] text-sm">{post.place_tag.name}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Comments preview */}
        {post.comments_count > 0 && (
          <TouchableOpacity
            className="px-4 pt-2"
            onPress={() => router.push(`/(post)/${post.id}/comments`)}
            activeOpacity={0.7}
          >
            <Text className="text-[#A1A1AA] text-sm">
              Voir les {formatCount(post.comments_count)} commentaires
            </Text>
          </TouchableOpacity>
        )}

        {/* Date */}
        <View className="px-4 pt-2">
          <Text className="text-[#52525B] text-xs uppercase">
            {timeAgo(post.created_at)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
