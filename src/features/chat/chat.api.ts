import { apiGet, apiPost } from '@/services/api/client';
import type { PaginatedResponse } from '@/types/api.types';
import type { Conversation, ChatMessage, SendMessagePayload } from './types';

export const chatApi = {
  getConversations: () =>
    apiGet<PaginatedResponse<Conversation>>('/conversations'),

  getMessages: (conversationId: number, cursor?: string) =>
    apiGet<PaginatedResponse<ChatMessage>>(
      `/conversations/${conversationId}/messages${cursor ? `?cursor=${cursor}` : ''}`,
    ),

  sendMessage: (payload: SendMessagePayload) =>
    apiPost<{ data: ChatMessage }>('/messages', payload),

  markRead: (conversationId: number) =>
    apiPost<void>(`/conversations/${conversationId}/read`),

  createConversation: (userId: number) =>
    apiPost<{ data: Conversation }>('/conversations', { user_id: userId }),
};
