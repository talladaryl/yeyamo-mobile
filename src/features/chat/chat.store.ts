import { create } from 'zustand';
import type { ChatMessage } from './types';

interface ChatState {
  // Map conversationId → messages (realtime buffer)
  messages: Record<number, ChatMessage[]>;
  appendMessage: (conversationId: number, message: ChatMessage) => void;
  prependMessages: (conversationId: number, messages: ChatMessage[]) => void;
  clearConversation: (conversationId: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},

  appendMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] ?? []),
          message,
        ],
      },
    })),

  prependMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...messages,
          ...(state.messages[conversationId] ?? []),
        ],
      },
    })),

  clearConversation: (conversationId) =>
    set((state) => {
      const next = { ...state.messages };
      delete next[conversationId];
      return { messages: next };
    }),
}));
