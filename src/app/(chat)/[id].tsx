import { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Avatar } from '@/components/ui/Avatar';
import { useChatMessages, useConversations, useSendMessage } from '@/features/chat/useChat';
import { useAuthStore } from '@/features/auth/auth.store';
import type { ChatMessage } from '@/features/chat/types';
import { useState } from 'react';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const conversationId = Number(id);
  const currentUser = useAuthStore((s) => s.user);

  const { data: conversations } = useConversations();
  const conversation = conversations?.find((c) => c.id === conversationId);

  const { query, realtimeMessages } = useChatMessages(conversationId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Merge paginated + realtime messages, deduplicated by id
  const allMessages = useMemo<ChatMessage[]>(() => {
    const paged = query.data?.pages.flatMap((p) => p.data) ?? [];
    const seen = new Set(paged.map((m) => m.id));
    const fresh = realtimeMessages.filter((m) => !seen.has(m.id));
    return [...paged, ...fresh].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [query.data, realtimeMessages]);

  const handleSend = useCallback(() => {
    const body = draft.trim();
    if (!body || isSending) return;
    setDraft('');
    sendMessage({ conversation_id: conversationId, body });
    // Scroll to bottom after send
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [draft, conversationId, sendMessage, isSending]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        message={item}
        isOwnMessage={item.sender.id === currentUser?.id}
      />
    ),
    [currentUser?.id],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: () =>
            conversation ? (
              <View className="flex-row items-center gap-2">
                <Avatar
                  uri={conversation.participant.avatar_url}
                  displayName={conversation.participant.display_name}
                  size={32}
                />
                <Text className="text-white font-semibold text-sm">
                  {conversation.participant.display_name}
                </Text>
              </View>
            ) : null,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pr-4">
              <Text className="text-white text-base">←</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Message list */}
        {query.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#7C3AED" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={allMessages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerClassName="px-4 py-3"
            onEndReached={() => {
              if (query.hasNextPage) query.fetchNextPage();
            }}
            onEndReachedThreshold={0.1}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            removeClippedSubviews
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        )}

        {/* Composer */}
        <View className="flex-row items-center gap-2 px-4 py-3 border-t border-[#27272A] bg-[#0A0A0A]">
          <TextInput
            className="flex-1 bg-[#1F1F1F] text-white rounded-full px-4 py-2.5 text-sm border border-[#27272A]"
            placeholder="Message..."
            placeholderTextColor="#52525B"
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!draft.trim() || isSending}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              draft.trim() ? 'bg-[#7C3AED]' : 'bg-[#27272A]'
            }`}
            activeOpacity={0.7}
          >
            <Text className="text-white text-base">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
