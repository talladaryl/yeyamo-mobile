import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import type { Notification } from '@/features/notifications/types';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

const iconConfig: Record<Notification['type'], { name: string; color: string }> = {
  like: { name: 'heart', color: '#EF4444' },
  comment: { name: 'chatbubble', color: '#3B82F6' },
  follow: { name: 'person-add', color: '#10B981' },
  event_invitation: { name: 'calendar', color: '#8B5CF6' },
  event_reminder: { name: 'notifications', color: '#F59E0B' },
  new_place: { name: 'location', color: '#06B6D4' },
  reservation_confirmed: { name: 'checkmark-circle', color: '#10B981' },
};

function getTimeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (diff < 60) return "A l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;

  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const icon = iconConfig[notification.type];

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-start px-4 py-4 border-b border-[#27272A] ${
        !notification.is_read ? 'bg-[#161616]' : 'bg-transparent'
      }`}
      activeOpacity={0.7}
    >
      {notification.user?.avatar_url ? (
        <Avatar
          uri={notification.user.avatar_url}
          displayName={notification.user.display_name}
          size={40}
        />
      ) : (
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${icon.color}20` }}
        >
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
      )}

      <View className="flex-1 ml-3">
        <Text className="text-white text-sm font-semibold mb-0.5">
          {notification.title ?? notification.user?.display_name ?? 'Yeyamo'}
        </Text>
        <Text className="text-[#A1A1AA] text-sm" numberOfLines={2}>
          {notification.content}
        </Text>
        <Text className="text-[#71717A] text-xs mt-1">
          {getTimeAgo(notification.created_at)}
        </Text>
      </View>

      {!notification.is_read && (
        <View className="w-2 h-2 rounded-full bg-[#EF4444] ml-2 mt-2" />
      )}
    </TouchableOpacity>
  );
}
