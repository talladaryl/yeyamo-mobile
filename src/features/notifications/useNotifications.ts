// Hooks personnalisés pour les notifications
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { notificationsApi } from './notifications.api';
import type { EntityId } from '@/types/api.types';
import { MOCK_NOTIFICATIONS } from './mockData';
import type { PushTokenRegistration } from './notifications.api';
import type { Notification } from './types';

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
    onMutate: (id) => {
      if (!isDemo) return;
      const allKey = ['notifications', 'demo'];
      const unreadKey = ['notifications', 'demo', 'unread'];
      const countKey = ['notifications', 'demo', 'unread', 'count'];
      queryClient.setQueryData<Notification[]>(allKey, (current = MOCK_NOTIFICATIONS) => current.map((notification) => notification.id === id ? { ...notification, is_read: true } : notification));
      queryClient.setQueryData<Notification[]>(unreadKey, (current = MOCK_NOTIFICATIONS.filter((notification) => !notification.is_read)) => current.filter((notification) => notification.id !== id));
      queryClient.setQueryData<number>(countKey, (current = 0) => Math.max(0, current - 1));
    },
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    onMutate: () => {
      if (!isDemo) return;
      queryClient.setQueryData<Notification[]>(['notifications', 'demo'], (current = MOCK_NOTIFICATIONS) => current.map((notification) => ({ ...notification, is_read: true })));
      queryClient.setQueryData<Notification[]>(['notifications', 'demo', 'unread'], []);
      queryClient.setQueryData<number>(['notifications', 'demo', 'unread', 'count'], 0);
    },
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    onMutate: (id) => {
      if (!isDemo) return;
      const current = queryClient.getQueryData<Notification[]>(['notifications', 'demo']) ?? MOCK_NOTIFICATIONS;
      const removedWasUnread = current.some((notification) => notification.id === id && !notification.is_read);
      queryClient.setQueryData<Notification[]>(['notifications', 'demo'], current.filter((notification) => notification.id !== id));
      queryClient.setQueryData<Notification[]>(['notifications', 'demo', 'unread'], (unread = []) => unread.filter((notification) => notification.id !== id));
      if (removedWasUnread) queryClient.setQueryData<number>(['notifications', 'demo', 'unread', 'count'], (count = 0) => Math.max(0, count - 1));
    },
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: (payload: PushTokenRegistration) => notificationsApi.registerPushToken(payload),
    retry: 1,
  });
}

export function useUnregisterPushToken() {
  return useMutation({
    mutationFn: (deviceId: string) => notificationsApi.unregisterPushToken(deviceId),
    retry: 0,
  });
}
