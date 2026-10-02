import { apiGet, apiPost, type YeyamoApiRequestConfig } from '@/services/api/client';
import { createIdempotencyKey, fallbackUser, mediaContentUrl, toPaginatedResponse } from '@/services/api/contracts';
import type { EntityId, PaginatedResponse, UserSummary } from '@/types/api.types';
import { socialApi, type ContentAuthorIdentity } from '@/features/social/social.api';
import { traceMessageRuntime } from '@/features/social/social.runtime-trace';
import type { ChatMessage, Conversation, MessageReply, SendMessagePayload } from './types';

interface BackendConversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  title: string | null;
  updatedAt: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  memberIds?: string[];
  unreadCount?: number;
}

interface BackendConversationView extends BackendConversation {
  members?: { userId: string }[];
}

type BackendConversationPayload = BackendConversation & {
  members?: { userId: string }[];
};

interface BackendReplyPreview {
  id: string;
  senderId: string;
  body: string | null;
  type: 'TEXT' | 'MEDIA' | 'MIXED' | 'SYSTEM';
  sentAt: string;
  deleted: boolean;
}

export interface BackendMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'TEXT' | 'MEDIA' | 'MIXED' | 'SYSTEM';
  body: string | null;
  attachmentIds: string[];
  replyToMessageId?: string | null;
  replyTo?: BackendReplyPreview | null;
  sentAt: string;
  deletedAt: string | null;
}

interface BackendMessageSlice {
  items: BackendMessage[];
  nextBefore: string | null;
  nextBeforeId: string | null;
  hasNext: boolean;
}

type IdentityByAuthId = Map<string, ContentAuthorIdentity>;

function messagingRequestConfig(correlationId: string, stage: string): YeyamoApiRequestConfig {
  return {
    headers: { 'X-Correlation-ID': correlationId },
    yeyamoTrace: { flow: 'messaging', stage },
  };
}

function messageType(type: BackendMessage['type']): ChatMessage['type'] {
  return type === 'TEXT' || type === 'SYSTEM' ? 'text' : 'file';
}

function userForAuthId(authUserId: string, identities: IdentityByAuthId): UserSummary {
  const identity = identities.get(authUserId);
  if (!identity) return fallbackUser(authUserId, 'Compte indisponible');
  return {
    ...fallbackUser(identity.authUserId, identity.displayName),
    avatar_url: identity.avatarUrl,
  };
}

function memberIds(conversation: BackendConversationPayload): string[] {
  return conversation.memberIds ?? conversation.members?.map((member) => member.userId) ?? [];
}

function mapReply(reply: BackendReplyPreview | null | undefined, identities: IdentityByAuthId): MessageReply | null {
  if (!reply) return null;
  return {
    id: reply.id,
    sender: userForAuthId(reply.senderId, identities),
    body: reply.deleted ? 'Message supprimé' : reply.body ?? '',
    type: messageType(reply.type),
    created_at: reply.sentAt,
    deleted: reply.deleted,
  };
}

export function mapBackendMessage(message: BackendMessage, identities: IdentityByAuthId = new Map()): ChatMessage {
  return {
    id: message.id,
    conversation_id: message.conversationId,
    sender: userForAuthId(message.senderId, identities),
    body: message.deletedAt ? 'Message supprimé' : message.body ?? '',
    message_type: message.type === 'SYSTEM' ? 'system' : 'text',
    type: messageType(message.type),
    media_url: null,
    attachments: message.attachmentIds.map((id) => ({
      id,
      type: 'file',
      name: `Pièce jointe ${id}`,
      url: mediaContentUrl(id),
      size: 0,
    })),
    reply_to: mapReply(message.replyTo, identities),
    read_at: null,
    created_at: message.sentAt,
  };
}

