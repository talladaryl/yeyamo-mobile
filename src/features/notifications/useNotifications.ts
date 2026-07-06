// Hooks personnalisés pour les notifications
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from './notifications.api';
import { MOCK_NOTIFICATIONS } from './mockData';

/**
 * Hook pour récupérer toutes les notifications
 */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
    staleTime: 1000 * 60, // 1 minute
    placeholderData: MOCK_NOTIFICATIONS,
  });
}

/**
 * Hook pour récupérer les notifications non lues
 */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationsApi.getUnreadNotifications,
    staleTime: 1000 * 60,
    placeholderData: MOCK_NOTIFICATIONS.filter((n) => !n.is_read),
  });
}

/**
 * Hook pour récupérer le nombre de notifications non lues
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 1000 * 30, // 30 secondes
    placeholderData: MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,
  });
}

/**
 * Hook pour marquer une notification comme lue
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook pour marquer toutes les notifications comme lues
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook pour supprimer une notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
