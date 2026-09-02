import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
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

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { user } = useAuth();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['62%', '90%'], []);
  const { data: post, isLoading, refetch } = usePostDetail(id);
  const comments = useMemo<Comment[]>(
    () => [
      ...(post?.comments ?? []).map((item) => ({
        id: item.id,
        post_id: id,
        user: item.author,
        content: item.text,
        likes_count: item.likes_count,
        replies_count: 0,
        is_liked: item.is_liked,
        parent_id: null,
        created_at: item.created_at,
      })),
      ...localComments,
    ],
    [id, localComments, post?.comments],
  );

  const handleSubmitComment = async (text: string) => {
    if (isDemo && user) {
      setLocalComments((current) => [...current, {
        id: `demo-comment-${Date.now()}`,
        post_id: id,
        user,
        content: text,
        likes_count: 0,
        replies_count: 0,
        is_liked: false,
        parent_id: null,
        created_at: new Date().toISOString(),
      }]);
      return;
    }
    try {
      await feedApi.addComment(id, text);
      await refetch();
    } catch (error) {
      Alert.alert(i18n.t('comments.sendErrorTitle'), i18n.t('comments.sendError'));
      throw error;
    }
  };

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.18} pressBehavior="close" />
  );

  const closeComments = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        onClose={closeComments}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
        handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <View className="flex-1">
          <View className="flex-row items-center border-b px-3 pb-3" style={{ borderColor: colors.border }}>
            <View className="w-11" />
            <View className="flex-1 flex-row items-center justify-center gap-1.5">
              <Text className="text-[15px] font-extrabold" style={{ color: colors.text }}>{post ? post.comments_count + localComments.length : comments.length} commentaires</Text>
              <Icon name="options-outline" size={16} color={colors.textSecondary} />
            </View>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} className="h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel={i18n.t('comments.close')}>
              <Icon library="ionicons" name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View>
          ) : (
            <>
              <BottomSheetFlatList
                data={comments}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <CommentItem comment={item} />}
                ItemSeparatorComponent={() => <View className="mx-4 h-px" style={{ backgroundColor: colors.border }} />}
                contentContainerStyle={{ paddingBottom: 12, flexGrow: comments.length === 0 ? 1 : undefined }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={<View className="flex-1 items-center justify-center px-6"><Text className="text-center" style={{ color: colors.textSecondary }}>{i18n.t('comments.empty')}</Text></View>}
              />
              <CommentInput onSubmit={handleSubmitComment} avatarUrl={user?.avatar_url} displayName={user?.display_name} />
            </>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}
