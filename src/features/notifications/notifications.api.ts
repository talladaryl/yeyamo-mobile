// API endpoints pour les notifications
import { apiClient } from '@/services/api/client';
import type { Notification } from './types';

export const notificationsApi = {
  /**
   * Récupère toutes les notifications de l'utilisateur
   */
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<{ data: Notification[] }>('/notifications');
    return response.data.data;
  },

  /**
   * Récupère les notifications non lues
   */
  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<{ data: Notification[] }>('/notifications/unread');
    return response.data.data;
  },

  /**
   * Marque une notification comme lue
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  /**
   * Supprime une notification
   */
  deleteNotification: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Récupère le nombre de notifications non lues
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ data: { count: number } }>('/notifications/unread/count');
    return response.data.data.count;
  },
};
