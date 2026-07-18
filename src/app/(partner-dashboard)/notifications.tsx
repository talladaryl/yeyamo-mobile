import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { NotificationItem } from '@/components/partner-dashboard/NotificationItem';
import { notifications } from '@/features/partner-dashboard/mockData';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-4 pt-3 pb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text className="text-[#18181B] dark:text-white text-2xl font-bold">NOTIFICATIONS</Text>
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">
                Restez informé des activités
              </Text>
            </View>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            className="self-end"
            activeOpacity={0.7}
          >
            <Text className="text-[#EF4444] text-sm font-semibold">
              Tout marquer comme lu
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onPress={() => console.log('Open notification:', notification.id)}
          />
        ))}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
