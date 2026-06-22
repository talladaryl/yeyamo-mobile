import type { UserSummary } from '@/types/api.types';

export interface Conversation {
  id: number;
  type: 'user' | 'partner';
  participant: UserSummary;
  last_message: ChatMessage | null;
  unread_count: number;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender: UserSummary;
  body: string;
  type: 'text' | 'image' | 'video';
  media_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface SendMessagePayload {
  conversation_id: number;
  body: string;
  type?: ChatMessage['type'];
  media_url?: string;
}
