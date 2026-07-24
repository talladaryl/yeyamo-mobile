import { create } from 'zustand';
import type { ChatMessage } from './types';
import type { EntityId } from '@/types/api.types';

interface ChatState {
  // Map conversationId → messages (realtime buffer)
  messages: Record<string, ChatMessage[]>;
  appendMessage: (conversationId: EntityId, message: ChatMessage) => void;
  prependMessages: (conversationId: EntityId, messages: ChatMessage[]) => void;
  clearConversation: (conversationId: EntityId) => void;
  preferences: Record<string, ConversationPreferences>;
  setConversationPreferences: (conversationId: EntityId, preferences: Partial<ConversationPreferences>) => void;
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
        [String(conversationId)]: [
          ...(state.messages[String(conversationId)] ?? []),
          message,
        ],
      },
    })),

  prependMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [String(conversationId)]: [
          ...messages,
          ...(state.messages[String(conversationId)] ?? []),
        ],
      },
    })),

  clearConversation: (conversationId) =>
    set((state) => {
      const next = { ...state.messages };
      delete next[String(conversationId)];
      return { messages: next };
    }),

  setConversationPreferences: (conversationId, preferences) =>
    set((state) => {
      const current = state.preferences[String(conversationId)] ?? {
        notificationsEnabled: true,
        wallpaper: 'default' as const,
      };
      return {
        preferences: {
          ...state.preferences,
          [String(conversationId)]: { ...current, ...preferences },
        },
      };
    }),
}));