function mapConversation(
  conversation: BackendConversationPayload,
  viewerAuthUserId: string,
  identities: IdentityByAuthId,
): Conversation {
  const activeMemberIds = memberIds(conversation);
  const peerAuthUserId = activeMemberIds.find((memberId) => memberId !== viewerAuthUserId);
  const participants = activeMemberIds
    .filter((memberId) => memberId !== viewerAuthUserId)
    .map((memberId) => userForAuthId(memberId, identities));
  const participant = conversation.type === 'DIRECT'
    ? userForAuthId(peerAuthUserId ?? 'unavailable', identities)
    : null;
  const lastMessage: ChatMessage | null = conversation.lastMessageAt
    ? {
        id: `${conversation.id}-last`,
        conversation_id: conversation.id,
        sender: fallbackUser('system', 'Yeyamo'),
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
    participant,
    participants,
    group_name: conversation.title ?? undefined,
    last_message: lastMessage,
    unread_count: conversation.unreadCount ?? 0,
    updated_at: conversation.updatedAt,
  };
}

async function resolveIdentities(authUserIds: string[], context: string): Promise<IdentityByAuthId> {
  const requested = [...new Set(authUserIds.filter(Boolean))];
  if (!requested.length) return new Map();
  traceMessageRuntime('MESSAGE_PARTICIPANTS_REQUEST', { context, requestedCount: requested.length });
  try {
    const identities = await socialApi.resolveMessagingIdentities(requested);
    const byAuthId = new Map(identities.map((identity) => [identity.authUserId, identity]));
    traceMessageRuntime('MESSAGE_PARTICIPANTS_RESOLVED', {
      context,
      requestedCount: requested.length,
      resolvedCount: byAuthId.size,
      unresolvedCount: requested.length - byAuthId.size,
    });
    if (requested.length > byAuthId.size) {
      traceMessageRuntime('MESSAGE_PARTICIPANT_UNRESOLVED', {
        context,
        unresolvedCount: requested.length - byAuthId.size,
      });
    }
    return byAuthId;
  } catch {
    // A social profile lookup must not make already-authorized messaging unavailable.
    traceMessageRuntime('MESSAGE_PARTICIPANTS_ERROR', { context, requestedCount: requested.length });
    return new Map();
  }
}

