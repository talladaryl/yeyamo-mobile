import { useEffect } from 'react';
import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { traceMessageRuntime } from '@/features/social/social.runtime-trace';
import {
  MOCK_CONVERSATIONS,
  MOCK_USER,
  paginatedMessages,
} from '@/features/mock/mockData';
import { chatApi } from './chat.api';
import { chatSocket } from './chat.socket';
import { useChatStore } from './chat.store';
import type { PaginatedResponse, EntityId } from '@/types/api.types';
import type { ChatMessage, Conversation, SendMessagePayload } from './types';

const EMPTY_MESSAGES: ChatMessage[] = [];

type ChatMode = 'demo' | 'backend';

export const chatKeys = {
  inbox: (mode: ChatMode, viewerId: string) => ['messaging', mode, viewerId, 'conversations'] as const,
  outingGroup: (mode: ChatMode, viewerId: string, outingId: EntityId) =>
    ['messaging', mode, viewerId, 'outing', String(outingId), 'group'] as const,
  messages: (mode: ChatMode, viewerId: string, conversationId: EntityId) =>
    ['messaging', mode, viewerId, 'conversation', String(conversationId), 'messages'] as const,
};

function useChatSession() {
  const sessionMode = useAuthStore((state) => state.sessionMode);
  const user = useAuthStore((state) => state.user);
  const mode: ChatMode = sessionMode?.startsWith('demo-') ? 'demo' : 'backend';
  return { mode, viewerId: user ? String(user.id) : '' };
}

export function useConversations() {
  const { mode, viewerId } = useChatSession();
  const isDemo = mode === 'demo';
  return useQuery({
    queryKey: chatKeys.inbox(mode, viewerId),
    enabled: isDemo || Boolean(viewerId),
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
        : chatApi.getConversations(viewerId),
    select: (res) => res.data,
  });
}

/** Reads the durable outing-to-group association only for an authenticated
 * participant. A 403 is deliberately not retried or converted into a group. */
export function useOutingGroup(outingId: EntityId, enabled = true) {
  const { mode, viewerId } = useChatSession();
  const isDemo = mode === 'demo';
  return useQuery({
    queryKey: chatKeys.outingGroup(mode, viewerId, outingId),
    enabled: enabled && (isDemo || Boolean(viewerId)) && Boolean(outingId),
    queryFn: () => isDemo
      ? Promise.resolve(MOCK_CONVERSATIONS.find((conversation) => conversation.type === 'group') ?? MOCK_CONVERSATIONS[0])
      : chatApi.getOutingGroup(outingId, viewerId).then((result) => result.data),
    retry: (failureCount, error) => {
      const status = (error as { status?: number } | null)?.status;
      return status !== 403 && failureCount < 3;
    },
  });
}

/** Lazy resolver for a Feed CTA. It does no work while cards scroll and keeps
 * the inbox coherent before navigation enters the existing chat route. */
export function useResolveOutingGroup() {
  const queryClient = useQueryClient();
  const { mode, viewerId } = useChatSession();
  const isDemo = mode === 'demo';
  return useMutation({
    mutationFn: (outingId: EntityId) => isDemo
      ? Promise.resolve(MOCK_CONVERSATIONS.find((conversation) => conversation.type === 'group') ?? MOCK_CONVERSATIONS[0])
      : chatApi.getOutingGroup(outingId, viewerId).then((result) => result.data),
    onSuccess: (conversation, outingId) => {
      queryClient.setQueryData(chatKeys.outingGroup(mode, viewerId, outingId), conversation);
      void queryClient.invalidateQueries({ queryKey: chatKeys.inbox(mode, viewerId) });
    },
  });
}

