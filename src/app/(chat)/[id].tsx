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
import { Icon } from '@/components/ui/Icon';
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

  const isGroup = conversation?.type === 'group';
  const displayName = isGroup ? conversation?.group_name : conversation?.participant?.display_name;
  const avatarUrl = isGroup ? conversation?.participants[0]?.avatar_url : conversation?.participant?.avatar_url ?? null;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: () =>
            conversation ? (
              <TouchableOpacity
                onPress={() => router.push(`/(chat)/info/${conversationId}`)}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                {isGroup && conversation.participants.length > 1 ? (
                  <View className="relative w-8 h-8">
                    <Avatar
                      uri={conversation.participants[0]?.avatar_url}
                      displayName={conversation.participants[0]?.display_name}
                      size={24}
                      className="absolute top-0 left-0"
                    />
                    <Avatar
                      uri={conversation.participants[1]?.avatar_url}
                      displayName={conversation.participants[1]?.display_name}
                      size={24}
                      className="absolute bottom-0 right-0"
                    />
                  </View>
                ) : (
                  <Avatar
                    uri={avatarUrl}
                    displayName={displayName || ''}
                    size={32}
                  />
                )}
                <View>
                  <Text className="text-white font-semibold text-sm">
                    {displayName}
                  </Text>
                  {isGroup && (
                    <Text className="text-[#A1A1AA] text-xs">
                      {conversation.participants.length} participants
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ) : null,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pr-4">
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row gap-4">
              <TouchableOpacity>
                <Icon library="ionicons" name="call-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push(`/(chat)/info/${conversationId}`)}>
                <Icon library="ionicons" name="ellipsis-vertical" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
            <ActivityIndicator color="#EF4444" />
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

        {/* Composer with 5 icons */}
        <View className="flex-row items-center gap-2 px-4 py-3 border-t border-[#27272A] bg-[#0A0A0A]">
          <TouchableOpacity className="w-9 h-9 items-center justify-center">
            <Icon library="ionicons" name="add-circle-outline" size={26} color="#A1A1AA" />
          </TouchableOpacity>
          
          <TouchableOpacity className="w-9 h-9 items-center justify-center">
            <Icon library="ionicons" name="camera-outline" size={24} color="#A1A1AA" />
          </TouchableOpacity>
          
          <TouchableOpacity className="w-9 h-9 items-center justify-center">
            <Icon library="ionicons" name="document-outline" size={22} color="#A1A1AA" />
          </TouchableOpacity>
          
          <TextInput
            className="flex-1 bg-[#1F1F1F] text-white rounded-full px-4 py-2.5 text-sm border border-[#27272A]"
            placeholder="Écrivez un message..."
            placeholderTextColor="#52525B"
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          
          <TouchableOpacity className="w-9 h-9 items-center justify-center">
            <Icon library="ionicons" name="mic-outline" size={24} color="#A1A1AA" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSend}
            disabled={!draft.trim() || isSending}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              draft.trim() ? 'bg-[#EF4444]' : 'bg-[#27272A]'
            }`}
            activeOpacity={0.7}
          >
            <Icon 
              library="ionicons" 
              name="send" 
              size={18} 
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
