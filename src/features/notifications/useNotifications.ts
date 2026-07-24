// Hooks personnalisés pour les notifications
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { notificationsApi } from './notifications.api';
import type { EntityId } from '@/types/api.types';
import { MOCK_NOTIFICATIONS } from './mockData';

/**
 * Hook pour récupérer toutes les notifications
 */
export function useNotifications() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['notifications', isDemo ? 'demo' : 'backend'],
    queryFn: () =>
      isDemo ? Promise.resolve(MOCK_NOTIFICATIONS) : notificationsApi.getNotifications(),
    staleTime: 1000 * 60, // 1 minute
    placeholderData: isDemo ? MOCK_NOTIFICATIONS : undefined,
  });
}

/**
 * Hook pour récupérer les notifications non lues
 */
export function useUnreadNotifications() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['notifications', isDemo ? 'demo' : 'backend', 'unread'],
    queryFn: () =>
      isDemo
        ? Promise.resolve(MOCK_NOTIFICATIONS.filter((n) => !n.is_read))
        : notificationsApi.getUnreadNotifications(),
    staleTime: 1000 * 60,
    placeholderData: isDemo ? MOCK_NOTIFICATIONS.filter((n) => !n.is_read) : undefined,
  });
}

/**
 * Hook pour récupérer le nombre de notifications non lues
 */
export function useUnreadCount() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['notifications', isDemo ? 'demo' : 'backend', 'unread', 'count'],
    queryFn: () =>
      isDemo
        ? Promise.resolve(MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length)
        : notificationsApi.getUnreadCount(),
    staleTime: 1000 * 30, // 30 secondes
    placeholderData: isDemo ? MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length : undefined,
  });
}

/**
 * Hook pour marquer une notification comme lue
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: (id: EntityId) =>
      isDemo ? Promise.resolve() : notificationsApi.markAsRead(id),
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
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: () =>
      isDemo ? Promise.resolve() : notificationsApi.markAllAsRead(),
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
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: (id: EntityId) =>
      isDemo ? Promise.resolve() : notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
