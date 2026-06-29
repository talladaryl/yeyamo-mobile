import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { CommentItem } from '@/components/comments/CommentItem';
import { CommentInput } from '@/components/comments/CommentInput';
import { Icon } from '@/components/ui/Icon';

// Mock data - replace with real API
const mockComments = [
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
    content: 'J\'y étais la semaine dernière, c\'était incroyable 😍',
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
    content: 'Quelqu\'un peut me dire où c\'est exactement ? 🙏',
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

  const isLoading = false;
  const comments = mockComments;

  const handleSubmitComment = (text: string) => {
    console.log('Submit comment:', text);
    // TODO: API call to post comment
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Commentaires',
          headerTitleAlign: 'center',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} className="pr-4">
              <Icon library="ionicons" name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

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
                onReply={() => console.log('Reply to', item.id)}
                onLike={() => console.log('Like comment', item.id)}
                onShowReplies={() => console.log('Show replies', item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View className="h-px bg-[#27272A] mx-4" />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <CommentInput onSubmit={handleSubmitComment} />
        </>
      )}
    </SafeAreaView>
  );
}