export function useChatMessages(conversationId: EntityId) {
  const queryClient = useQueryClient();
  const { mode, viewerId } = useChatSession();
  const isDemo = mode === 'demo';
  const realtimeMessages = useChatStore(
    (s) => s.messages[String(conversationId)] ?? EMPTY_MESSAGES,
  );
  const latestRealtimeMessageId = realtimeMessages[realtimeMessages.length - 1]?.id;
  const queryKey = chatKeys.messages(mode, viewerId, conversationId);

  useEffect(() => {
    const unsubscribe = chatSocket.subscribeToConversation(conversationId);
    return unsubscribe;
  }, [conversationId]);

  // Socket payloads intentionally carry only messaging data. Re-fetching the
  // active history resolves sender profiles in one batch and reconciles edits.
  useEffect(() => {
    if (!latestRealtimeMessageId || isDemo) return;
    traceMessageRuntime('MESSAGE_REALTIME_RECONCILE_REQUEST', {
      conversationId: String(conversationId),
      messageId: String(latestRealtimeMessageId),
    });
    traceMessageRuntime('MESSAGE_CACHE_INVALIDATE', {
      conversationId: String(conversationId),
      reason: 'realtime-message',
    });
    traceMessageRuntime('MESSAGE_REFETCH', {
      conversationId: String(conversationId),
      reason: 'realtime-message',
    });
    void queryClient.invalidateQueries({ queryKey: chatKeys.messages(mode, viewerId, conversationId) });
  }, [conversationId, isDemo, latestRealtimeMessageId, mode, queryClient, viewerId]);

  const query = useInfiniteQuery({
    queryKey,
    enabled: isDemo || Boolean(viewerId),
    queryFn: ({ pageParam }) =>
      isDemo
        ? Promise.resolve(paginatedMessages(Number(conversationId)))
        : chatApi.getMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: PaginatedResponse<ChatMessage>) => last.links.next ?? undefined,
  });

  return { query, realtimeMessages };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { mode, viewerId } = useChatSession();
  const isDemo = mode === 'demo';
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
        return Promise.resolve({ data: message });
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
      traceMessageRuntime('MESSAGE_OPTIMISTIC_INSERT', {
        conversationId: String(payload.conversation_id),
        status: 'demo-only',
      });
      return undefined;
    },
    onSuccess: (result, payload) => {
      const messageKey = chatKeys.messages(mode, viewerId, payload.conversation_id);
      if (!isDemo) {
        useChatStore.getState().appendMessage(payload.conversation_id, result.data);
        queryClient.setQueryData<InfiniteData<PaginatedResponse<ChatMessage>>>(messageKey, (current) => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map((page, index) => index === 0
              ? { ...page, data: [result.data, ...page.data.filter((message) => String(message.id) !== String(result.data.id))] }
              : page),
          };
        });
        traceMessageRuntime('MESSAGE_SERVER_RECONCILED', {
          conversationId: String(payload.conversation_id),
          messageId: String(result.data.id),
        });
      }
      void queryClient.invalidateQueries({ queryKey: messageKey });
      void queryClient.invalidateQueries({ queryKey: chatKeys.inbox(mode, viewerId) });
      traceMessageRuntime('MESSAGE_CACHE_INVALIDATE', {
        conversationId: String(payload.conversation_id),
        reason: 'server-confirmed-send',
      });
    },
    onError: (_error, payload) => {
      traceMessageRuntime('MESSAGE_SEND_ERROR', { conversationId: String(payload.conversation_id) });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  const { mode, viewerId } = useChatSession();
  const isDemo = mode === 'demo';
  const inboxKey = chatKeys.inbox(mode, viewerId);
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: EntityId; messageId: EntityId }) =>
      isDemo ? Promise.resolve() : chatApi.markRead(conversationId, messageId),
    onMutate: async ({ conversationId }) => {
      await queryClient.cancelQueries({ queryKey: inboxKey });
      const previous = queryClient.getQueryData<PaginatedResponse<Conversation>>(inboxKey);
      queryClient.setQueryData<PaginatedResponse<Conversation>>(inboxKey, (current) => current ? ({
        ...current,
        data: current.data.map((conversation) => String(conversation.id) === String(conversationId)
          ? { ...conversation, unread_count: 0 }
          : conversation),
      }) : current);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(inboxKey, context.previous);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inboxKey });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { mode, viewerId } = useChatSession();
  const isDemo = mode === 'demo';
  return useMutation({
    mutationFn: (recipientAuthUserId: string) => {
      if (!isDemo && !viewerId) throw new Error('AUTHENTICATION_REQUIRED');
      if (!isDemo && recipientAuthUserId === viewerId) throw new Error('SELF_CONVERSATION_FORBIDDEN');
      return isDemo
        ? Promise.resolve({ data: MOCK_CONVERSATIONS[0] })
        : chatApi.createConversation(recipientAuthUserId, viewerId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.inbox(mode, viewerId) });
    },
  });
}

export function useContactPartner() {
  const queryClient = useQueryClient();
  const { mode, viewerId } = useChatSession();
  const isDemo = mode === 'demo';
  return useMutation({
    mutationFn: (partnerId: EntityId) => {
      if (!isDemo && !viewerId) throw new Error('AUTHENTICATION_REQUIRED');
      return isDemo
        ? Promise.resolve({ data: MOCK_CONVERSATIONS[0] })
        : chatApi.contactPartner(partnerId, viewerId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.inbox(mode, viewerId) });
    },
  });
}
