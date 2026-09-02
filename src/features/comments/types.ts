import type { EntityId, UserSummary } from '@/types/api.types';

export interface Comment {
  id: EntityId;
  post_id: EntityId;
  user: UserSummary;
  content: string;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  parent_id: EntityId | null;
  created_at: string;
}

export interface CommentReply extends Comment {
  parent_id: EntityId;
}
