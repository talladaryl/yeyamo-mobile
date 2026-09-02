import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { Notification } from '@/features/partner-dashboard/types';
import { useThemeStore } from '@/features/theme/theme.store';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-start gap-3 border-b p-4"
      style={{ borderColor: colors.border, backgroundColor: notification.read ? 'transparent' : colors.card }}
      activeOpacity={0.8}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: `${notification.iconColor}20` }}
      >
        <Icon
          library="ionicons"
          name={notification.icon as any}
          size={20}
          color={notification.iconColor}
        />
      </View>

      <View className="flex-1">
        <Text className="mb-0.5 text-sm font-semibold" style={{ color: colors.text }}>
          {notification.title}
        </Text>
        <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
          {notification.subtitle}
        </Text>
        <Text className="text-xs" style={{ color: colors.textMuted }}>
          {notification.timestamp}
        </Text>
      </View>

      {!notification.read && (
        <View className="w-2 h-2 bg-[#EF4444] rounded-full mt-1" />
      )}
    </TouchableOpacity>
  );
}