export const chatApi = {
  getConversations: async (viewerAuthUserId: string): Promise<PaginatedResponse<Conversation>> => {
    traceMessageRuntime('MESSAGE_INBOX_REQUEST', { viewerId: viewerAuthUserId });
    const conversations = await apiGet<BackendConversation[]>('/messaging/conversations');
    const identities = await resolveIdentities(
      conversations.flatMap((conversation) => memberIds(conversation).filter((memberId) => memberId !== viewerAuthUserId)),
      'inbox',
    );
    const mapped = conversations.map((conversation) => mapConversation(conversation, viewerAuthUserId, identities));
    traceMessageRuntime('MESSAGE_INBOX_RESPONSE', { viewerId: viewerAuthUserId, conversationCount: mapped.length });
    return toPaginatedResponse(mapped, 0, Math.max(1, mapped.length));
  },

  getMessages: async (
    conversationId: EntityId,
    before?: string,
  ): Promise<PaginatedResponse<ChatMessage>> => {
    const query = new URLSearchParams({ limit: '50' });
    if (before) {
      const [beforeTimestamp, beforeId] = before.split('|', 2);
      query.set('before', beforeTimestamp);
      if (beforeId) query.set('beforeId', beforeId);
    }
    traceMessageRuntime('MESSAGE_HISTORY_REQUEST', { conversationId: String(conversationId), hasCursor: Boolean(before) });
    const response = await apiGet<BackendMessageSlice>(
      `/messaging/conversations/${conversationId}/messages?${query}`,
    );
    const identities = await resolveIdentities(
      response.items.flatMap((message) => [message.senderId, message.replyTo?.senderId ?? '']),
      'history',
    );
    const result = toPaginatedResponse(
      response.items.map((message) => mapBackendMessage(message, identities)),
      0,
      50,
      response.hasNext,
    );
    result.links.next = response.nextBefore
      ? `${response.nextBefore}${response.nextBeforeId ? `|${response.nextBeforeId}` : ''}`
      : null;
    traceMessageRuntime('MESSAGE_HISTORY_RESPONSE', {
      conversationId: String(conversationId),
      messageCount: result.data.length,
      hasNext: response.hasNext,
    });
    return result;
  },

  getOutingGroup: async (outingId: EntityId, viewerAuthUserId: string): Promise<{ data: Conversation }> => {
    const correlationId = createIdempotencyKey();
    traceMessageRuntime('OUTING_GROUP_RESOLVE_REQUEST', { outingId: String(outingId), viewerAuthUserId, correlationId });
    const conversation = await apiGet<BackendConversationView>(
      `/messaging/outings/${encodeURIComponent(String(outingId))}/group`,
      messagingRequestConfig(correlationId, 'OUTING_GROUP_RESOLVE'),
    );
    const identities = await resolveIdentities(memberIds(conversation), 'outing-group');
    const mapped = mapConversation(conversation, viewerAuthUserId, identities);
    traceMessageRuntime('OUTING_GROUP_RESOLVE_RESPONSE', { outingId: String(outingId), conversationId: String(mapped.id), correlationId });
    return { data: mapped };
  },

  sendMessage: async (payload: SendMessagePayload): Promise<{ data: ChatMessage }> => {
    const correlationId = createIdempotencyKey();
    // The caller may retain this key while retrying an ambiguous network
    // response, allowing the backend idempotency table to return the first send.
    const clientMessageId = payload.client_message_id ?? createIdempotencyKey();
    traceMessageRuntime('MESSAGE_SEND_REQUEST', {
      conversationId: String(payload.conversation_id),
      hasReply: Boolean(payload.reply_to_message_id),
      type: payload.type ?? 'text',
      correlationId,
    });
    const message = await apiPost<BackendMessage>(
      `/messaging/conversations/${payload.conversation_id}/messages`,
      {
        clientMessageId,
        type: (payload.type ?? 'text') === 'text' ? 'TEXT' : 'MEDIA',
        body: payload.body,
        attachmentIds: [],
        replyToMessageId: payload.reply_to_message_id ?? null,
      },
      messagingRequestConfig(correlationId, 'MESSAGE_SEND'),
    );
    traceMessageRuntime('MESSAGE_SEND_RESPONSE', {
      conversationId: String(payload.conversation_id),
      messageId: message.id,
      hasReply: Boolean(message.replyToMessageId),
      correlationId,
    });
    return { data: mapBackendMessage(message) };
  },

  markRead: async (conversationId: EntityId, messageId: EntityId): Promise<void> => {
    traceMessageRuntime('MESSAGE_MARK_READ_REQUEST', { conversationId: String(conversationId), messageId: String(messageId) });
    await apiPost<void>(`/messaging/conversations/${conversationId}/read/${messageId}`);
    traceMessageRuntime('MESSAGE_MARK_READ_RESPONSE', { conversationId: String(conversationId), messageId: String(messageId) });
  },

  createConversation: async (recipientAuthUserId: string, viewerAuthUserId: string): Promise<{ data: Conversation }> => {
    traceMessageRuntime('MESSAGE_DIRECT_RESOLVE_REQUEST', { recipientAuthUserId });
    const conversation = await apiPost<BackendConversationView>(
      '/messaging/conversations',
      { type: 'DIRECT', title: null, participantIds: [recipientAuthUserId] },
    );
    const identities = await resolveIdentities([recipientAuthUserId], 'direct-create');
    const mapped = mapConversation(conversation, viewerAuthUserId, identities);
    traceMessageRuntime('MESSAGE_DIRECT_RESOLVE_RESPONSE', { conversationId: String(mapped.id), recipientAuthUserId });
    return { data: mapped };
  },

  contactPartner: async (partnerId: EntityId, viewerAuthUserId: string): Promise<{ data: Conversation }> => {
    const conversation = await apiPost<BackendConversationView>(
      `/messaging/conversations/partner/${encodeURIComponent(String(partnerId))}`,
    );
    return { data: mapConversation(conversation, viewerAuthUserId, new Map()) };
  },
};
