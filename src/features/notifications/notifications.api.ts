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

function mapNotification(item: BackendNotification): Notification {
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(item.dataJson) as Record<string, unknown>;
  } catch {
    data = {};
  }
  return {
    id: item.id,
    type: item.eventType,
    title: item.title,
    content: item.body,
    action_url: typeof data.actionUrl === 'string' ? data.actionUrl : undefined,
    target_id:
      typeof data.targetId === 'string' || typeof data.targetId === 'number'
        ? data.targetId
        : undefined,
    target_type: toTargetType(data.targetType ?? data.target_type),
    is_read: item.readAt !== null,
    created_at: item.createdAt,
  };
}

function toTargetType(value: unknown): Notification['target_type'] {
  if (value === 'post' || value === 'event' || value === 'place' || value === 'reservation' || value === 'culture' || value === 'challenge' || value === 'artwork' || value === 'order' || value === 'artisan') return value;
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
