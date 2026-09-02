import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import {
  MOCK_CONVERSATIONS,
  MOCK_USER,
  paginatedMessages,
} from '@/features/mock/mockData';
import { chatApi } from './chat.api';
import { chatSocket } from './chat.socket';
import { useChatStore } from './chat.store';
import type { PaginatedResponse } from '@/types/api.types';
import type { EntityId } from '@/types/api.types';
import type { ChatMessage, Conversation, SendMessagePayload } from './types';

const EMPTY_MESSAGES: ChatMessage[] = [];

export function useConversations() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['conversations', isDemo ? 'demo' : 'backend'],
    queryFn: () =>
      isDemo
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

export function useChatMessages(conversationId: EntityId) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const realtimeMessages = useChatStore(
    (s) => s.messages[String(conversationId)] ?? EMPTY_MESSAGES,
  );

  // Subscribe to Reverb channel
  useEffect(() => {
    const unsub = chatSocket.subscribeToConversation(conversationId);
    return unsub;
  }, [conversationId]);

  const query = useInfiniteQuery({
    queryKey: ['messages', isDemo ? 'demo' : 'backend', conversationId],
    queryFn: ({ pageParam }) =>
      isDemo
        ? Promise.resolve(paginatedMessages(Number(conversationId)))
        : chatApi.getMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: PaginatedResponse<ChatMessage>) =>
      last.links.next ? last.meta.current_page.toString() : undefined,
  });

  return { query, realtimeMessages };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (payload: SendMessagePayload) => {
      if (isDemo) {
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
      if (!isDemo) return undefined;

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
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (conversationId: EntityId) => isDemo ? Promise.resolve() : chatApi.markRead(conversationId),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      const previous = queryClient.getQueryData<PaginatedResponse<Conversation>>(['conversations']);
      queryClient.setQueryData<PaginatedResponse<Conversation>>(['conversations'], (current) => current ? ({
        ...current,
        data: current.data.map((conversation) => String(conversation.id) === String(conversationId) ? { ...conversation, unread_count: 0 } : conversation),
      }) : current);
      return { previous };
    },
    onError: (_error, _conversationId, context) => {
      if (context?.previous) queryClient.setQueryData(['conversations'], context.previous);
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (userId: EntityId) => isDemo
      ? Promise.resolve({ data: MOCK_CONVERSATIONS[0] })
      : chatApi.createConversation(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
