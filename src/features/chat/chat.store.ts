import { create } from 'zustand';
import type { ChatMessage } from './types';

interface ChatState {
  // Map conversationId → messages (realtime buffer)
  messages: Record<number, ChatMessage[]>;
  appendMessage: (conversationId: number, message: ChatMessage) => void;
  prependMessages: (conversationId: number, messages: ChatMessage[]) => void;
  clearConversation: (conversationId: number) => void;
  preferences: Record<number, ConversationPreferences>;
  setConversationPreferences: (conversationId: number, preferences: Partial<ConversationPreferences>) => void;
}

export type ChatWallpaper = 'default' | 'sand' | 'ocean' | 'forest' | 'rose' | 'midnight';

export interface ConversationPreferences {
  notificationsEnabled: boolean;
  wallpaper: ChatWallpaper;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  preferences: {},

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

  setConversationPreferences: (conversationId, preferences) =>
    set((state) => {
      const current = state.preferences[conversationId] ?? {
        notificationsEnabled: true,
        wallpaper: 'default' as const,
      };
      return {
        preferences: {
          ...state.preferences,
          [conversationId]: { ...current, ...preferences },
        },
      };
    }),
}));
