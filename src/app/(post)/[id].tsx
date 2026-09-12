import { ActivityIndicator, Alert, View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useThemeStore } from '@/features/theme/theme.store';
import { usePostDetail } from '@/features/post/usePost';
import { feedService } from '@/features/feed/feed.service';
import { feedApi } from '@/features/feed/feed.api';

const { width } = Dimensions.get('window');

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [interactionState, setInteractionState] = useState<{
    postId: string;
    isLiked: boolean;
    isSaved: boolean;
    likesCount: number;
  } | null>(null);
  const [comment, setComment] = useState('');
  const { data: post, isLoading, refetch } = usePostDetail(id);

  const currentInteraction = interactionState?.postId === id ? interactionState : null;
  const isLiked = currentInteraction?.isLiked ?? post?.is_liked ?? false;
  const isSaved = currentInteraction?.isSaved ?? post?.is_saved ?? false;
  const likesCount = currentInteraction?.likesCount ?? post?.likes_count ?? 0;

  const handleLike = async () => {
    const previous = isLiked;
    const previousCount = likesCount;
    setInteractionState({
      postId: id,
      isLiked: !previous,
      isSaved,
      likesCount: previousCount + (previous ? -1 : 1),
    });
    try {
      await feedService.toggleLike(id, previous);
    } catch {
      setInteractionState({ postId: id, isLiked: previous, isSaved, likesCount: previousCount });
      Alert.alert('Action impossible', 'Le like n’a pas pu être enregistré.');
    }
  };

  const handleSave = async () => {
    const previous = isSaved;
    setInteractionState({ postId: id, isLiked, isSaved: !previous, likesCount });
    try {
      await feedService.toggleSave(id, previous);
    } catch {
      setInteractionState({ postId: id, isLiked, isSaved: previous, likesCount });
      Alert.alert('Action impossible', 'La sauvegarde n’a pas pu être enregistrée.');
    }
  };

  const handleComment = async () => {
    const body = comment.trim();
    if (!body) return;
    try {
      await feedApi.addComment(id, body);
      setComment('');
      await refetch();
    } catch {
      Alert.alert('Envoi impossible', 'Le commentaire n’a pas pu être publié.');
    }
  };

  const handleShare = async () => {
    const result = await Share.share({ message: `https://yeyamo.com/posts/${id}` });
    if (result.action === Share.sharedAction) {
      try {
        await feedApi.recordShare(id);
      } catch {
        // The native share succeeded; analytics failure must not mislead the user.
      }
    }
  };

  if (isLoading || !post) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Author Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-3">
            <Image
              source={{ uri: post.author.avatar_url || '' }}
              style={{ width: 40, height: 40 }}
              className="rounded-full"
            />
            <View>
              <View className="flex-row items-center gap-1">
                <Text className="font-semibold text-base" style={{ color: colors.text }}>{post.author.display_name}</Text>
                {post.author.is_verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                )}
              </View>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{post.created_at}</Text>
            </View>
          </View>
        </View>

        {/* Post Image */}
        <Image
          source={{ uri: post.media[0]?.url || '' }}
          style={{ width, height: width * 1.25 }}
          contentFit="cover"
        />

        {/* Action Buttons */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={handleLike} className="flex-row items-center gap-1">
              <Ionicons 
                name={isLiked ? 'heart' : 'heart-outline'} 
                size={26} 
                color={isLiked ? '#EF4444' : colors.text}
              />
              <Text className="font-semibold" style={{ color: colors.text }}>{likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/(post)/${id}/comments`)} className="flex-row items-center gap-1">
              <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
              <Text className="font-semibold" style={{ color: colors.text }}>{post.comments_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void handleShare()} accessibilityLabel="Partager la publication">
              <Ionicons name="paper-plane-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSave}>
            <Ionicons 
              name={isSaved ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View className="px-4 pb-3">
          <Text className="text-sm leading-5" style={{ color: colors.text }}>
            <Text className="font-semibold">{post.author.display_name} </Text>
            {post.caption}
          </Text>
          {post.place_tag && (
            <TouchableOpacity 
              onPress={() => router.push(`/(places)/${post.place_tag?.id}`)}
              className="flex-row items-center gap-1 mt-2"
            >
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{post.place_tag.name}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments Section */}
        <View className="px-4 pb-4">
          <Text className="font-semibold text-base mb-4" style={{ color: colors.text }}>
            Commentaires ({post.comments_count})
          </Text>

          {post.comments?.map((commentItem) => (
            <View key={commentItem.id} className="flex-row items-start gap-3 mb-4">
              <Image
                source={{ uri: commentItem.author.avatar_url || '' }}
                style={{ width: 32, height: 32 }}
                className="rounded-full"
              />
              <View className="flex-1">
                <View className="rounded-2xl px-3 py-2" style={{ backgroundColor: colors.elevated }}>
                  <View className="flex-row items-center gap-1 mb-1">
                    <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                      {commentItem.author.display_name}
                    </Text>
                    {commentItem.author.is_verified && (
                      <Ionicons name="checkmark-circle" size={12} color="#3B82F6" />
                    )}
                  </View>
                  <Text className="text-sm leading-5" style={{ color: colors.text }}>{commentItem.text}</Text>
                </View>
                <View className="flex-row items-center gap-4 mt-1 ml-3">
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>{commentItem.created_at}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Comment Input - Fixed at bottom */}
      <View className="absolute bottom-0 left-0 right-0 border-t px-4 py-3" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <View className="flex-row items-center gap-3">
          <Image
            source={{ uri: post.author.avatar_url || '' }}
            style={{ width: 32, height: 32 }}
            className="rounded-full"
          />
          <View className="flex-1 rounded-full px-4 py-2.5 flex-row items-center" style={{ backgroundColor: colors.elevated }}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor={colors.textMuted}
              className="flex-1 text-sm"
              style={{ color: colors.text }}
            />
            {comment.length > 0 && (
              <TouchableOpacity onPress={handleComment}>
                <Ionicons name="send" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
