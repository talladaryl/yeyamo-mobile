import { reverbClient } from '@/services/socket/reverb.client';
import { useChatStore } from './chat.store';
import type { EntityId } from '@/types/api.types';
import { mapBackendMessage, type BackendMessage } from './chat.api';

const CHAT_EVENTS = new Set([
  'messaging.message.sent',
  'messaging.message.edited',
  'messaging.message.deleted',
  'messaging.message.read',
]);

export const chatSocket = {
  /**
   * Subscribe to a private conversation channel.
   * Returns an unsubscribe function — call it on cleanup.
   */
  subscribeToConversation(conversationId: EntityId): () => void {
    const channel = `conversation.${conversationId}`;

    return reverbClient.subscribe(channel, (event, data) => {
      if (CHAT_EVENTS.has(event)) {
        const payload = data as BackendMessage;
        const eventConversationId = payload.conversationId;
        if (String(eventConversationId) === String(conversationId) && event === 'messaging.message.sent') {
          useChatStore.getState().appendMessage(conversationId, mapBackendMessage(payload));
        }
      }
    });
  },

  /**
   * Subscribe to the user's own notification channel (new convos, etc.)
   */
  subscribeToUser(userId: EntityId): () => void {
    const channel = `user.${userId}`;
    // Extend event handling here as needed
    return reverbClient.subscribe(channel, () => {});
  },
};
