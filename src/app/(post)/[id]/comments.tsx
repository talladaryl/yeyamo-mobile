import { useMemo, useRef } from 'react';
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

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['55%', '88%'], []);
  const { data: post, isLoading, refetch } = usePostDetail(id);
  const comments = useMemo(
    () =>
      (post?.comments ?? []).map((item) => ({
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
    [id, post?.comments],
  );

  const handleSubmitComment = async (text: string) => {
    try {
      await feedApi.addComment(id, text);
      await refetch();
    } catch (error) {
      Alert.alert(i18n.t('comments.sendErrorTitle'), i18n.t('comments.sendError'));
      throw error;
    }
  };

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.42} pressBehavior="close" />
  );

  return (
    <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => router.back()}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
        handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <View className="flex-1">
          <View className="flex-row items-center justify-between border-b px-4 pb-3" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>{i18n.t('comments.title')}</Text>
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
              <CommentInput onSubmit={handleSubmitComment} autoFocus />
            </>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}
