// Types pour les notifications
import type { UserSummary } from '@/types/api.types';

export interface Notification {
  id: number;
  type:
    | 'like'
    | 'comment'
    | 'follow'
    | 'event_invitation'
    | 'event_reminder'
    | 'new_place'
    | 'reservation_confirmed';
  user?: UserSummary;
  title?: string;
  content: string;
  action_url?: string;
  target_id?: number;
  target_type?: 'post' | 'event' | 'place' | 'reservation';
  is_read: boolean;
  created_at: string;
}

export type NotificationTab = 'all' | 'unread';

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}
