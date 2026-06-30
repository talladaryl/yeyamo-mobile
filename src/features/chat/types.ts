import type { UserSummary } from '@/types/api.types';

export interface Conversation {
  id: number;
  type: 'user' | 'partner' | 'group';
  is_pinned: boolean;
  participant: UserSummary | null; // null for groups
  participants: UserSummary[]; // for groups
  group_name?: string;
  last_message: ChatMessage | null;
  unread_count: number;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender: UserSummary;
  body: string;
  message_type: 'text' | 'system' | 'event';
  type: 'text' | 'image' | 'video' | 'file';
  media_url: string | null;
  attachments: Attachment[];
  event_data?: EventData;
  read_at: string | null;
  created_at: string;
}

export interface Attachment {
  id: number;
  type: 'pdf' | 'image' | 'video' | 'file';
  name: string;
  url: string;
  size: number; // bytes
  thumbnail_url?: string;
}

export interface EventData {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'activity' | 'event';
}

export interface SendMessagePayload {
  conversation_id: number;
  body: string;
  type?: ChatMessage['type'];
  media_url?: string;
}

export type ChatTab = 'recent' | 'main' | 'unread' | 'groups';
