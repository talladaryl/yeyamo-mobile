import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { CommentItem } from '@/components/comments/CommentItem';
import { CommentInput } from '@/components/comments/CommentInput';
import { Icon } from '@/components/ui/Icon';

const initialComments = [
  {
    id: 1,
    post_id: 1,
    user: {
      id: 2,
      username: 'syfax_djamel',
      display_name: 'Syfax Djamel',
      avatar_url: null,
      is_verified: true,
    },
    content: 'Magnifique vidéo !',
    likes_count: 12,
    replies_count: 2,
    is_liked: false,
    parent_id: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    post_id: 1,
    user: {
      id: 3,
      username: 'vanessa_feuguia',
      display_name: 'Vanessa Feuguia',
      avatar_url: null,
      is_verified: false,
    },
    content: "J'y étais la semaine dernière, c'était incroyable",
    likes_count: 5,
    replies_count: 0,
    is_liked: true,
    parent_id: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    post_id: 1,
    user: {
      id: 4,
      username: 'julie_koki',
      display_name: 'Julie Koki',
      avatar_url: null,
      is_verified: false,
    },
    content: "Quelqu'un peut me dire où c'est exactement ?",
    likes_count: 0,
    replies_count: 1,
    is_liked: false,
    parent_id: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const postId = Number(id);
  const [comments, setComments] = useState(initialComments);
  const isLoading = false;

  const handleSubmitComment = (text: string) => {
    setComments((current) => [
      {
        id: Date.now(),
        post_id: postId,
        user: {
          id: 1,
          username: 'daryl_demo',
          display_name: 'Daryl Demo',
          avatar_url: null,
          is_verified: true,
        },
        content: text,
        likes_count: 0,
        replies_count: 0,
        is_liked: false,
        parent_id: null,
        created_at: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  return (
    <View className="flex-1 bg-black/45 justify-end">
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => router.back()} />

      <View className="h-[58%] bg-[#0A0A0A] rounded-t-3xl overflow-hidden border-t border-[#27272A]">
        <View className="items-center pt-3 pb-2">
          <View className="w-12 h-1.5 rounded-full bg-[#3F3F46]" />
        </View>

        <View className="px-4 pb-3 flex-row items-center justify-between border-b border-[#27272A]">
          <Text className="text-white text-lg font-bold">Commentaires</Text>
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
            <Icon library="ionicons" name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#EF4444" />
          </View>
        ) : (
          <>
            <FlatList
              data={comments}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <CommentItem
                  comment={item}
                  onReply={() => undefined}
                  onLike={() =>
                    setComments((current) =>
                      current.map((comment) =>
                        comment.id === item.id
                          ? {
                              ...comment,
                              is_liked: !comment.is_liked,
                              likes_count: comment.is_liked
                                ? Math.max(comment.likes_count - 1, 0)
                                : comment.likes_count + 1,
                            }
                          : comment,
                      ),
                    )
                  }
                  onShowReplies={() => undefined}
                />
              )}
              ItemSeparatorComponent={() => <View className="h-px bg-[#27272A] mx-4" />}
              contentContainerStyle={{ paddingBottom: 12 }}
              keyboardShouldPersistTaps="handled"
            />

            <CommentInput onSubmit={handleSubmitComment} autoFocus />
          </>
        )}
      </View>
    </View>
  );
}
