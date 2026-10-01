import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CommentItem } from '@/components/comments/CommentItem';
import { CommentInput } from '@/components/comments/CommentInput';
import { Icon } from '@/components/ui/Icon';
import { feedApi } from '@/features/feed/feed.api';
import { usePostDetail } from '@/features/post/usePost';
import { useThemeStore } from '@/features/theme/theme.store';
import { i18n } from '@/i18n';
import { useAuth } from '@/features/auth/useAuth';
import { useAuthStore } from '@/features/auth/auth.store';
import type { Comment } from '@/features/comments/types';
import { FEED_QUERY_KEY } from '@/features/feed/useFeed';
import { traceInteractionRuntime } from '@/features/social/social.runtime-trace';

type CommentReaction = Pick<Comment, 'likes_count' | 'is_liked'>;

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((state) => state.colors);
  const { user } = useAuth();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const queryClient = useQueryClient();
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [reactionOverrides, setReactionOverrides] = useState<Record<string, CommentReaction>>({});
  const { data: post, isLoading, isError, refetch } = usePostDetail(id);

  useEffect(() => {
    traceInteractionRuntime('COMMENT_OPEN', { flow: 'comment', postId: id, viewerId: user?.id ?? null });
  }, [id, user?.id]);

  const comments = useMemo<Comment[]>(() => {
    const serverComments = (post?.comments ?? []).map((item) => ({
      id: item.id,
      post_id: id,
      user: item.author,
      content: item.text,
      likes_count: reactionOverrides[String(item.id)]?.likes_count ?? item.likes_count,
      replies_count: 0,
      is_liked: reactionOverrides[String(item.id)]?.is_liked ?? item.is_liked,
      parent_id: item.parent_id ?? null,
      created_at: item.created_at,
    }));
    const serverIds = new Set(serverComments.map((comment) => String(comment.id)));
    return [...serverComments, ...localComments.filter((comment) => !serverIds.has(String(comment.id)))];
  }, [id, localComments, post?.comments, reactionOverrides]);

  const roots = useMemo(() => comments.filter((comment) => !comment.parent_id), [comments]);
  const repliesByParent = useMemo(() => comments.reduce<Record<string, Comment[]>>((result, comment) => {
    if (comment.parent_id) (result[String(comment.parent_id)] ??= []).push(comment);
    return result;
  }, {}), [comments]);

  const refreshComments = async () => {
    traceInteractionRuntime('COMMENT_REFETCH', { flow: 'comment', postId: id, viewerId: user?.id ?? null });
    await refetch();
    await queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY, refetchType: 'active' });
  };

  const handleSubmitComment = async (text: string) => {
    const parent = replyingTo;
    if (isDemo && user) {
      setLocalComments((current) => [...current, {
        id: `demo-comment-${Date.now()}`,
        post_id: id,
        user,
        content: text,
        likes_count: 0,
        replies_count: 0,
        is_liked: false,
        parent_id: parent?.id ?? null,
        created_at: new Date().toISOString(),
      }]);
      setReplyingTo(null);
      return;
    }
    try {
      const created = await feedApi.addComment(id, text, parent?.id ?? null);
      setLocalComments((current) => [...current, {
        id: created.id,
        post_id: id,
        user: created.author,
        content: created.text,
        likes_count: created.likes_count,
        replies_count: 0,
        is_liked: created.is_liked,
        parent_id: created.parent_id ?? null,
        created_at: created.created_at,
      }]);
      setReplyingTo(null);
      traceInteractionRuntime('COMMENT_CACHE_UPDATE', { flow: 'comment', postId: id, commentId: created.id, parentCommentId: parent?.id ?? null });
      await refreshComments();
    } catch (error) {
      Alert.alert(i18n.t('comments.sendErrorTitle'), i18n.t('comments.sendError'));
      throw error;
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    traceInteractionRuntime('COMMENT_REPLY_MODE', { flow: 'comment', postId: id, commentId: String(comment.id), parentCommentId: comment.parent_id ? String(comment.parent_id) : null });
  };

  const handleLike = async (comment: Comment) => {
    try {
      traceInteractionRuntime('COMMENT_LIKE_REQUEST', { flow: 'comment', postId: id, commentId: String(comment.id), viewerId: user?.id ?? null, beforeLiked: comment.is_liked });
      const response = comment.is_liked
        ? await feedApi.unlikeComment(comment.id)
        : await feedApi.likeComment(comment.id);
      setReactionOverrides((current) => ({ ...current, [String(comment.id)]: { likes_count: response.likeCount, is_liked: response.liked } }));
      traceInteractionRuntime('COMMENT_LIKE_RESPONSE', { flow: 'comment', postId: id, commentId: String(comment.id), status: 200, likeCount: response.likeCount });
      await refreshComments();
    } catch {
      Alert.alert('Réaction impossible', 'Votre réaction n’a pas pu être enregistrée.');
    }
  };

  const closeComments = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
    <Stack.Screen options={{ headerShown: false }} />
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <View className="flex-row items-center border-b px-3 py-2" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={closeComments} className="h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel={i18n.t('comments.close')}><Icon library="ionicons" name="chevron-back" size={25} color={colors.text} /></TouchableOpacity>
        <Text className="flex-1 text-center text-[16px] font-extrabold" style={{ color: colors.text }}>Commentaires</Text>
        <View className="w-11" />
      </View>
      {isLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : isError ? <View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.textSecondary }}>Impossible de charger les commentaires.</Text><TouchableOpacity onPress={() => void refreshComments()} className="mt-4"><Text className="font-bold" style={{ color: colors.primary }}>Réessayer</Text></TouchableOpacity></View> : <FlatList
        data={roots}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <View>
          <CommentItem comment={item} onReply={() => handleReply(item)} onLike={() => void handleLike(item)} />
          {(repliesByParent[String(item.id)] ?? []).map((reply) => <View key={String(reply.id)} className="ml-7 border-l" style={{ borderColor: colors.borderSoft }}><CommentItem comment={reply} onReply={() => handleReply(item)} onLike={() => void handleLike(reply)} /></View>)}
        </View>}
        ItemSeparatorComponent={() => <View className="mx-4 h-px" style={{ backgroundColor: colors.borderSoft }} />}
        contentContainerStyle={{ paddingBottom: 12, flexGrow: roots.length === 0 ? 1 : undefined }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="interactive"
        ListEmptyComponent={<View className="flex-1 items-center justify-center px-6"><Text className="text-center" style={{ color: colors.textSecondary }}>{i18n.t('comments.empty')}</Text></View>}
      />}
      <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
        <CommentInput onSubmit={handleSubmitComment} avatarUrl={user?.avatar_url} displayName={user?.display_name} replyTargetName={replyingTo?.user.display_name ?? null} onCancelReply={() => setReplyingTo(null)} />
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
