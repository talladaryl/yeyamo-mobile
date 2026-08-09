// Types pour les notifications
import type { EntityId, UserSummary } from '@/types/api.types';

export interface Notification {
  id: EntityId;
  type:
    | 'like'
    | 'comment'
    | 'follow'
    | 'event_invitation'
    | 'event_reminder'
    | 'new_place'
    | 'reservation_confirmed'
    | 'CULTURE_CONTRIBUTION_APPROVED'
    | 'CULTURE_CONTRIBUTION_REJECTED'
    | 'TRANSLATION_VERIFIED'
    | 'CHALLENGE_STARTED'
    | 'CHALLENGE_RESULT'
    | 'ARTWORK_LIKED'
    | 'ARTWORK_SOLD'
    | 'ARTWORK_ORDER_CREATED'
    | 'ARTWORK_ORDER_UPDATED'
    | 'ARTISAN_FOLLOWED'
    | 'AUTHENTICITY_VERIFIED'
    | string;
  user?: UserSummary;
  title?: string;
  content: string;
  action_url?: string;
  target_id?: EntityId;
  target_type?: 'post' | 'event' | 'place' | 'reservation' | 'culture' | 'challenge' | 'artwork' | 'order' | 'artisan';
  is_read: boolean;
  created_at: string;
}

export type NotificationTab = 'all' | 'unread';

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}
