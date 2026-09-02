// ÉCRAN 7 - Notifications
import { Alert, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { NotificationItem } from '@/components/profile/NotificationItem';
import { useNotifications, useUnreadNotifications, useMarkAllAsRead, useMarkAsRead } from '@/features/notifications/useNotifications';
import { useThemeStore } from '@/features/theme/theme.store';
import { resolveResourceRoute } from '@/utils/resource-route';

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const { data: allNotifications } = useNotifications();
  const { data: unreadNotifications } = useUnreadNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();

  const displayedNotifications = activeTab === 'all' ? allNotifications : unreadNotifications;

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead} className="p-2">
            <Text className="text-[#EF4444] text-sm font-semibold">Tout lire</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets */}
      <View className="flex-row px-4 pt-4 pb-2 border-b" style={{ borderColor: colors.border }}>
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'all' ? 'border-[#EF4444]' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'all' ? 'text-[#EF4444]' : 'text-[#52525B] dark:text-[#A1A1AA]'
            }`}
          >
            Toutes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('unread')}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'unread' ? 'border-[#EF4444]' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'unread' ? 'text-[#EF4444]' : 'text-[#52525B] dark:text-[#A1A1AA]'
            }`}
          >
            Non lues
            {unreadNotifications && unreadNotifications.length > 0 && (
              <Text className="text-[#EF4444]"> ({unreadNotifications.length})</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des notifications */}
      {displayedNotifications && displayedNotifications.length > 0 ? (
        <FlatList
          data={displayedNotifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => {
                markAsRead.mutate(item.id);
                const resolution = resolveResourceRoute({
                  type: item.target_type,
                  id: item.target_id,
                  metadata: item.target_metadata,
                });
                if (resolution.href) {
                  router.push(resolution.href as never);
                  return;
                }
                Alert.alert('Contenu indisponible', "Ce contenu n'est plus disponible ou ne peut pas être ouvert depuis cette notification.");
              }}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
          <Text className="text-lg font-semibold mt-4 text-center" style={{ color: colors.text }}>
            {activeTab === 'all' ? 'Aucune notification' : 'Aucune notification non lue'}
          </Text>
          <Text className="text-center mt-2" style={{ color: colors.textSecondary }}>
            Restez informé de toutes vos activités ici
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
