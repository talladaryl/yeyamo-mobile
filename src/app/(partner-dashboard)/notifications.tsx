import { useMemo, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { NotificationItem } from '@/components/partner-dashboard/NotificationItem';
import { notifications as initialNotifications } from '@/features/partner-dashboard/mockData';

const FILTERS = ['Toutes', 'Non lues', 'Mentions'] as const;
export default function NotificationsScreen() {
  const [filter, setFilter] = useState<string>('Toutes');
  const [notifications, setNotifications] = useState(initialNotifications);
  const data = useMemo(() => filter === 'Non lues' ? notifications.filter((item) => !item.read) : notifications, [filter, notifications]);
  const markAllRead = () => setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  return (
    <PartnerPage title="Notifications" subtitle="Restez informé de toutes vos activités">
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {notifications.some((item) => !item.read) ? <TouchableOpacity onPress={markAllRead} className="items-end py-2"><Text className="text-xs font-bold text-[#E60012]">Tout marquer comme lu</Text></TouchableOpacity> : null}
      {data.map((item) => <NotificationItem key={item.id} notification={item} onPress={() => setNotifications((items) => items.map((current) => current.id === item.id ? { ...current, read: true } : current))} />)}
    </PartnerPage>
  );
}
