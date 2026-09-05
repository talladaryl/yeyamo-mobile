import { useMemo, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useYeyamoTabBarHeight } from '@/components/navigation/useYeyamoTabBarHeight';
import { useRouter } from 'expo-router';
import { NotificationItem } from '@/components/profile/NotificationItem';
import { Icon } from '@/components/ui/Icon';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '@/features/notifications/useNotifications';
import { useThemeStore } from '@/features/theme/theme.store';
import type { EntityId } from '@/types/api.types';
import { resolveResourceRoute } from '@/utils/resource-route';

type NotificationFilter = 'all' | 'unread';

export function InboxNotifications() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const tabBarHeight = useYeyamoTabBarHeight();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [locallyReadIds, setLocallyReadIds] = useState<Set<EntityId>>(new Set());

  const normalized = useMemo(() => notifications.map((notification) => ({
    ...notification,
    is_read: notification.is_read || locallyReadIds.has(notification.id),
  })), [locallyReadIds, notifications]);
  const unreadCount = normalized.filter((notification) => !notification.is_read).length;
  const displayed = filter === 'unread' ? normalized.filter((notification) => !notification.is_read) : normalized;

  const readOne = (id: EntityId) => {
    setLocallyReadIds((current) => new Set(current).add(id));
    markAsRead.mutate(id);
  };

  const readAll = () => {
    setLocallyReadIds(new Set(notifications.map((notification) => notification.id)));
    markAllAsRead.mutate();
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <View className="flex-1 flex-row rounded-2xl p-1" style={{ backgroundColor: colors.elevated }}>
          <FilterButton label="Toutes" active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterButton label={`Non lues${unreadCount ? ` (${unreadCount})` : ''}`} active={filter === 'unread'} onPress={() => setFilter('unread')} />
        </View>
        {unreadCount ? (
          <TouchableOpacity onPress={readAll} className="ml-3 px-1 py-2" accessibilityLabel="Tout marquer comme lu">
            <Text className="text-xs font-extrabold text-[#EF4444]">Tout lire</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24, flexGrow: displayed.length ? undefined : 1 }}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => {
              readOne(item.id);
              const resolution = resolveResourceRoute({ type: item.target_type, id: item.target_id, metadata: item.target_metadata });
              if (resolution.href) router.push(resolution.href as never);
              else Alert.alert('Information', "Cette notification ne possède pas de destination disponible.");
            }}
          />
        )}
        ListEmptyComponent={(
          <View className="flex-1 items-center justify-center px-8 pb-24">
            <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
              <Icon name={isLoading ? 'hourglass-outline' : 'notifications-off-outline'} size={31} color={colors.textMuted} />
            </View>
            <Text className="mt-4 text-lg font-bold" style={{ color: colors.text }}>{isLoading ? 'Chargement…' : 'Vous êtes à jour'}</Text>
            {!isLoading ? <Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>Les nouvelles interactions, activités et informations Yeyamo apparaîtront ici.</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

function FilterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} className="flex-1 items-center rounded-xl py-2.5" style={{ backgroundColor: active ? colors.card : 'transparent' }}>
      <Text className="text-xs font-extrabold" style={{ color: active ? colors.primary : colors.textSecondary }}>{label}</Text>
    </TouchableOpacity>
  );
}
