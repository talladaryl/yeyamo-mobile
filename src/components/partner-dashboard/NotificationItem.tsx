import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { Notification } from '@/features/partner-dashboard/types';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-start gap-3 p-4 border-b border-[#E4E4E7] dark:border-[#27272A] ${
        !notification.read ? 'bg-white dark:bg-[#161616]' : 'bg-transparent'
      }`}
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
        <Text className="text-[#18181B] dark:text-white font-semibold text-sm mb-0.5">
          {notification.title}
        </Text>
        <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mb-1">
          {notification.subtitle}
        </Text>
        <Text className="text-[#71717A] text-xs">
          {notification.timestamp}
        </Text>
      </View>

      {!notification.read && (
        <View className="w-2 h-2 bg-[#EF4444] rounded-full mt-1" />
      )}
    </TouchableOpacity>
  );
}
