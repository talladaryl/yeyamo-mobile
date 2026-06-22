import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './chat.api';
import { chatSocket } from './chat.socket';
import { useChatStore } from './chat.store';
import type { PaginatedResponse } from '@/types/api.types';
import type { ChatMessage, SendMessagePayload } from './types';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
    select: (res) => res.data,
  });
}

export function useChatMessages(conversationId: number) {
  const realtimeMessages = useChatStore(
    (s) => s.messages[conversationId] ?? [],
  );

  // Subscribe to Reverb channel
  useEffect(() => {
    const unsub = chatSocket.subscribeToConversation(conversationId);
    return unsub;
  }, [conversationId]);

  const query = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) =>
      chatApi.getMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: PaginatedResponse<ChatMessage>) =>
      last.links.next ? last.meta.current_page.toString() : undefined,
  });

  return { query, realtimeMessages };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessagePayload) => chatApi.sendMessage(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.conversation_id],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
