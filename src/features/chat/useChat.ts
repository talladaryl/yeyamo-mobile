import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ENV from '@/config/env';
import {
  MOCK_CONVERSATIONS,
  MOCK_USER,
  paginatedMessages,
} from '@/features/mock/mockData';
import { chatApi } from './chat.api';
import { chatSocket } from './chat.socket';
import { useChatStore } from './chat.store';
import type { PaginatedResponse } from '@/types/api.types';
import type { ChatMessage, Conversation, SendMessagePayload } from './types';

const EMPTY_MESSAGES: ChatMessage[] = [];

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () =>
      ENV.USE_MOCKS
        ? Promise.resolve({
            data: MOCK_CONVERSATIONS,
            meta: {
              current_page: 1,
              last_page: 1,
              per_page: MOCK_CONVERSATIONS.length,
              total: MOCK_CONVERSATIONS.length,
            },
            links: { first: null, last: null, prev: null, next: null },
          })
        : chatApi.getConversations(),
    select: (res) => res.data,
  });
}

export function useChatMessages(conversationId: number) {
  const realtimeMessages = useChatStore(
    (s) => s.messages[conversationId] ?? EMPTY_MESSAGES,
  );

  // Subscribe to Reverb channel
  useEffect(() => {
    const unsub = chatSocket.subscribeToConversation(conversationId);
    return unsub;
  }, [conversationId]);

  const query = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) =>
      ENV.USE_MOCKS
        ? Promise.resolve(paginatedMessages(conversationId))
        : chatApi.getMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: PaginatedResponse<ChatMessage>) =>
      last.links.next ? last.meta.current_page.toString() : undefined,
  });

  return { query, realtimeMessages };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessagePayload) => {
      if (ENV.USE_MOCKS) {
        const message: ChatMessage = {
          id: Date.now(),
          conversation_id: payload.conversation_id,
          sender: MOCK_USER,
          body: payload.body,
          message_type: 'text',
          type: payload.type ?? 'text',
          media_url: payload.media_url ?? null,
          attachments: [],
          read_at: null,
          created_at: new Date().toISOString(),
        };

        return Promise.resolve({
          data: message,
        });
      }

      return chatApi.sendMessage(payload);
    },
    onMutate: async (payload) => {
      if (!ENV.USE_MOCKS) return undefined;

      const optimisticMessage: ChatMessage = {
        id: Date.now(),
        conversation_id: payload.conversation_id,
        sender: MOCK_USER,
        body: payload.body,
        message_type: 'text',
        type: payload.type ?? 'text',
        media_url: payload.media_url ?? null,
        attachments: [],
        read_at: null,
        created_at: new Date().toISOString(),
      };

      useChatStore.getState().appendMessage(payload.conversation_id, optimisticMessage);
      return undefined;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.conversation_id],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) => ENV.USE_MOCKS ? Promise.resolve() : chatApi.markRead(conversationId),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      const previous = queryClient.getQueryData<PaginatedResponse<Conversation>>(['conversations']);
      queryClient.setQueryData<PaginatedResponse<Conversation>>(['conversations'], (current) => current ? ({
        ...current,
        data: current.data.map((conversation) => conversation.id === conversationId ? { ...conversation, unread_count: 0 } : conversation),
      }) : current);
      return { previous };
    },
    onError: (_error, _conversationId, context) => {
      if (context?.previous) queryClient.setQueryData(['conversations'], context.previous);
    },
  });
}
