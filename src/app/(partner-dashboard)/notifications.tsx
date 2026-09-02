import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { NotificationItem } from '@/components/partner-dashboard/NotificationItem';
import { notifications as initialNotifications } from '@/features/partner-dashboard/mockData';
import { useAuthStore } from '@/features/auth/auth.store';
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '@/features/notifications/useNotifications';
import type { Notification } from '@/features/partner-dashboard/types';

const FILTERS = ['Toutes', 'Non lues', 'Mentions'] as const;
export default function NotificationsScreen() {
  const [filter, setFilter] = useState<string>('Toutes');
  const isDemo = useAuthStore((state) => state.sessionMode === 'demo-partner');
  const { data: backendNotifications } = useNotifications();
  const markOne = useMarkAsRead();
  const markAll = useMarkAllAsRead();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    if (!isDemo && !backendNotifications) return;
    setNotifications(isDemo ? initialNotifications : (backendNotifications ?? []).map((item) => ({
      id: String(item.id),
      type: 'event',
      title: item.title ?? item.content,
      subtitle: item.content,
      timestamp: item.created_at,
      icon: 'notifications',
      iconColor: '#8B5CF6',
      read: item.is_read,
    })));
  }, [backendNotifications, isDemo]);
  const data = useMemo(() => filter === 'Non lues' ? notifications.filter((item) => !item.read) : notifications, [filter, notifications]);
  const markAllRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    markAll.mutate();
  };
  return (
    <PartnerPage title="Notifications" subtitle="Restez informé de toutes vos activités">
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {notifications.some((item) => !item.read) ? <TouchableOpacity onPress={markAllRead} className="items-end py-2"><Text className="text-xs font-bold text-[#E60012]">Tout marquer comme lu</Text></TouchableOpacity> : null}
      {data.map((item) => <NotificationItem key={item.id} notification={item} onPress={() => {
        setNotifications((items) => items.map((current) => current.id === item.id ? { ...current, read: true } : current));
        markOne.mutate(item.id);
      }} />)}
    </PartnerPage>
  );
}
