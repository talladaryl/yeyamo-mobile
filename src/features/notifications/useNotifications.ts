// Hooks personnalisés pour les notifications
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { notificationsApi } from './notifications.api';
import type { EntityId } from '@/types/api.types';
import { MOCK_NOTIFICATIONS } from './mockData';
import type { PushTokenRegistration } from './notifications.api';
import type { Notification } from './types';

type NotificationCacheSnapshot = [readonly unknown[], Notification[] | number | undefined][];

function notificationKeys(isDemo: boolean) {
  const source = isDemo ? 'demo' : 'backend';
  return {
    all: ['notifications', source] as const,
    unread: ['notifications', source, 'unread'] as const,
    count: ['notifications', source, 'unread', 'count'] as const,
  };
}

async function snapshotNotifications(queryClient: ReturnType<typeof useQueryClient>, isDemo: boolean): Promise<NotificationCacheSnapshot> {
  const keys = notificationKeys(isDemo);
  await queryClient.cancelQueries({ queryKey: ['notifications'] });
  return [
    [keys.all, queryClient.getQueryData<Notification[]>(keys.all)],
    [keys.unread, queryClient.getQueryData<Notification[]>(keys.unread)],
    [keys.count, queryClient.getQueryData<number>(keys.count)],
  ];
}

function restoreNotifications(queryClient: ReturnType<typeof useQueryClient>, snapshot?: NotificationCacheSnapshot) {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

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
    onMutate: async (id) => {
      const snapshot = await snapshotNotifications(queryClient, isDemo);
      const keys = notificationKeys(isDemo);
      const all = queryClient.getQueryData<Notification[]>(keys.all);
      const wasUnread = all?.some((notification) => notification.id === id && !notification.is_read) ?? false;
      queryClient.setQueryData<Notification[]>(keys.all, (current) => current?.map((notification) => notification.id === id ? { ...notification, is_read: true } : notification));
      queryClient.setQueryData<Notification[]>(keys.unread, (current) => current?.filter((notification) => notification.id !== id));
      if (wasUnread) queryClient.setQueryData<number>(keys.count, (current) => Math.max(0, (current ?? 0) - 1));
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      restoreNotifications(queryClient, context?.snapshot);
    },
    onSettled: () => {
      if (!isDemo) void queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    onMutate: async () => {
      const snapshot = await snapshotNotifications(queryClient, isDemo);
      const keys = notificationKeys(isDemo);
      queryClient.setQueryData<Notification[]>(keys.all, (current) => current?.map((notification) => ({ ...notification, is_read: true })));
      queryClient.setQueryData<Notification[]>(keys.unread, []);
      queryClient.setQueryData<number>(keys.count, 0);
      return { snapshot };
    },
    onError: (_error, _value, context) => {
      restoreNotifications(queryClient, context?.snapshot);
    },
    onSettled: () => {
      if (!isDemo) void queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    onMutate: async (id) => {
      const snapshot = await snapshotNotifications(queryClient, isDemo);
      const keys = notificationKeys(isDemo);
      const current = queryClient.getQueryData<Notification[]>(keys.all) ?? (isDemo ? MOCK_NOTIFICATIONS : []);
      const removedWasUnread = current.some((notification) => notification.id === id && !notification.is_read);
      queryClient.setQueryData<Notification[]>(keys.all, current.filter((notification) => notification.id !== id));
      queryClient.setQueryData<Notification[]>(keys.unread, (unread) => unread?.filter((notification) => notification.id !== id));
      if (removedWasUnread) queryClient.setQueryData<number>(keys.count, (count) => Math.max(0, (count ?? 0) - 1));
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      restoreNotifications(queryClient, context?.snapshot);
    },
    onSettled: () => {
      if (!isDemo) void queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
