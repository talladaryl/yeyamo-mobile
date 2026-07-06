// ÉCRAN 7 - Notifications
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { NotificationItem } from '@/components/profile/NotificationItem';
import { useNotifications, useUnreadNotifications, useMarkAllAsRead } from '@/features/notifications/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const { data: allNotifications } = useNotifications();
  const { data: unreadNotifications } = useUnreadNotifications();
  const markAllAsRead = useMarkAllAsRead();

  const displayedNotifications = activeTab === 'all' ? allNotifications : unreadNotifications;

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead} className="p-2">
            <Text className="text-[#EF4444] text-sm font-semibold">Tout lire</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets */}
      <View className="flex-row px-4 pt-4 pb-2 border-b border-[#27272A]">
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'all' ? 'border-[#EF4444]' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'all' ? 'text-[#EF4444]' : 'text-[#A1A1AA]'
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
              activeTab === 'unread' ? 'text-[#EF4444]' : 'text-[#A1A1AA]'
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
                // Navigation selon le type de notification
                if (item.target_type === 'post' && item.target_id) {
                  router.push(`/(post)/${item.target_id}`);
                } else if (item.target_type === 'event' && item.target_id) {
                  router.push(`/(events)/${item.target_id}`);
                } else if (item.target_type === 'place' && item.target_id) {
                  router.push(`/(places)/${item.target_id}`);
                }
              }}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="notifications-outline" size={64} color="#52525B" />
          <Text className="text-white text-lg font-semibold mt-4 text-center">
            {activeTab === 'all' ? 'Aucune notification' : 'Aucune notification non lue'}
          </Text>
          <Text className="text-[#A1A1AA] text-center mt-2">
            Restez informé de toutes vos activités ici
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
