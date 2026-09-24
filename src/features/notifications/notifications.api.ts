// API endpoints pour les notifications
import { apiClient } from '@/services/api/client';
import type { EntityId } from '@/types/api.types';
import type { Notification } from './types';

export interface PushTokenRegistration {
  token: string;
  platform: 'ANDROID' | 'IOS';
  deviceId: string;
  appVersion: string;
}

interface BackendNotification {
  id: string;
  eventType: string;
  title: string;
  body: string;
  dataJson: string;
  createdAt: string;
  readAt: string | null;
}

interface NotificationSlice {
  items: BackendNotification[];
}

function asTargetId(value: unknown): string | number | undefined {
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function resolveBackendTarget(eventType: string, data: Record<string, unknown>): Pick<Notification, 'target_id' | 'target_type'> {
  const explicitId = asTargetId(data.targetId);
  const explicitType = toTargetType(data.targetType ?? data.target_type);
  if (explicitId && explicitType) return { target_id: explicitId, target_type: explicitType };

  switch (eventType) {
    case 'PLACE_SUGGESTION_APPROVED':
      return data.canonicalPlaceId
        ? { target_id: asTargetId(data.canonicalPlaceId), target_type: 'place' }
        : { target_id: asTargetId(data.suggestionId), target_type: 'place_suggestion' };
    case 'PLACE_SUGGESTION_REJECTED':
      return { target_id: asTargetId(data.suggestionId), target_type: 'place_suggestion' };
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'BOOKING_COMPLETED':
      return { target_id: asTargetId(data.bookingId), target_type: 'reservation' };
    case 'EVENT_REGISTRATION_CREATED':
    case 'EVENT_REGISTRATION_CANCELLED':
    case 'EVENT_INVITATION_CREATED':
    case 'EVENT_CANCELLED':
    case 'EVENT_COMPLETED':
      return { target_id: asTargetId(data.eventId), target_type: 'event' };
    default:
      return { target_id: explicitId, target_type: explicitType };
  }
}

function mapNotification(item: BackendNotification): Notification {
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(item.dataJson) as Record<string, unknown>;
  } catch {
    data = {};
  }
  const target = resolveBackendTarget(item.eventType, data);
  return {
    id: item.id,
    type: item.eventType,
    title: item.title,
    content: item.body,
    action_url: typeof data.actionUrl === 'string' ? data.actionUrl : undefined,
    ...target,
    target_metadata: data,
    is_read: item.readAt !== null,
    created_at: item.createdAt,
  };
}

function toTargetType(value: unknown): Notification['target_type'] {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'post' || normalized === 'event' || normalized === 'place' || normalized === 'place_suggestion' || normalized === 'reservation' || normalized === 'culture' || normalized === 'challenge' || normalized === 'artwork' || normalized === 'order' || normalized === 'artisan' || normalized === 'story' || normalized === 'experience' || normalized === 'collection' || normalized === 'profile') return normalized;
  return undefined;
}

export const notificationsApi = {
  /**
   * Récupère toutes les notifications de l'utilisateur
   */
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<NotificationSlice>('/notifications');
    return response.data.items.map(mapNotification);
  },

  /**
   * Récupère les notifications non lues
   */
  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<NotificationSlice>('/notifications/unread');
    return response.data.items.map(mapNotification);
  },

  /**
   * Marque une notification comme lue
   */
  markAsRead: async (id: EntityId): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  /**
   * Supprime une notification
   */
  deleteNotification: async (id: EntityId): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Récupère le nombre de notifications non lues
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread/count');
    return response.data.count;
  },
  registerPushToken: async (payload: PushTokenRegistration): Promise<void> => {
    await apiClient.post('/notifications/devices/push-token', payload);
  },
  unregisterPushToken: async (deviceId: string): Promise<void> => {
    await apiClient.delete(`/notifications/devices/push-token/${encodeURIComponent(deviceId)}`);
  },
};
