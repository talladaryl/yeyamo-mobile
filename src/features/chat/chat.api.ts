import { apiGet, apiPost } from '@/services/api/client';
import { fallbackUser, mediaContentUrl, toPaginatedResponse } from '@/services/api/contracts';
import type { EntityId, PaginatedResponse } from '@/types/api.types';
import type { ChatMessage, Conversation, SendMessagePayload } from './types';

interface BackendConversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  title: string | null;
  updatedAt: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
}

interface BackendConversationView extends BackendConversation {
  members: Array<{ userId: string }>;
}

export interface BackendMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'TEXT' | 'MEDIA' | 'MIXED' | 'SYSTEM';
  body: string | null;
  attachmentIds: string[];
  sentAt: string;
  deletedAt: string | null;
}

interface BackendMessageSlice {
  items: BackendMessage[];
  nextBefore: string | null;
  hasNext: boolean;
}

export function mapBackendMessage(message: BackendMessage): ChatMessage {
  return {
    id: message.id,
    conversation_id: message.conversationId,
    sender: fallbackUser(message.senderId),
    body: message.deletedAt ? 'Message supprimé' : message.body ?? '',
    message_type: message.type === 'SYSTEM' ? 'system' : 'text',
    type: message.type === 'TEXT' || message.type === 'SYSTEM' ? 'text' : 'file',
    media_url: null,
    attachments: message.attachmentIds.map((id) => ({
      id,
      type: 'file',
      name: `Pièce jointe ${id}`,
      url: mediaContentUrl(id),
      size: 0,
    })),
    read_at: null,
    created_at: message.sentAt,
  };
}

function mapConversation(conversation: BackendConversation): Conversation {
  const lastMessage: ChatMessage | null = conversation.lastMessageAt
    ? {
        id: `${conversation.id}-last`,
        conversation_id: conversation.id,
        sender: fallbackUser('unknown'),
        body: conversation.lastMessagePreview ?? '',
        message_type: 'text',
        type: 'text',
        media_url: null,
        attachments: [],
        read_at: null,
        created_at: conversation.lastMessageAt,
      }
    : null;
  return {
    id: conversation.id,
    type: conversation.type === 'GROUP' ? 'group' : 'user',
    is_pinned: false,
    participant: null,
    participants: [],
    group_name: conversation.title ?? undefined,
    last_message: lastMessage,
    unread_count: 0,
    updated_at: conversation.updatedAt,
  };
}

export const chatApi = {
  getConversations: async (): Promise<PaginatedResponse<Conversation>> => {
    const conversations = await apiGet<BackendConversation[]>('/messaging/conversations');
    return toPaginatedResponse(conversations.map(mapConversation), 0, Math.max(1, conversations.length));
  },

  getMessages: async (
    conversationId: EntityId,
    before?: string,
  ): Promise<PaginatedResponse<ChatMessage>> => {
    const query = new URLSearchParams({ limit: '50' });
    if (before) query.set('before', before);
    const response = await apiGet<BackendMessageSlice>(
      `/messaging/conversations/${conversationId}/messages?${query}`,
    );
    const result = toPaginatedResponse(
      response.items.map(mapBackendMessage),
      0,
      50,
      response.hasNext,
    );
    result.links.next = response.nextBefore;
    return result;
  },

  sendMessage: async (
    payload: SendMessagePayload,
  ): Promise<{ data: ChatMessage }> => {
    const message = await apiPost<BackendMessage>(
      `/messaging/conversations/${payload.conversation_id}/messages`,
      {
        clientMessageId: `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        type: payload.type === 'text' ? 'TEXT' : 'MEDIA',
        body: payload.body,
        attachmentIds: [],
        replyToMessageId: null,
      },
    );
    return { data: mapBackendMessage(message) };
  },

  markRead: async (conversationId: EntityId): Promise<void> => {
    const messages = await chatApi.getMessages(conversationId);
    const latest = messages.data[0];
    if (latest) {
      await apiPost<void>(
        `/messaging/conversations/${conversationId}/read/${latest.id}`,
      );
    }
  },

  createConversation: async (
    userId: EntityId,
  ): Promise<{ data: Conversation }> => {
    const conversation = await apiPost<BackendConversationView>(
      '/messaging/conversations',
      { type: 'DIRECT', title: null, participantIds: [String(userId)] },
    );
    return { data: mapConversation(conversation) };
  },

  contactPartner: async (partnerId: EntityId): Promise<{ data: Conversation }> => {
    const conversation = await apiPost<BackendConversation>(
      `/messaging/conversations/partner/${encodeURIComponent(String(partnerId))}`,
    );
    return { data: mapConversation(conversation) };
  },
};
