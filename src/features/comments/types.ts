import type { UserSummary } from '@/types/api.types';

export interface Comment {
  id: number;
  post_id: number;
  user: UserSummary;
  content: string;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  parent_id: number | null;
  created_at: string;
}

export interface CommentReply extends Comment {
  parent_id: number;
}
