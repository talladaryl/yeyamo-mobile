import { reverbClient } from '@/services/socket/reverb.client';
import { useChatStore } from './chat.store';
import type { ChatMessage } from './types';

const CHAT_EVENT = 'MessageSent';

export const chatSocket = {
  /**
   * Subscribe to a private conversation channel.
   * Returns an unsubscribe function — call it on cleanup.
   */
  subscribeToConversation(conversationId: number): () => void {
    const channel = `private-conversation.${conversationId}`;

    return reverbClient.subscribe(channel, (event, data) => {
      if (event === CHAT_EVENT) {
        const message = data as ChatMessage;
        useChatStore.getState().appendMessage(conversationId, message);
      }
    });
  },

  /**
   * Subscribe to the user's own notification channel (new convos, etc.)
   */
  subscribeToUser(userId: number): () => void {
    const channel = `private-user.${userId}`;
    // Extend event handling here as needed
    return reverbClient.subscribe(channel, () => {});
  },
};
