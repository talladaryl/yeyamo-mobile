import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CommentItem } from '@/components/comments/CommentItem';
import { CommentInput } from '@/components/comments/CommentInput';
import { Icon } from '@/components/ui/Icon';
import { feedApi } from '@/features/feed/feed.api';
import { usePostDetail } from '@/features/post/usePost';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
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
    } catch {
      Alert.alert('Envoi impossible', 'Le commentaire n’a pas pu être publié.');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View className="flex-1 justify-end bg-black/45">
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => router.back()} />

        <View
          className="h-[68%] overflow-hidden rounded-t-3xl border-t"
          style={{ backgroundColor: colors.background, borderColor: colors.border }}
        >
          <View className="items-center pb-2 pt-3">
            <View className="h-1.5 w-12 rounded-full bg-[#3F3F46]" />
          </View>

          <View
            className="flex-row items-center justify-between border-b px-4 pb-3"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Commentaires
            </Text>
            <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
              <Icon library="ionicons" name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <>
              <FlatList
                data={comments}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <CommentItem comment={item} />}
                ItemSeparatorComponent={() => (
                  <View className="mx-4 h-px" style={{ backgroundColor: colors.border }} />
                )}
                contentContainerStyle={{ paddingBottom: 12 }}
                keyboardShouldPersistTaps="handled"
              />
              <CommentInput onSubmit={handleSubmitComment} autoFocus />
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
